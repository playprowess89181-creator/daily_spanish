from django.db import models
from django.utils import timezone
from django.conf import settings


class LessonContent(models.Model):
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_contents')
    created_at = models.DateTimeField(default=timezone.now)


class Vocabulary(models.Model):
    word = models.CharField(max_length=255, unique=True)
    image = models.ImageField(upload_to='exercise_images/')
    created_at = models.DateTimeField(default=timezone.now)


class Exercise(models.Model):
    TYPE_CHOICES = [
        ('IMAGE_TO_WORD', 'IMAGE_TO_WORD'),
        ('WORD_TO_IMAGE', 'WORD_TO_IMAGE'),
    ]

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    question = models.CharField(max_length=255)
    options = models.JSONField(default=list)
    answer = models.CharField(max_length=255)
    vocabulary = models.ForeignKey(Vocabulary, on_delete=models.CASCADE, related_name='exercises', null=True, blank=True)
    lesson_content = models.ForeignKey(LessonContent, on_delete=models.SET_NULL, related_name='exercises', null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('type', 'question')


class VocabularyExerciseSet(models.Model):
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vocabulary_exercise_sets')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']


class VocabularyEntry(models.Model):
    exercise_set = models.ForeignKey(VocabularyExerciseSet, on_delete=models.CASCADE, related_name='entries')
    word = models.CharField(max_length=255)
    image_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('exercise_set', 'word')
        ordering = ['created_at']


class VocabularyExerciseProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vocabulary_exercise_progress')
    exercise_set = models.ForeignKey(VocabularyExerciseSet, on_delete=models.CASCADE, related_name='progress')
    completed_at = models.DateTimeField(null=True, blank=True)
    correct_count = models.IntegerField(default=0)
    total_count = models.IntegerField(default=0)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'exercise_set')
