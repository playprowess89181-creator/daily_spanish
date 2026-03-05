from django.contrib import admin
from .models import SupportThread, SupportMessage


@admin.register(SupportThread)
class SupportThreadAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'status', 'created_at')
    search_fields = ('id', 'title', 'user__email')
    list_filter = ('status',)


@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = ('thread', 'author', 'side', 'created_at')
    search_fields = ('thread__id', 'author__email', 'content')
    list_filter = ('side',)

