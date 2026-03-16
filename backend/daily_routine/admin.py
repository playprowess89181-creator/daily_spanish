from django.contrib import admin
from .models import DailyRoutineExerciseSet, DailyRoutineEntry


@admin.register(DailyRoutineExerciseSet)
class DailyRoutineExerciseSetAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at')
    search_fields = ('title', 'created_by__email')


@admin.register(DailyRoutineEntry)
class DailyRoutineEntryAdmin(admin.ModelAdmin):
    list_display = ('spanish_sentence', 'english_sentence', 'created_at')
    search_fields = ('spanish_sentence', 'english_sentence')

