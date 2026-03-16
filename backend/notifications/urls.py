from django.urls import path
from . import views

urlpatterns = [
    path('admin/notifications/', views.admin_notifications, name='admin_notifications'),
    path('admin/notifications/<str:notification_id>/delete/', views.admin_delete_notification, name='admin_delete_notification'),
    path('admin/audience/preview/', views.admin_audience_preview, name='admin_audience_preview'),
    path('admin/options/', views.admin_filter_options, name='admin_filter_options'),

    path('my/', views.my_notifications, name='my_notifications'),
    path('my/<str:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('my/read-all/', views.mark_all_read, name='mark_all_read'),
    path('my/<str:notification_id>/delete/', views.delete_my_notification, name='delete_my_notification'),
]
