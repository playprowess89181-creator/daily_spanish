from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from django.db.models import Count
from django.utils.text import slugify
from .models import Vocabulary, Exercise, LessonContent, VocabularyExerciseSet, VocabularyEntry, VocabularyExerciseProgress
from .serializers import ExerciseSerializer, VocabularyExerciseSetSerializer, VocabularyExerciseSetDetailSerializer
from .services.document_parser import parse_text_lines
import os
import re
import hashlib
from io import BytesIO
import random
from django.utils import timezone

IMAGES_SUBDIR = 'exercise_images'
LEGACY_IMAGES_SUBDIR = 'vocabulary_images'
AUDIO_SUBDIR = 'exercise_audio'

def _ensure_images_dir():
    try:
        os.makedirs(os.path.join(settings.MEDIA_ROOT, IMAGES_SUBDIR), exist_ok=True)
    except Exception:
        pass

def _list_dir_names(subdir: str):
    dir_path = os.path.join(settings.MEDIA_ROOT, subdir)
    try:
        return {f for f in os.listdir(dir_path) if os.path.isfile(os.path.join(dir_path, f))}
    except Exception:
        return set()

def _migrate_legacy_images():
    _ensure_images_dir()
    legacy_dir = os.path.join(settings.MEDIA_ROOT, LEGACY_IMAGES_SUBDIR)
    try:
        legacy_names = [f for f in os.listdir(legacy_dir) if os.path.isfile(os.path.join(legacy_dir, f))]
    except Exception:
        legacy_names = []
    for name in legacy_names:
        safe = os.path.basename(name)
        if safe != name:
            continue
        new_path = os.path.join(IMAGES_SUBDIR, safe)
        if default_storage.exists(new_path):
            continue
        legacy_path = os.path.join(LEGACY_IMAGES_SUBDIR, safe)
        try:
            with default_storage.open(legacy_path, 'rb') as fh:
                default_storage.save(new_path, ContentFile(fh.read()))
        except Exception:
            continue

def _ensure_audio_dir():
    try:
        os.makedirs(os.path.join(settings.MEDIA_ROOT, AUDIO_SUBDIR), exist_ok=True)
    except Exception:
        pass

def _audio_storage_path(word: str):
    raw = (word or '').strip()
    if not raw:
        return None
    h = hashlib.sha1(raw.encode('utf-8')).hexdigest()[:16]
    base = slugify(raw)[:40] or 'word'
    filename = f'{base}-{h}.mp3'
    return os.path.join(AUDIO_SUBDIR, filename)

def _audio_file_name(word: str):
    p = _audio_storage_path(word)
    return os.path.basename(p) if p else None

def _ensure_audio_for_words(words):
    _ensure_audio_dir()
    try:
        from gtts import gTTS
    except Exception:
        return False

    for w in words:
        storage_path = _audio_storage_path(w)
        if not storage_path:
            continue
        if default_storage.exists(storage_path):
            continue
        try:
            tts = gTTS(text=w, lang='es')
            buf = BytesIO()
            tts.write_to_fp(buf)
            buf.seek(0)
            default_storage.save(storage_path, ContentFile(buf.read()))
        except Exception:
            continue
    return True

def _get_random_other_words(exclude_word: str, k: int):
    qs = VocabularyEntry.objects.exclude(word__iexact=exclude_word).values_list('word', flat=True).distinct()
    pool = list(qs)
    if len(pool) <= k:
        return pool
    return random.sample(pool, k)

def _get_random_other_images(exclude_image: str, k: int):
    qs = VocabularyEntry.objects.exclude(image_name=exclude_image).values_list('image_name', flat=True).distinct()
    pool = list(qs)
    if len(pool) <= k:
        return pool
    return random.sample(pool, k)

def _existing_image_names():
    _migrate_legacy_images()
    return _list_dir_names(IMAGES_SUBDIR)

def _preferred_storage_path(name: str):
    safe = os.path.basename(name)
    if safe != name:
        return None
    new_path = os.path.join(IMAGES_SUBDIR, safe)
    if default_storage.exists(new_path):
        return new_path
    legacy_path = os.path.join(LEGACY_IMAGES_SUBDIR, safe)
    if default_storage.exists(legacy_path):
        try:
            with default_storage.open(legacy_path, 'rb') as fh:
                default_storage.save(new_path, ContentFile(fh.read()))
            return new_path
        except Exception:
            return None
    return None

