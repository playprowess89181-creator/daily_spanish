from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Website endpoints (public/user features)
    path('register/', views.register_user, name='register_user'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('resend-otp/', views.resend_otp, name='resend_otp'),
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('profile/', views.get_user_profile, name='get_user_profile'),
    path('profile/update/', views.update_user_profile, name='update_user_profile'),
    path('subscription/status/', views.subscription_status, name='subscription_status'),
    path('subscription/onboarding/', views.save_subscription_onboarding, name='save_subscription_onboarding'),
    path('subscription/placement-test/', views.submit_subscription_placement_test, name='submit_subscription_placement_test'),
    path('receipts/', views.my_receipts, name='my_receipts'),
    path('receipts/<str:receipt_id>/download/', views.download_my_receipt, name='download_my_receipt'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Admin panel endpoints (staff-only)
    path('users/', views.list_users, name='list_users'),
    path('users/<str:user_id>/', views.user_detail, name='user_detail'),
    path('dashboard/', views.dashboard_stats, name='dashboard_stats'),
    path('reports/', views.reports_analytics, name='reports_analytics'),
    path('admin/payments/overview/', views.admin_payments_overview, name='admin_payments_overview'),
    path('admin/payments/send-reminders/', views.admin_send_payment_reminders, name='admin_send_payment_reminders'),
    path('admin/payments/download-invoices/', views.admin_download_invoices, name='admin_download_invoices'),
    path('admin/payments/financial-report/', views.admin_export_financial_report, name='admin_export_financial_report'),
    path('admin/payments/users/<str:user_id>/invoice/', views.admin_download_invoice, name='admin_download_invoice'),
    path('admin/payments/users/<str:user_id>/send-reminder/', views.admin_send_payment_reminder, name='admin_send_payment_reminder'),
    path('admin/payments/users/<str:user_id>/extend-due/', views.admin_extend_payment_due, name='admin_extend_payment_due'),
]
