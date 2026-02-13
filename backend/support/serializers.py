from rest_framework import serializers
from .models import SupportThread, SupportMessage


class SupportMessageSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_email = serializers.SerializerMethodField()

    class Meta:
        model = SupportMessage
        fields = ['id', 'side', 'content', 'created_at', 'author_name', 'author_email']

    def get_author_name(self, obj):
        return getattr(obj.author, 'name', None) or getattr(obj.author, 'nickname', None) or obj.author.email

    def get_author_email(self, obj):
        return obj.author.email


class SupportThreadSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source='user.id', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = SupportThread
        fields = ['id', 'title', 'status', 'created_at', 'updated_at', 'user_id', 'user_name', 'user_email', 'last_message']

    def get_user_name(self, obj):
        return getattr(obj.user, 'name', None) or getattr(obj.user, 'nickname', None) or obj.user.email

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if not msg:
            return None
        return SupportMessageSerializer(msg).data

