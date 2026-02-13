from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random
import logging
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import User, PendingUser, EmailVerification, SubscriptionOnboarding
from lessons.models import Lesson
from support.models import SupportThread
from .serializers import (
    UserRegistrationSerializer,
    OTPVerificationSerializer,
    ResendOTPSerializer,
    LoginSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    SubscriptionOnboardingSerializer,
    SubscriptionPlacementTestSerializer,
)

logger = logging.getLogger(__name__)

def generate_otp():
    """Generate a 5-digit OTP"""
    return str(random.randint(10000, 99999))

def send_otp_email(email, name, otp):
    """Send OTP verification email"""
    subject = 'Verify your email - Daily Spanish'
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B4BB1;">Welcome to Daily Spanish!</h2>
        <p>Hi {name},</p>
        <p>Thank you for signing up! Please verify your email address by entering the following code:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #F25A37; font-size: 32px; margin: 0; letter-spacing: 5px;">{otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>¡Bienvenido a tu aventura en español!</p>
        <p>Best regards,<br>The Daily Spanish Team</p>
    </div>
    """
    
    try:
        send_mail(
            subject=subject,
            message=f'Your verification code is: {otp}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f'Failed to send email to {email}: {str(e)}')
        return False

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Handle user registration and send OTP"""
    serializer = UserRegistrationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    validated_data = serializer.validated_data
    email = validated_data['email']
    
    try:
        # Check if there's a pending verification for this email
        existing_verification = EmailVerification.objects.filter(
            email=email,
            verified=False,
            expires__gt=timezone.now()
        ).first()
        
        if existing_verification:
            return Response(
                {'error': 'A verification email has already been sent. Please check your inbox or wait before requesting a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Hash password
        hashed_password = make_password(validated_data['password'])
        
        # Generate OTP
        otp = generate_otp()
        otp_expires = timezone.now() + timedelta(minutes=10)
        
        # Store verification data
        EmailVerification.objects.create(
            email=email,
            otp=otp,
            expires=otp_expires,
            verified=False
        )
        
        # Store pending user data
        PendingUser.objects.update_or_create(
            email=email,
            defaults={
                'name': validated_data['name'],
                'country': validated_data['country'],
                'native_language': validated_data['native_language'],
                'password': hashed_password,
            }
        )
        
        # Send OTP email
        if send_otp_email(email, validated_data['name'], otp):
            return Response(
                {
                    'message': 'Verification email sent successfully',
                    'email': email
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Failed to send verification email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.error(f'Registration error: {str(e)}')
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and create user account"""
    serializer = OTPVerificationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp']
    
    try:
        # Find the verification record
        verification = EmailVerification.objects.filter(
            email=email,
            otp=otp,
            verified=False
        ).first()
        
        if not verification:
            return Response(
                {'error': 'Invalid or expired OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if verification.is_expired():
            return Response(
                {'error': 'OTP has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get pending user data
        pending_user = PendingUser.objects.filter(email=email).first()
        if not pending_user:
            return Response(
                {'error': 'No pending registration found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the actual user
        user = User.objects.create(
            username=email,  # Use email as username
            email=email,
            name=pending_user.name,
            country=pending_user.country,
            native_language=pending_user.native_language,
            password=pending_user.password,  # Already hashed
            is_verified=True
        )
        
        # Mark verification as completed
        verification.verified = True
        verification.save()
        
        # Clean up pending user data
        pending_user.delete()
        
        # Auto-login: issue JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        return Response(
            {
                'message': 'Email verified successfully',
                'access_token': str(access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'country': user.country,
                    'native_language': user.native_language,
                    'nickname': user.nickname,
                    'gender': user.gender,
                    'age': user.age,
                    'profile_image': user.profile_image,
                    'referral_source': user.referral_source,
                    'legal_notice_accepted': user.legal_notice_accepted,
                }
            },
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f'OTP verification error: {str(e)}')
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """Resend OTP for email verification"""
    serializer = ResendOTPSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    email = serializer.validated_data['email']
    
    try:
        # Check if there's a pending user
        pending_user = PendingUser.objects.filter(email=email).first()
        if not pending_user:
            return Response(
                {'error': 'No pending registration found for this email'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if there's a recent verification attempt
        recent_verification = EmailVerification.objects.filter(
            email=email,
            created_at__gt=timezone.now() - timedelta(minutes=1)
        ).first()
        
        if recent_verification:
            return Response(
                {'error': 'Please wait at least 1 minute before requesting a new OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate new OTP
        otp = generate_otp()
        otp_expires = timezone.now() + timedelta(minutes=10)
        
        # Create new verification record
        EmailVerification.objects.create(
            email=email,
            otp=otp,
            expires=otp_expires,
            verified=False
        )
        
        # Send OTP email
        if send_otp_email(email, pending_user.name, otp):
            return Response(
                {
                    'message': 'New verification code sent successfully',
                    'email': email
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Failed to send verification email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.error(f'Resend OTP error: {str(e)}')
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login user and return JWT tokens"""
    try:
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            remember_me = serializer.validated_data.get('remember_me', False)
            
            # Authenticate user
            user = authenticate(request, username=email, password=password)
            
            if user is not None:
                if user.is_active:
                    # Generate JWT tokens
                    refresh = RefreshToken.for_user(user)
                    access_token = refresh.access_token
                    
                    # Extend refresh token lifetime if remember me is checked
                    if remember_me:
                        refresh.set_exp(lifetime=timedelta(days=30))
                    
                    return Response({
                        'message': 'Login successful',
                        'access_token': str(access_token),
                        'refresh_token': str(refresh),
                        'user': {
                            'id': user.id,
                            'name': user.name,
                            'email': user.email,
                            'country': user.country,
                            'native_language': user.native_language,
                            'nickname': user.nickname,
                            'gender': user.gender,
                            'age': user.age,
                            'profile_image': user.profile_image,
                            'referral_source': user.referral_source,
                            'legal_notice_accepted': user.legal_notice_accepted,
                            'is_staff': user.is_staff,
                            'is_superuser': user.is_superuser,
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {'error': 'Account is not active'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                return Response(
                    {'error': 'Invalid email or password'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'Invalid data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f'Login error: {str(e)}')
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user by blacklisting refresh token"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            
        return Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f'Logout error: {str(e)}')
        return Response(
            {'message': 'Logout successful'},  # Always return success for security
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send password reset email"""
    try:
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Check if user exists
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Don't reveal if email exists for security
                return Response(
                    {'message': 'If the email exists, a password reset link has been sent'},
                    status=status.HTTP_200_OK
                )
            
            # Generate OTP for password reset
            otp = generate_otp()
            otp_expires = timezone.now() + timedelta(minutes=10)
            
            # Delete any existing password reset requests
            EmailVerification.objects.filter(
                email=email,
                verified=False
            ).delete()
            
            # Create new password reset record
            EmailVerification.objects.create(
                email=email,
                otp=otp,
                expires=otp_expires,
                verified=False
            )
            
            # Send password reset email
            if send_password_reset_email(email, user.name, otp):
                return Response(
                    {'message': 'If the email exists, a password reset link has been sent'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'error': 'Failed to send password reset email'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response(
                {'error': 'Invalid data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f'Forgot password error: {str(e)}')
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password with OTP verification"""
    try:
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']
            
            # Verify OTP
            try:
                verification = EmailVerification.objects.get(
                    email=email,
                    otp=otp,
                    verified=False,
                    expires__gt=timezone.now()
                )
            except EmailVerification.DoesNotExist:
                return Response(
                    {'error': 'Invalid or expired OTP'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get user and update password
            try:
                user = User.objects.get(email=email)
                user.password = make_password(new_password)
                user.save()
                
                # Mark verification as used
                verification.verified = True
                verification.save()
                
                return Response(
                    {'message': 'Password reset successful'},
                    status=status.HTTP_200_OK
                )
                
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'Invalid data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f'Reset password error: {str(e)}')
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Get current user profile"""
    try:
        user = request.user
        return Response({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'country': user.country,
            'native_language': user.native_language,
            'level': user.level,
            'nickname': user.nickname,
            'gender': user.gender,
            'age': user.age,
            'profile_image': user.profile_image,
            'date_joined': user.date_joined,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'referral_source': user.referral_source,
            'legal_notice_accepted': user.legal_notice_accepted,
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Get profile error: {str(e)}')
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """Update current user profile"""
    try:
        user = request.user
        data = request.data
        
        # Update allowed fields
        if 'name' in data:
            user.name = data['name']
        if 'country' in data:
            user.country = data['country']
        if 'native_language' in data:
            user.native_language = data['native_language']
        if 'level' in data:
            user.level = data['level']
        if 'nickname' in data:
            user.nickname = data['nickname']
        if 'gender' in data:
            user.gender = data['gender']
        if 'age' in data:
            user.age = int(data['age']) if data['age'] else None
        if 'profile_image' in data:
            user.profile_image = data['profile_image']
        if 'referral_source' in data:
            user.referral_source = data['referral_source']
        if 'legal_notice_accepted' in data:
            accepted = bool(data['legal_notice_accepted'])
            user.legal_notice_accepted = accepted
            if accepted and not user.legal_notice_accepted_at:
                user.legal_notice_accepted_at = timezone.now()
            
        user.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'country': user.country,
                'native_language': user.native_language,
                'nickname': user.nickname,
                'gender': user.gender,
                'age': user.age,
                'profile_image': user.profile_image,
                'referral_source': user.referral_source,
                'legal_notice_accepted': user.legal_notice_accepted,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Update profile error: {str(e)}')
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_status(request):
    user = request.user
    return Response(
        {
            'first_time_payment': not bool(getattr(user, 'has_used_subscription', False)),
            'has_used_subscription': bool(getattr(user, 'has_used_subscription', False)),
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_subscription_onboarding(request):
    user = request.user
    serializer = SubscriptionOnboardingSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': 'Validation failed', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    defaults = serializer.validated_data
    onboarding, _ = SubscriptionOnboarding.objects.update_or_create(user=user, defaults=defaults)

    start_pref = onboarding.start_preference
    if start_pref == 'beginning':
        if not user.level:
            user.level = 'A1'
        user.has_used_subscription = True
        user.save()
        onboarding.suggested_level = user.level
        onboarding.save(update_fields=['suggested_level', 'updated_at'])
        return Response(
            {
                'message': 'Onboarding saved',
                'next': 'cart',
                'suggested_level': onboarding.suggested_level,
            },
            status=status.HTTP_200_OK,
        )

    return Response(
        {
            'message': 'Onboarding saved',
            'next': 'test',
        },
        status=status.HTTP_200_OK,
    )


def _suggest_level_from_score(score: int) -> str:
    if score <= 2:
        return 'A1'
    if score <= 4:
        return 'A2'
    if score <= 6:
        return 'B1'
    if score <= 8:
        return 'B2'
    return 'C1'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_subscription_placement_test(request):
    user = request.user
    serializer = SubscriptionPlacementTestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': 'Validation failed', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    plan_key = serializer.validated_data.get('plan_key')
    answers = serializer.validated_data['answers']

    correct = {
        'q1': 'soy',
        'q2': 'tengo',
        'q3': 'en',
        'q4': 'quiero',
        'q5': 'fui',
        'q6': 'estoy',
        'q7': 'hablamos',
        'q8': 'comprar',
        'q9': 'porque',
        'q10': 'mañana',
    }

    normalized = {str(a.get('id')): a.get('value') for a in answers}
    score = 0
    for qid, expected in correct.items():
        if normalized.get(qid) == expected:
            score += 1

    suggested_level = _suggest_level_from_score(score)

    onboarding, _ = SubscriptionOnboarding.objects.get_or_create(user=user)
    if plan_key:
        onboarding.plan_key = plan_key
    onboarding.test_answers = answers
    onboarding.test_score = score
    onboarding.suggested_level = suggested_level
    onboarding.save()

    user.level = suggested_level
    user.has_used_subscription = True
    user.save()

    return Response(
        {
            'message': 'Test submitted',
            'score': score,
            'total': len(correct),
            'suggested_level': suggested_level,
        },
        status=status.HTTP_200_OK,
    )


def send_password_reset_email(email, name, otp):
    """Send password reset email"""
    subject = 'Reset your password - Daily Spanish'
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B4BB1;">Password Reset - Daily Spanish</h2>
        <p>Hi {name},</p>
        <p>You requested to reset your password. Please use the following code to reset your password:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #F25A37; font-size: 32px; margin: 0; letter-spacing: 5px;">{otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>Best regards,<br>The Daily Spanish Team</p>
    </div>
    """
    
    try:
        send_mail(
            subject=subject,
            message=f'Your password reset code is: {otp}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f'Password reset email error: {str(e)}')
        return False

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    try:
        if not request.user.is_staff:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        qs = User.objects.filter(is_superuser=False).exclude(id=request.user.id)
        users = []
        for u in qs:
            users.append({
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'country': u.country,
                'native_language': u.native_language,
                'level': u.level,
                'nickname': u.nickname,
                'gender': u.gender,
                'age': u.age,
                'profile_image': u.profile_image,
                'is_active': u.is_active,
                'date_joined': u.date_joined,
                'last_login': u.last_login,
            })
        return Response({'users': users}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f'List users error: {str(e)}')
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id: str):
    try:
        if not request.user.is_staff:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        user = User.objects.filter(id=user_id, is_superuser=False).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        if user.id == request.user.id:
            return Response({'error': 'Cannot delete current admin'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({'message': 'User deleted'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f'Delete user error: {str(e)}')
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    try:
        if not request.user.is_staff:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        total_users = User.objects.filter(is_superuser=False).count()
        active_users = User.objects.filter(is_superuser=False, is_active=True).count()

        # Payments not implemented yet; return 0
        active_payments = 0
        overdue_payments = 0

        total_lessons = Lesson.objects.count()
        open_threads = SupportThread.objects.filter(status='open').count()
        resolved_threads = SupportThread.objects.filter(status='resolved').count()

        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'active_payments': active_payments,
            'overdue_payments': overdue_payments,
            'total_lessons': total_lessons,
            'support_open': open_threads,
            'support_resolved': resolved_threads,
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
