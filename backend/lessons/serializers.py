from rest_framework import serializers
from .models import Lesson


class LessonSerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    video_type = serializers.SerializerMethodField()
    has_lesson_pdf = serializers.SerializerMethodField()
    has_keys_pdf = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id',
            'block',
            'created_by_email',
            'created_at',
            'updated_at',
            'video_type',
            'video_file',
            'video_url',
            'lesson_pdf',
            'keys_pdf',
            'has_lesson_pdf',
            'has_keys_pdf',
        ]

    def get_video_type(self, obj):
        if getattr(obj, 'video_file', None):
            return 'upload'
        if getattr(obj, 'video_url', None):
            return 'link'
        return None

    def get_has_lesson_pdf(self, obj):
        return bool(getattr(obj, 'lesson_pdf', None))

    def get_has_keys_pdf(self, obj):
        return bool(getattr(obj, 'keys_pdf', None))
