from rest_framework import serializers
from .models import Notification, NotificationRecipient


class NotificationSerializer(serializers.ModelSerializer):
    recipients_count = serializers.SerializerMethodField()
    read_count = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'title',
            'message',
            'audience_filters',
            'created_at',
            'sent_at',
            'recipients_count',
            'read_count',
        ]

    def get_recipients_count(self, obj):
        return getattr(obj, '_recipients_count', None) or obj.recipients.count()

    def get_read_count(self, obj):
        return getattr(obj, '_read_count', None) or obj.recipients.filter(read_at__isnull=False, deleted_at__isnull=True).count()


class MyNotificationSerializer(serializers.ModelSerializer):
    notification_id = serializers.CharField(source='notification.id', read_only=True)
    type = serializers.CharField(source='notification.type', read_only=True)
    title = serializers.CharField(source='notification.title', read_only=True)
    message = serializers.CharField(source='notification.message', read_only=True)
    sent_at = serializers.DateTimeField(source='notification.sent_at', read_only=True)
    created_at = serializers.DateTimeField(source='notification.created_at', read_only=True)

    class Meta:
        model = NotificationRecipient
        fields = [
            'notification_id',
            'type',
            'title',
            'message',
            'created_at',
            'sent_at',
            'delivered_at',
            'read_at',
            'deleted_at',
        ]
