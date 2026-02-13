from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import SupportThread, SupportMessage
from .serializers import SupportThreadSerializer, SupportMessageSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_or_create_threads(request):
    if request.method == 'GET':
        if request.user.is_staff:
            threads = SupportThread.objects.select_related('user').order_by('-created_at')
        else:
            threads = SupportThread.objects.select_related('user').filter(user=request.user).order_by('-created_at')
        data = SupportThreadSerializer(threads, many=True).data
        return Response({'threads': data}, status=status.HTTP_200_OK)

    if request.method == 'POST':
        title = request.data.get('title', '').strip()
        message = request.data.get('message', '').strip()
        if not title or not message:
            return Response({'error': 'Title and message are required'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            thread = SupportThread.objects.create(title=title, user=request.user)
            SupportMessage.objects.create(
                thread=thread,
                author=request.user,
                side='user',
                content=message,
            )
        return Response({'thread': SupportThreadSerializer(thread).data}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_thread_detail(request, thread_id: str):
    thread = get_object_or_404(SupportThread.objects.select_related('user'), id=thread_id)
    if not (request.user.is_staff or thread.user_id == request.user.id):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    return Response({'thread': SupportThreadSerializer(thread).data}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_or_create_messages(request, thread_id: str):
    thread = get_object_or_404(SupportThread.objects.select_related('user'), id=thread_id)
    if not (request.user.is_staff or thread.user_id == request.user.id):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        messages = thread.messages.select_related('author').order_by('created_at')
        return Response({'messages': SupportMessageSerializer(messages, many=True).data}, status=status.HTTP_200_OK)

    if request.method == 'POST':
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)

        side = 'admin' if request.user.is_staff else 'user'
        msg = SupportMessage.objects.create(thread=thread, author=request.user, side=side, content=content)
        # Auto-reopen thread if admin replies after resolution
        if thread.status in ['resolved', 'closed'] and request.user.is_staff:
            thread.status = 'open'
            thread.save(update_fields=['status'])
        return Response({'message': SupportMessageSerializer(msg).data}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_thread(request, thread_id: str):
    thread = get_object_or_404(SupportThread.objects.select_related('user'), id=thread_id)
    if not request.user.is_staff:
        return Response({'error': 'Only admins can close threads'}, status=status.HTTP_403_FORBIDDEN)
    status_value = request.data.get('status', 'resolved')
    if status_value not in ['resolved', 'closed']:
        status_value = 'resolved'
    thread.status = status_value
    thread.save(update_fields=['status'])
    return Response({'thread': SupportThreadSerializer(thread).data}, status=status.HTTP_200_OK)

