from django.db import models
from django.utils import timezone
from django.conf import settings


class LessonContent(models.Model):
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_contents')
    created_at = models.DateTimeField(default=timezone.now)


class Vocabulary(models.Model):
    word = models.CharField(max_length=255, unique=True)
    image = models.ImageField(upload_to='vocabulary_images/')
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

