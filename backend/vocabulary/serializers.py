from rest_framework import serializers
from .models import Vocabulary, Exercise, LessonContent, VocabularyExerciseSet, VocabularyEntry


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


class VocabularyEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = VocabularyEntry
        fields = ['id', 'word', 'image_name', 'created_at']


class VocabularyExerciseSetSerializer(serializers.ModelSerializer):
    word_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = VocabularyExerciseSet
        fields = ['id', 'title', 'word_count', 'created_at']


class VocabularyExerciseSetDetailSerializer(serializers.ModelSerializer):
    entries = VocabularyEntrySerializer(many=True, read_only=True)

    class Meta:
        model = VocabularyExerciseSet
        fields = ['id', 'title', 'entries', 'created_at']
