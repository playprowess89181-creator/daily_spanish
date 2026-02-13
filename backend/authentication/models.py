from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
import uuid

def generate_user_id():
    return f'user_{uuid.uuid4().hex[:20]}'

def generate_pending_id():
    return f'pending_{uuid.uuid4().hex[:18]}'

def generate_verify_id():
    return f'verify_{uuid.uuid4().hex[:18]}'

class User(AbstractUser):
    id = models.CharField(max_length=50, primary_key=True, default=generate_user_id)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    native_language = models.CharField(max_length=100, null=True, blank=True)
    LEVEL_CHOICES = [
        ('A1', 'A1 – Beginner'),
        ('A2', 'A2 – Elementary'),
        ('B1', 'B1 – Intermediate'),
        ('B2', 'B2 – Upper-Intermediate'),
        ('C1', 'C1 – Advanced'),
    ]
    level = models.CharField(max_length=3, choices=LEVEL_CHOICES, null=True, blank=True)
    nickname = models.CharField(max_length=100, null=True, blank=True)
    gender = models.CharField(max_length=20, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    profile_image = models.TextField(null=True, blank=True)
    referral_source = models.CharField(max_length=100, null=True, blank=True)
    legal_notice_accepted = models.BooleanField(default=False)
    legal_notice_accepted_at = models.DateTimeField(null=True, blank=True)
    has_used_subscription = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Remove inherited first_name and last_name fields
    first_name = None
    last_name = None
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email


class SubscriptionOnboarding(models.Model):
    PLAN_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Annual'),
    ]

    REASON_CHOICES = [
        ('exercise_mind', 'Exercise my mind'),
        ('travel', 'Prepare for travel'),
        ('career', 'Boost my professional career'),
        ('fun', 'For fun'),
        ('studies', 'Enhance studies'),
        ('connect', 'Connect with people'),
        ('other', 'Other'),
    ]

    DAILY_GOAL_CHOICES = [
        ('15', '15 minutes per day'),
        ('30', '30 minutes per day'),
        ('60', '1 hour per day'),
    ]

    KNOWLEDGE_CHOICES = [
        ('starting', 'I am just starting to learn'),
        ('common_words', 'I know some common words'),
        ('simple_conversations', 'I can have simple conversations'),
        ('several_topics', 'I can converse on several topics'),
        ('debate', 'I can debate in detail on most topics'),
    ]

    START_CHOICES = [
        ('beginning', 'From the beginning'),
        ('discover', 'Discover my level'),
    ]

    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription_onboarding')
    plan_key = models.CharField(max_length=10, choices=PLAN_CHOICES, null=True, blank=True)
    reason = models.CharField(max_length=30, choices=REASON_CHOICES, null=True, blank=True)
    reason_other = models.TextField(null=True, blank=True)
    daily_goal = models.CharField(max_length=2, choices=DAILY_GOAL_CHOICES, null=True, blank=True)
    spanish_knowledge = models.CharField(max_length=30, choices=KNOWLEDGE_CHOICES, null=True, blank=True)
    start_preference = models.CharField(max_length=15, choices=START_CHOICES, null=True, blank=True)
    test_answers = models.JSONField(null=True, blank=True)
    test_score = models.IntegerField(null=True, blank=True)
    suggested_level = models.CharField(max_length=3, choices=User.LEVEL_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

class PendingUser(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=generate_pending_id)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    native_language = models.CharField(max_length=100)
    password = models.CharField(max_length=255)  # This will be hashed
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.email

class EmailVerification(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=generate_verify_id)
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    expires = models.DateTimeField()
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ['email', 'otp']
    
    def __str__(self):
        return f'{self.email} - {self.otp}'
    
    def is_expired(self):
        return timezone.now() > self.expires