def read_document(file):
    name = file.name.lower()
    if name.endswith('.docx'):
        try:
            from docx import Document
            doc = Document(file)
            lines = []
            for p in doc.paragraphs:
                lines.append(p.text)
            return lines
        except Exception:
            try:
                import zipfile
                import xml.etree.ElementTree as ET
                file.seek(0)
                with zipfile.ZipFile(file) as z:
                    xml_bytes = z.read('word/document.xml')
                root = ET.fromstring(xml_bytes)
                ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                lines = []
                for p in root.findall('.//w:p', ns):
                    texts = []
                    for t in p.findall('.//w:t', ns):
                        if t.text:
                            texts.append(t.text)
                    line = ''.join(texts).strip()
                    if line:
                        lines.append(line)
                return lines
            except Exception:
                return None
    if name.endswith('.pdf'):
        try:
            from pdfminer.high_level import extract_text
            text = extract_text(file)
            return text.splitlines()
        except Exception:
            try:
                import PyPDF2
                file.seek(0)
                reader = PyPDF2.PdfReader(file)
                texts = []
                for page in reader.pages:
                    texts.append(page.extract_text() or '')
                content = '\n'.join(texts)
                return content.splitlines()
            except Exception:
                return None
    return []

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_exercises(request):
    qs = Exercise.objects.select_related('vocabulary').order_by('-created_at')
    return Response(ExerciseSerializer(qs, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats(request):
    return Response({
        'total_words': VocabularyEntry.objects.count(),
        'total_exercises': VocabularyExerciseSet.objects.count(),
        'pending_uploads': 0,
        'errors': 0,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def parse(request):
    document = request.FILES.get('document')
    if not document:
        return Response({'detail': 'Document is required'}, status=status.HTTP_400_BAD_REQUEST)
    lines = read_document(document)
    if lines is None:
        return Response({'detail': 'Document parser is not installed'}, status=status.HTTP_400_BAD_REQUEST)
    if not lines:
        return Response({'detail': 'No readable content found in document'}, status=status.HTTP_400_BAD_REQUEST)
    parsed = parse_text_lines(lines)
    errors = []
    seen_words = set()
    seen_filenames = set()
    image_names = _existing_image_names()
    for v in parsed['vocabulary']:
        w = v.get('word')
        img = v.get('imageName')
        if not w or not img:
            errors.append('Empty word or image name')
        if w in seen_words:
            errors.append(f'Duplicate word: {w}')
        if img in seen_filenames:
            errors.append(f'Duplicate image filename: {img}')
        seen_words.add(w)
        seen_filenames.add(img)
        if img not in image_names:
            errors.append(f'Missing image file: {img}')
    for e in parsed['exercises']:
        t = e.get('type')
        q = e.get('question')
        opts = e.get('options')
        ans = e.get('answer')
        if t not in ['IMAGE_TO_WORD', 'WORD_TO_IMAGE']:
            errors.append(f'Wrong exercise type: {t}')
        if not q or not opts or not ans:
            errors.append('Empty or malformed exercise fields')
        if t == 'IMAGE_TO_WORD' and q not in image_names:
            errors.append(f'Exercise image missing: {q}')
    parsed['errors'] = errors
    if not parsed['vocabulary'] and not parsed['exercises']:
        return Response({'detail': 'No vocabulary or exercises found. Please check the document format.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(parsed)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload(request):
    document = request.FILES.get('document')
    if not document:
        return Response({'detail': 'Document is required'}, status=status.HTTP_400_BAD_REQUEST)
    lines = read_document(document)
    if lines is None:
        return Response({'detail': 'Document parser is not installed'}, status=status.HTTP_400_BAD_REQUEST)
    if not lines:
        return Response({'detail': 'No readable content found in document'}, status=status.HTTP_400_BAD_REQUEST)
    parsed = parse_text_lines(lines)
    errors = []
    available_images = _existing_image_names()
    for v in parsed['vocabulary']:
        w = v.get('word')
        img = v.get('imageName')
        if not w or not img or img not in available_images:
            errors.append(f'Invalid vocabulary entry: {w} / {img}')
    for e in parsed['exercises']:
        t = e.get('type')
        if t not in ['IMAGE_TO_WORD', 'WORD_TO_IMAGE']:
            errors.append(f'Wrong exercise type: {t}')
    if not parsed['vocabulary'] and not parsed['exercises']:
        return Response({'detail': 'No vocabulary or exercises found. Please check the document format.'}, status=status.HTTP_400_BAD_REQUEST)
    if errors:
        return Response({'detail': 'Validation failed', 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
    with transaction.atomic():
        lc = LessonContent.objects.create(title=os.path.splitext(document.name)[0], created_by=request.user)
        vocab_index = {}
        for v in parsed['vocabulary']:
            img_name = v['imageName']
            storage_path = _preferred_storage_path(img_name)
            if not storage_path:
                continue
            vocab = Vocabulary.objects.create(word=v['word'])
            vocab.image.name = storage_path
            vocab.save(update_fields=['image'])
            vocab_index[v['word']] = vocab
        for e in parsed['exercises']:
            vocab = vocab_index.get(e['answer']) if e['type'] == 'IMAGE_TO_WORD' else vocab_index.get(e['question'])
            Exercise.objects.create(
                type=e['type'],
                question=e['question'],
                options=e['options'],
                answer=e['answer'],
                vocabulary=vocab,
                lesson_content=lc,
            )
    return Response({'detail': 'Saved'}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def images(request):
    if request.method == 'GET':
        names = sorted(_existing_image_names())
        return Response({'images': names})
    if request.method == 'DELETE':
        names = request.data.get('images') or []
        if not isinstance(names, list) or len(names) == 0:
            single = request.query_params.get('name')
            if single:
                names = [single]
        if not names:
            return Response({'detail': 'No images specified'}, status=status.HTTP_400_BAD_REQUEST)
        deleted = []
        for name in names:
            # prevent path traversal
            safe = os.path.basename(name)
            if safe != name:
                continue
            storage_paths = [
                os.path.join(IMAGES_SUBDIR, safe),
                os.path.join(LEGACY_IMAGES_SUBDIR, safe),
            ]
            try:
                did_delete = False
                for p in storage_paths:
                    if default_storage.exists(p):
                        default_storage.delete(p)
                        did_delete = True
                if did_delete:
                    deleted.append(safe)
            except Exception:
                continue
        return Response({'detail': 'Deleted', 'images': deleted})
    files = request.FILES.getlist('images')
    if not files:
        return Response({'detail': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
    saved = []
    _ensure_images_dir()
    for f in files:
        name = os.path.basename(f.name)
        if not name:
            continue
        storage_path = os.path.join(IMAGES_SUBDIR, name)
        if default_storage.exists(storage_path):
            default_storage.delete(storage_path)
        default_storage.save(storage_path, f)
        saved.append(name)
    return Response({'detail': 'Uploaded', 'images': saved}, status=status.HTTP_201_CREATED)


def _next_exercise_title():
    titles = VocabularyExerciseSet.objects.values_list('title', flat=True)
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


def _parse_words_payload(payload):
    if not isinstance(payload, list):
        return []
    out = []
    for row in payload:
        if not isinstance(row, dict):
            continue
        w = (row.get('word') or '').strip()
        img = (row.get('image_name') or '').strip()
        if not w or not img:
            continue
        out.append((w, img))
    return out


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def exercise_sets(request):
    if request.method == 'GET':
        qs = VocabularyExerciseSet.objects.annotate(word_count=Count('entries')).order_by('-created_at')
        return Response(VocabularyExerciseSetSerializer(qs, many=True).data)

    items = _parse_words_payload(request.data.get('words'))
    if not items:
        return Response({'detail': 'No words provided'}, status=status.HTTP_400_BAD_REQUEST)

    valid = []
    seen = set()
    for word, img_name in items:
        if word.lower() in seen:
            continue
        storage_path = _preferred_storage_path(img_name)
        if not storage_path:
            continue
        valid.append((word, os.path.basename(img_name)))
        seen.add(word.lower())

    if not valid:
        return Response({'detail': 'No valid rows (missing images)'}, status=status.HTTP_400_BAD_REQUEST)

    _ensure_audio_for_words([w for (w, _) in valid])

    with transaction.atomic():
        ex_set = VocabularyExerciseSet.objects.create(title=_next_exercise_title(), created_by=request.user)
        VocabularyEntry.objects.bulk_create([
            VocabularyEntry(exercise_set=ex_set, word=w, image_name=img) for (w, img) in valid
        ])

    data = VocabularyExerciseSetDetailSerializer(ex_set).data
    return Response(data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def exercise_set_detail(request, set_id: int):
    try:
        ex_set = VocabularyExerciseSet.objects.get(pk=set_id)
    except VocabularyExerciseSet.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(VocabularyExerciseSetDetailSerializer(ex_set).data)

    if request.method == 'DELETE':
        ex_set.delete()
        return Response({'detail': 'Deleted'}, status=status.HTTP_200_OK)

    items = _parse_words_payload(request.data.get('words'))
    valid = []
    seen = set()
    for word, img_name in items:
        if word.lower() in seen:
            continue
        storage_path = _preferred_storage_path(img_name)
        if not storage_path:
            continue
        valid.append((word, os.path.basename(img_name)))
        seen.add(word.lower())

    if not valid:
        return Response({'detail': 'No valid rows (missing images)'}, status=status.HTTP_400_BAD_REQUEST)

    _ensure_audio_for_words([w for (w, _) in valid])

    with transaction.atomic():
        VocabularyEntry.objects.filter(exercise_set=ex_set).delete()
        VocabularyEntry.objects.bulk_create([
            VocabularyEntry(exercise_set=ex_set, word=w, image_name=img) for (w, img) in valid
        ])

    return Response(VocabularyExerciseSetDetailSerializer(ex_set).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exercise_set_questions(request, set_id: int):
    try:
        ex_set = VocabularyExerciseSet.objects.get(pk=set_id)
    except VocabularyExerciseSet.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    entries = list(VocabularyEntry.objects.filter(exercise_set=ex_set).values('word', 'image_name'))
    if not entries:
        return Response({'detail': 'No words in this exercise'}, status=status.HTTP_400_BAD_REQUEST)

    questions = []
    for idx, e in enumerate(entries):
        mode = 'image_to_text' if idx % 2 == 0 else 'audio_to_image'
        if mode == 'image_to_text':
            distractors = _get_random_other_words(e['word'], 2)
            options = [e['word'], *distractors]
            random.shuffle(options)
            questions.append({
                'mode': mode,
                'prompt': {'image_name': e['image_name']},
                'options': [{'word': w} for w in options],
                'answer': {'word': e['word']},
            })
        else:
            distractors = _get_random_other_images(e['image_name'], 2)
            options = [e['image_name'], *distractors]
            random.shuffle(options)
            questions.append({
                'mode': mode,
                'prompt': {'audio_name': _audio_file_name(e['word']), 'word': e['word']},
                'options': [{'image_name': n} for n in options],
                'answer': {'image_name': e['image_name']},
            })

    random.shuffle(questions)
    return Response({
        'id': ex_set.id,
        'title': ex_set.title,
        'count': len(questions),
        'questions': questions,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def progress_summary(request):
    total = VocabularyExerciseSet.objects.count()
    completed = VocabularyExerciseProgress.objects.filter(user=request.user, completed_at__isnull=False).count()
    return Response({'total': total, 'completed': completed})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def mark_completed(request, set_id: int):
    try:
        ex_set = VocabularyExerciseSet.objects.get(pk=set_id)
    except VocabularyExerciseSet.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    correct = request.data.get('correct_count')
    total = request.data.get('total_count')
    try:
        correct_n = int(correct) if correct is not None else 0
        total_n = int(total) if total is not None else 0
    except Exception:
        return Response({'detail': 'Invalid counts'}, status=status.HTTP_400_BAD_REQUEST)

    obj, _ = VocabularyExerciseProgress.objects.get_or_create(user=request.user, exercise_set=ex_set)
    obj.correct_count = max(0, correct_n)
    obj.total_count = max(0, total_n)
    obj.completed_at = timezone.now()
    obj.updated_at = timezone.now()
    obj.save(update_fields=['correct_count', 'total_count', 'completed_at', 'updated_at'])
    return Response({'detail': 'Saved'})
