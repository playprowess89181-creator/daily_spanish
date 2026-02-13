from django.db import models
from django.utils import timezone
from django.conf import settings
import uuid


def generate_thread_id():
    return f"thread_{uuid.uuid4().hex[:18]}"


class SupportThread(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=generate_thread_id)
    title = models.CharField(max_length=255)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_threads')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.id})"


class SupportMessage(models.Model):
    THREAD_SIDE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]

    thread = models.ForeignKey(SupportThread, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_messages')
    side = models.CharField(max_length=10, choices=THREAD_SIDE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['created_at']

