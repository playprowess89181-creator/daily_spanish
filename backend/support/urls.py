from django.urls import path
from . import views

urlpatterns = [
    path('threads/', views.list_or_create_threads, name='support_threads'),
    path('threads/<str:thread_id>/', views.get_thread_detail, name='support_thread_detail'),
    path('threads/<str:thread_id>/messages/', views.list_or_create_messages, name='support_thread_messages'),
    path('threads/<str:thread_id>/close/', views.close_thread, name='support_thread_close'),
]

