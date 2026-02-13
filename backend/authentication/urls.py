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
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Admin panel endpoints (staff-only)
    path('users/', views.list_users, name='list_users'),
    path('users/<str:user_id>/', views.delete_user, name='delete_user'),
    path('dashboard/', views.dashboard_stats, name='dashboard_stats'),
]
