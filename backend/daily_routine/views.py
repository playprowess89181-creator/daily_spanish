from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from django.db import transaction
from django.db.models import Count
import re
from django.utils import timezone

from .models import DailyRoutineExerciseSet, DailyRoutineEntry, DailyRoutineExerciseProgress
from .serializers import DailyRoutineExerciseSetSerializer, DailyRoutineExerciseSetDetailSerializer


def _next_exercise_title():
    titles = DailyRoutineExerciseSet.objects.values_list('title', flat=True)
    max_n = 0
    for t in titles:
        if not isinstance(t, str):
            continue
        m = re.match(r'^\s*Exercise\s+(\d+)\s*$', t, flags=re.IGNORECASE)
        if not m:
            continue
        try:
            max_n = max(max_n, int(m.group(1)))
        except Exception:
            continue
    return f'Exercise {max_n + 1}'


def _parse_sentences_payload(payload):
    if not isinstance(payload, list):
        return []
    out = []
    for row in payload:
        if not isinstance(row, dict):
            continue
        es = (row.get('spanish_sentence') or '').strip()
        en = (row.get('english_sentence') or '').strip()
        if not es or not en:
            continue
        out.append((es, en))
    return out


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def exercise_sets(request):
    if request.method == 'GET':
        qs = DailyRoutineExerciseSet.objects.annotate(sentence_count=Count('entries')).order_by('-created_at')
        return Response(DailyRoutineExerciseSetSerializer(qs, many=True).data)

    items = _parse_sentences_payload(request.data.get('sentences'))
    if not items:
        return Response({'detail': 'No sentences provided'}, status=status.HTTP_400_BAD_REQUEST)

    seen = set()
    valid = []
    for es, en in items:
        key = es.lower()
        if key in seen:
            continue
        seen.add(key)
        valid.append((es, en))

    if not valid:
        return Response({'detail': 'No valid rows'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        ex_set = DailyRoutineExerciseSet.objects.create(title=_next_exercise_title(), created_by=request.user)
        DailyRoutineEntry.objects.bulk_create([
            DailyRoutineEntry(exercise_set=ex_set, spanish_sentence=es, english_sentence=en) for (es, en) in valid
        ])
    return Response(DailyRoutineExerciseSetDetailSerializer(ex_set).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def exercise_set_detail(request, set_id: int):
    try:
        ex_set = DailyRoutineExerciseSet.objects.get(pk=set_id)
    except DailyRoutineExerciseSet.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(DailyRoutineExerciseSetDetailSerializer(ex_set).data)

    if request.method == 'DELETE':
        ex_set.delete()
        return Response({'detail': 'Deleted'}, status=status.HTTP_200_OK)

    items = _parse_sentences_payload(request.data.get('sentences'))
    if not items:
        return Response({'detail': 'No sentences provided'}, status=status.HTTP_400_BAD_REQUEST)

    seen = set()
    valid = []
    for es, en in items:
        key = es.lower()
        if key in seen:
            continue
        seen.add(key)
        valid.append((es, en))

    if not valid:
        return Response({'detail': 'No valid rows'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        DailyRoutineEntry.objects.filter(exercise_set=ex_set).delete()
        DailyRoutineEntry.objects.bulk_create([
            DailyRoutineEntry(exercise_set=ex_set, spanish_sentence=es, english_sentence=en) for (es, en) in valid
        ])
    return Response(DailyRoutineExerciseSetDetailSerializer(ex_set).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def progress_summary(request):
    total = DailyRoutineExerciseSet.objects.count()
    completed = DailyRoutineExerciseProgress.objects.filter(user=request.user, completed_at__isnull=False).count()
    return Response({'total': total, 'completed': completed})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def mark_completed(request, set_id: int):
    try:
        ex_set = DailyRoutineExerciseSet.objects.get(pk=set_id)
    except DailyRoutineExerciseSet.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    correct = request.data.get('correct_count')
    total = request.data.get('total_count')
    try:
        correct_n = int(correct) if correct is not None else 0
        total_n = int(total) if total is not None else 0
    except Exception:
        return Response({'detail': 'Invalid counts'}, status=status.HTTP_400_BAD_REQUEST)

    obj, _ = DailyRoutineExerciseProgress.objects.get_or_create(user=request.user, exercise_set=ex_set)
    obj.correct_count = max(0, correct_n)
    obj.total_count = max(0, total_n)
    obj.completed_at = timezone.now()
    obj.updated_at = timezone.now()
    obj.save(update_fields=['correct_count', 'total_count', 'completed_at', 'updated_at'])
    return Response({'detail': 'Saved'})
