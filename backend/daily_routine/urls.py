from django.urls import path
from . import views

urlpatterns = [
    path('exercise-sets', views.exercise_sets),
    path('exercise-sets/<int:set_id>', views.exercise_set_detail),
    path('progress', views.progress_summary),
    path('progress/<int:set_id>/complete', views.mark_completed),
]
