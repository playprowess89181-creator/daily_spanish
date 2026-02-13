from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction

from .models import Lesson, LessonPart
from .serializers import LessonSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_or_create_lessons(request):
    if request.method == 'GET':
        qs = Lesson.objects.select_related('created_by').prefetch_related('parts').order_by('-created_at')
        return Response({'lessons': LessonSerializer(qs, many=True).data}, status=status.HTTP_200_OK)

    # POST create
    if not request.user.is_staff:
        return Response({'error': 'Only admins can create lessons'}, status=status.HTTP_403_FORBIDDEN)

    block = (request.data.get('block') or '').strip()
    if block not in dict(Lesson.BLOCK_CHOICES):
        return Response({'error': 'Invalid or missing block'}, status=status.HTTP_400_BAD_REQUEST)

    # Extract parts from request.data and request.FILES
    parts_data = []
    for key, value in request.data.items():
        # Expect keys like parts[0][name]
        if key.startswith('parts[') and key.endswith('][name]'):
            try:
                idx = int(key.split('[')[1].split(']')[0])
            except Exception:
                continue
            parts_data.append({'idx': idx, 'name': (value or '').strip()})

    # Attach files
    for fkey, file in request.FILES.items():
        # Expect keys like parts[0][file]
        if fkey.startswith('parts[') and fkey.endswith('][file]'):
            try:
                idx = int(fkey.split('[')[1].split(']')[0])
            except Exception:
                continue
            for p in parts_data:
                if p['idx'] == idx:
                    p['file'] = file
                    break

    # Validate parts
    valid_part_names = {c[0] for c in LessonPart.PART_CHOICES}
    prepared_parts = []
    for p in sorted(parts_data, key=lambda x: x['idx']):
        name = p.get('name')
        file = p.get('file')
        if not name or name not in valid_part_names:
            return Response({'error': 'Each part must have a valid name'}, status=status.HTTP_400_BAD_REQUEST)
        if not file:
            return Response({'error': 'Each part must include a file'}, status=status.HTTP_400_BAD_REQUEST)
        # File type check (PDF/DOCX)
        ct = getattr(file, 'content_type', '')
        allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if ct not in allowed and not (file.name.lower().endswith('.pdf') or file.name.lower().endswith('.docx')):
            return Response({'error': 'Only PDF or DOCX files are allowed'}, status=status.HTTP_400_BAD_REQUEST)
        prepared_parts.append({'name': name, 'file': file})

    if not prepared_parts:
        return Response({'error': 'Add at least one part'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        lesson = Lesson.objects.create(block=block, created_by=request.user)
        for p in prepared_parts:
            LessonPart.objects.create(lesson=lesson, name=p['name'], file=p['file'])

    return Response({'lesson': LessonSerializer(lesson).data}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def lesson_detail(request, lesson_id: str):
    try:
        lesson = Lesson.objects.select_related('created_by').prefetch_related('parts').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if not request.user.is_staff and lesson.created_by_id != request.user.id:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return Response({'lesson': LessonSerializer(lesson).data}, status=status.HTTP_200_OK)

    if not request.user.is_staff:
        return Response({'error': 'Only admins can modify lessons'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        with transaction.atomic():
            for p in lesson.parts.all():
                try:
                    p.file.delete(save=False)
                except Exception:
                    pass
            lesson.delete()
        return Response({'message': 'Deleted'}, status=status.HTTP_200_OK)

    # PUT update (replace parts)
    block = (request.data.get('block') or '').strip()
    if block and block not in dict(Lesson.BLOCK_CHOICES):
        return Response({'error': 'Invalid block'}, status=status.HTTP_400_BAD_REQUEST)

    parts_data = []
    for key, value in request.data.items():
        if key.startswith('parts[') and key.endswith('][name]'):
            try:
                idx = int(key.split('[')[1].split(']')[0])
            except Exception:
                continue
            parts_data.append({'idx': idx, 'name': (value or '').strip()})

    for fkey, file in request.FILES.items():
        if fkey.startswith('parts[') and fkey.endswith('][file]'):
            try:
                idx = int(fkey.split('[')[1].split(']')[0])
            except Exception:
                continue
            for p in parts_data:
                if p['idx'] == idx:
                    p['file'] = file
                    break

    valid_part_names = {c[0] for c in LessonPart.PART_CHOICES}
    prepared_parts = []
    for p in sorted(parts_data, key=lambda x: x['idx']):
        name = p.get('name')
        file = p.get('file')
        if not name or name not in valid_part_names:
            return Response({'error': 'Each part must have a valid name'}, status=status.HTTP_400_BAD_REQUEST)
        if not file:
            return Response({'error': 'Each part must include a file'}, status=status.HTTP_400_BAD_REQUEST)
        ct = getattr(file, 'content_type', '')
        allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if ct not in allowed and not (file.name.lower().endswith('.pdf') or file.name.lower().endswith('.docx')):
            return Response({'error': 'Only PDF or DOCX files are allowed'}, status=status.HTTP_400_BAD_REQUEST)
        prepared_parts.append({'name': name, 'file': file})

    if not prepared_parts:
        return Response({'error': 'Add at least one part'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        if block:
            lesson.block = block
            lesson.save(update_fields=['block'])
        for p in lesson.parts.all():
            try:
                p.file.delete(save=False)
            except Exception:
                pass
            p.delete()
        for p in prepared_parts:
            LessonPart.objects.create(lesson=lesson, name=p['name'], file=p['file'])

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
    block_counts = {}
    for b in ['A1', 'A2', 'B1', 'B2', 'C1']:
        block_counts[b] = qs.filter(block=b).count()
    parts_count = LessonPart.objects.filter(lesson__in=qs).count()
    listening_lessons = qs.filter(parts__name='Listening').distinct().count()

    return Response({
        'total_lessons': total_lessons,
        'blocks_count': blocks_count,
        'block_counts': block_counts,
        'parts_count': parts_count,
        'listening_lessons': listening_lessons,
    }, status=status.HTTP_200_OK)
