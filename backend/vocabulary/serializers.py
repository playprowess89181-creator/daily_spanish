from rest_framework import serializers
from .models import Vocabulary, Exercise, LessonContent


class VocabularySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vocabulary
        fields = ['id', 'word', 'image', 'created_at']


class ExerciseSerializer(serializers.ModelSerializer):
    vocabulary_word = serializers.CharField(source='vocabulary.word', read_only=True)

    class Meta:
        model = Exercise
        fields = ['id', 'type', 'question', 'options', 'answer', 'vocabulary_word', 'created_at']


class LessonContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonContent
        fields = ['id', 'title', 'created_by', 'created_at']

