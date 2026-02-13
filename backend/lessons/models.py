from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


def generate_lesson_id():
    return f"lesson_{uuid.uuid4().hex[:18]}"


class Lesson(models.Model):
    BLOCK_CHOICES = [
        ('A1', 'A1 – Beginner'),
        ('A2', 'A2 – Basic'),
        ('B1', 'B1 – Intermediate'),
        ('B2', 'B2 – Upper Intermediate'),
        ('C1', 'C1 – Advanced'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=generate_lesson_id)
    block = models.CharField(max_length=3, choices=BLOCK_CHOICES)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lessons')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.block} ({self.id})"


class LessonPart(models.Model):
    PART_CHOICES = [
        ('Vocabulary', 'Vocabulary'),
        ('Speech', 'Speech'),
        ('Listening', 'Listening'),
        ('Reading', 'Reading'),
        ('Grammar', 'Grammar'),
        ('Writing', 'Writing'),
        ('Pronunciation', 'Pronunciation'),
        ('Conversation', 'Conversation'),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='parts')
    name = models.CharField(max_length=50, choices=PART_CHOICES)
    file = models.FileField(upload_to='lesson_parts/')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} for {self.lesson_id}"

