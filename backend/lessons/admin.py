from django.contrib import admin
from .models import Lesson, LessonPart


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('id', 'block', 'created_by', 'created_at')
    search_fields = ('id', 'block', 'created_by__email')
    list_filter = ('block',)


@admin.register(LessonPart)
class LessonPartAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'name', 'file', 'created_at')
    search_fields = ('lesson__id', 'name')
    list_filter = ('name',)

