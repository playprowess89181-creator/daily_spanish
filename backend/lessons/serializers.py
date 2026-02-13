from rest_framework import serializers
from .models import Lesson, LessonPart


class LessonPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonPart
        fields = ['id', 'name', 'file', 'created_at']


class LessonSerializer(serializers.ModelSerializer):
    parts = LessonPartSerializer(many=True, read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'block', 'created_by_email', 'created_at', 'updated_at', 'parts']

