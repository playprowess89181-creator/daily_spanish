from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_exercises),
    path('stats', views.stats),
    path('parse', views.parse),
    path('upload', views.upload),
    path('images', views.images),
    path('exercise-sets', views.exercise_sets),
    path('exercise-sets/<int:set_id>', views.exercise_set_detail),
    path('exercise-sets/<int:set_id>/questions', views.exercise_set_questions),
    path('progress', views.progress_summary),
    path('progress/<int:set_id>/complete', views.mark_completed),
]
