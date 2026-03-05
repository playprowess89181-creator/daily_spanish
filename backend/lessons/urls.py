from django.urls import path
from . import views

urlpatterns = [
    path('lessons/', views.list_or_create_lessons, name='lessons_list_create'),
    path('lessons/<str:lesson_id>/', views.lesson_detail, name='lesson_detail'),
    path('stats/', views.lessons_stats, name='lessons_stats'),
]
