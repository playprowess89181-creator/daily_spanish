from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_exercises),
    path('stats', views.stats),
    path('parse', views.parse),
    path('upload', views.upload),
    path('images', views.images),
]
