from rest_framework import serializers
from .models import DailyRoutineExerciseSet, DailyRoutineEntry


class DailyRoutineEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyRoutineEntry
        fields = ['id', 'spanish_sentence', 'english_sentence', 'created_at']


class DailyRoutineExerciseSetSerializer(serializers.ModelSerializer):
    sentence_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = DailyRoutineExerciseSet
        fields = ['id', 'title', 'sentence_count', 'created_at']


class DailyRoutineExerciseSetDetailSerializer(serializers.ModelSerializer):
    entries = DailyRoutineEntrySerializer(many=True, read_only=True)

    class Meta:
        model = DailyRoutineExerciseSet
        fields = ['id', 'title', 'entries', 'created_at']

