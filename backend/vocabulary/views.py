from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from .models import Vocabulary, Exercise, LessonContent
from .serializers import ExerciseSerializer
from .services.document_parser import parse_text_lines
import os

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
        'total_words': Vocabulary.objects.count(),
        'total_exercises': Exercise.objects.count(),
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
    images_dir = os.path.join(settings.MEDIA_ROOT, 'vocabulary_images')
    try:
        image_names = [f for f in os.listdir(images_dir) if os.path.isfile(os.path.join(images_dir, f))]
    except Exception:
        image_names = []
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
    images_dir = os.path.join(settings.MEDIA_ROOT, 'vocabulary_images')
    try:
        available_images = {f for f in os.listdir(images_dir) if os.path.isfile(os.path.join(images_dir, f))}
    except Exception:
        available_images = set()
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
            storage_path = os.path.join('vocabulary_images', img_name)
            if not default_storage.exists(storage_path):
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
    images_dir = os.path.join(settings.MEDIA_ROOT, 'vocabulary_images')
    if request.method == 'GET':
        names = []
        try:
            names = [f for f in os.listdir(images_dir) if os.path.isfile(os.path.join(images_dir, f))]
        except Exception:
            names = []
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
            storage_path = os.path.join('vocabulary_images', safe)
            try:
                if default_storage.exists(storage_path):
                    default_storage.delete(storage_path)
                    deleted.append(safe)
            except Exception:
                continue
        return Response({'detail': 'Deleted', 'images': deleted})
    files = request.FILES.getlist('images')
    if not files:
        return Response({'detail': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
    saved = []
    for f in files:
        name = f.name
        storage_path = os.path.join('vocabulary_images', name)
        if default_storage.exists(storage_path):
            default_storage.delete(storage_path)
        default_storage.save(storage_path, f)
        saved.append(name)
    return Response({'detail': 'Uploaded', 'images': saved}, status=status.HTTP_201_CREATED)
