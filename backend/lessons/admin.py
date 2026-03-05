from django.contrib import admin
from .models import Lesson


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('id', 'block', 'created_by', 'created_at')
    search_fields = ('id', 'block', 'created_by__email')
    list_filter = ('block',)
