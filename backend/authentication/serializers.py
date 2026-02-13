from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, PendingUser, EmailVerification, SubscriptionOnboarding

class UserRegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(
        min_length=2, 
        max_length=50, 
        error_messages={
            'min_length': 'Name must be at least 2 characters',
            'max_length': 'Name must be less than 50 characters'
        }
    )
    email = serializers.EmailField(
        error_messages={'invalid': 'Invalid email address'}
    )
    password = serializers.CharField(
        min_length=8, 
        max_length=100,
        write_only=True,
        error_messages={
            'min_length': 'Password must be at least 8 characters',
            'max_length': 'Password must be less than 100 characters'
        }
    )
    country = serializers.CharField(
        min_length=2,
        error_messages={'min_length': 'Please select a country'}
    )
    native_language = serializers.CharField(
        min_length=2,
        error_messages={'min_length': 'Please select your native language'}
    )
    
    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('User with this email already exists')
        return value

class OTPVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=5)

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={'invalid': 'Invalid email address'}
    )
    password = serializers.CharField(
        write_only=True,
        error_messages={'blank': 'Password is required'}
    )
    remember_me = serializers.BooleanField(default=False, required=False)


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={'invalid': 'Invalid email address'}
    )


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={'invalid': 'Invalid email address'}
    )
    otp = serializers.CharField(
        max_length=6, 
        min_length=5,
        error_messages={
            'min_length': 'OTP must be 5 digits',
            'max_length': 'OTP must be 5 digits'
        }
    )
    new_password = serializers.CharField(
        min_length=8, 
        max_length=100,
        write_only=True,
        error_messages={
            'min_length': 'Password must be at least 8 characters',
            'max_length': 'Password must be less than 100 characters'
        }
    )
    
    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'country', 'native_language', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'country', 'native_language']
        
    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError('Name must be at least 2 characters')
        return value.strip()


class SubscriptionOnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionOnboarding
        fields = ['plan_key', 'reason', 'reason_other', 'daily_goal', 'spanish_knowledge', 'start_preference']

    def validate(self, attrs):
        reason = attrs.get('reason')
        reason_other = (attrs.get('reason_other') or '').strip()
        if reason == 'other' and not reason_other:
            raise serializers.ValidationError({'reason_other': 'Please write your answer'})
        return attrs


class SubscriptionPlacementTestSerializer(serializers.Serializer):
    plan_key = serializers.ChoiceField(choices=[('monthly', 'Monthly'), ('yearly', 'Annual')], required=False)
    answers = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False,
    )

    def validate_answers(self, value):
        if not isinstance(value, list) or len(value) == 0:
            raise serializers.ValidationError('Answers are required')
        for item in value:
            if 'id' not in item or 'value' not in item:
                raise serializers.ValidationError('Each answer must include id and value')
        return value
