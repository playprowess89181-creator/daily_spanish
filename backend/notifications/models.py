from django.db import models
from django.utils import timezone
from django.conf import settings
import uuid


def generate_notification_id():
    return f"notif_{uuid.uuid4().hex[:18]}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('general', 'General'),
        ('alert', 'Alert'),
        ('course', 'Course'),
        ('system', 'System'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=generate_notification_id)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='general')
    title = models.CharField(max_length=200)
    message = models.TextField()
    audience_filters = models.JSONField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_notifications')
    created_at = models.DateTimeField(default=timezone.now)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']


class NotificationRecipient(models.Model):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='recipients')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_recipients')
    delivered_at = models.DateTimeField(default=timezone.now)
    read_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('notification', 'user')
        ordering = ['-delivered_at']
