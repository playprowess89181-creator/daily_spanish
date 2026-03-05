from django.contrib import admin
from .models import Vocabulary, Exercise, LessonContent


@admin.register(Vocabulary)
class VocabularyAdmin(admin.ModelAdmin):
    list_display = ('word', 'image', 'created_at')
    search_fields = ('word',)


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('type', 'question', 'answer', 'created_at')
    search_fields = ('question', 'answer')
    list_filter = ('type',)


@admin.register(LessonContent)
class LessonContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at')
    search_fields = ('title', 'created_by__email')

