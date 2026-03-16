from django.db import models
from django.utils import timezone
from django.conf import settings


class DailyRoutineExerciseSet(models.Model):
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_routine_exercise_sets')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']


class DailyRoutineEntry(models.Model):
    exercise_set = models.ForeignKey(DailyRoutineExerciseSet, on_delete=models.CASCADE, related_name='entries')
    spanish_sentence = models.TextField()
    english_sentence = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('exercise_set', 'spanish_sentence')
        ordering = ['created_at']


class DailyRoutineExerciseProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_routine_exercise_progress')
    exercise_set = models.ForeignKey(DailyRoutineExerciseSet, on_delete=models.CASCADE, related_name='progress')
    completed_at = models.DateTimeField(null=True, blank=True)
    correct_count = models.IntegerField(default=0)
    total_count = models.IntegerField(default=0)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'exercise_set')
