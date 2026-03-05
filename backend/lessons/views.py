from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction

from .models import Lesson
from .serializers import LessonSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_or_create_lessons(request):
    if request.method == 'GET':
        qs = Lesson.objects.select_related('created_by').order_by('-created_at')
        return Response({'lessons': LessonSerializer(qs, many=True).data}, status=status.HTTP_200_OK)

    # POST create
    if not request.user.is_staff:
        return Response({'error': 'Only admins can create lessons'}, status=status.HTTP_403_FORBIDDEN)

    block = (request.data.get('block') or '').strip()
    if block not in dict(Lesson.BLOCK_CHOICES):
        return Response({'error': 'Invalid or missing block'}, status=status.HTTP_400_BAD_REQUEST)

    video_file = request.FILES.get('video_file')
    video_url = (request.data.get('video_url') or '').strip() or None
    lesson_pdf = request.FILES.get('lesson_pdf')
    keys_pdf = request.FILES.get('keys_pdf')

    if not video_file and not video_url:
        return Response({'error': 'Provide a video file or a video link'}, status=status.HTTP_400_BAD_REQUEST)

    if video_file:
        ct = getattr(video_file, 'content_type', '') or ''
        if not (ct.startswith('video/') or video_file.name.lower().endswith(('.mp4', '.webm', '.mov', '.m4v', '.ogg'))):
            return Response({'error': 'Only video files are allowed'}, status=status.HTTP_400_BAD_REQUEST)

    if lesson_pdf:
        ct = getattr(lesson_pdf, 'content_type', '') or ''
        if not (ct == 'application/pdf' or lesson_pdf.name.lower().endswith('.pdf')):
            return Response({'error': 'Lesson PDF must be a PDF file'}, status=status.HTTP_400_BAD_REQUEST)

    if keys_pdf:
        ct = getattr(keys_pdf, 'content_type', '') or ''
        if not (ct == 'application/pdf' or keys_pdf.name.lower().endswith('.pdf')):
            return Response({'error': 'Keys PDF must be a PDF file'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        lesson = Lesson.objects.create(
            block=block,
            created_by=request.user,
            video_file=video_file,
            video_url=None if video_file else video_url,
            lesson_pdf=lesson_pdf,
            keys_pdf=keys_pdf,
        )

    return Response({'lesson': LessonSerializer(lesson).data}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def lesson_detail(request, lesson_id: str):
    try:
        lesson = Lesson.objects.select_related('created_by').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({'lesson': LessonSerializer(lesson).data}, status=status.HTTP_200_OK)

    if not request.user.is_staff:
        return Response({'error': 'Only admins can modify lessons'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        with transaction.atomic():
            for f in [lesson.video_file, lesson.lesson_pdf, lesson.keys_pdf]:
                try:
                    if f:
                        f.delete(save=False)
                except Exception:
                    pass
            lesson.delete()
        return Response({'message': 'Deleted'}, status=status.HTTP_200_OK)

    if 'block' in request.data:
        block = (request.data.get('block') or '').strip()
        if block and block != lesson.block:
            return Response({'error': 'Level cannot be changed'}, status=status.HTTP_400_BAD_REQUEST)

    new_video_file = request.FILES.get('video_file')
    new_video_url_raw = request.data.get('video_url', None)
    new_video_url = None
    if new_video_url_raw is not None:
        new_video_url = (new_video_url_raw or '').strip() or None

    new_lesson_pdf = request.FILES.get('lesson_pdf')
    new_keys_pdf = request.FILES.get('keys_pdf')

    if new_video_file:
        ct = getattr(new_video_file, 'content_type', '') or ''
        if not (ct.startswith('video/') or new_video_file.name.lower().endswith(('.mp4', '.webm', '.mov', '.m4v', '.ogg'))):
            return Response({'error': 'Only video files are allowed'}, status=status.HTTP_400_BAD_REQUEST)

    if new_lesson_pdf:
        ct = getattr(new_lesson_pdf, 'content_type', '') or ''
        if not (ct == 'application/pdf' or new_lesson_pdf.name.lower().endswith('.pdf')):
            return Response({'error': 'Lesson PDF must be a PDF file'}, status=status.HTTP_400_BAD_REQUEST)

    if new_keys_pdf:
        ct = getattr(new_keys_pdf, 'content_type', '') or ''
        if not (ct == 'application/pdf' or new_keys_pdf.name.lower().endswith('.pdf')):
            return Response({'error': 'Keys PDF must be a PDF file'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        update_fields = []

        if new_video_file:
            try:
                if lesson.video_file:
                    lesson.video_file.delete(save=False)
            except Exception:
                pass
            lesson.video_file = new_video_file
            lesson.video_url = None
            update_fields.extend(['video_file', 'video_url'])
        elif new_video_url_raw is not None:
            if new_video_url:
                try:
                    if lesson.video_file:
                        lesson.video_file.delete(save=False)
                except Exception:
                    pass
                lesson.video_file = None
            lesson.video_url = new_video_url
            update_fields.extend(['video_file', 'video_url'])

        if new_lesson_pdf:
            try:
                if lesson.lesson_pdf:
                    lesson.lesson_pdf.delete(save=False)
            except Exception:
                pass
            lesson.lesson_pdf = new_lesson_pdf
            update_fields.append('lesson_pdf')

        if new_keys_pdf:
            try:
                if lesson.keys_pdf:
                    lesson.keys_pdf.delete(save=False)
            except Exception:
                pass
            lesson.keys_pdf = new_keys_pdf
            update_fields.append('keys_pdf')

        if not (lesson.video_file or lesson.video_url):
            return Response({'error': 'Provide a video file or a video link'}, status=status.HTTP_400_BAD_REQUEST)

        if update_fields:
            lesson.save(update_fields=list(set(update_fields)))

    lesson.refresh_from_db()
    return Response({'lesson': LessonSerializer(lesson).data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lessons_stats(request):
    qs = Lesson.objects.all()
    if not request.user.is_staff:
        qs = qs.filter(created_by=request.user)

    total_lessons = qs.count()
    blocks = list(qs.values_list('block', flat=True))
    blocks_count = len(set(blocks))
    block_counts = {b: qs.filter(block=b).count() for b in ['A1', 'A2', 'B1', 'B2', 'C1']}
    lessons_with_video_file = qs.exclude(video_file='').exclude(video_file__isnull=True).count()
    lessons_with_video_url = qs.exclude(video_url='').exclude(video_url__isnull=True).count()
    lessons_with_lesson_pdf = qs.exclude(lesson_pdf='').exclude(lesson_pdf__isnull=True).count()
    lessons_with_keys_pdf = qs.exclude(keys_pdf='').exclude(keys_pdf__isnull=True).count()

    return Response({
        'total_lessons': total_lessons,
        'blocks_count': blocks_count,
        'block_counts': block_counts,
        'lessons_with_video_file': lessons_with_video_file,
        'lessons_with_video_url': lessons_with_video_url,
        'lessons_with_lesson_pdf': lessons_with_lesson_pdf,
        'lessons_with_keys_pdf': lessons_with_keys_pdf,
    }, status=status.HTTP_200_OK)
