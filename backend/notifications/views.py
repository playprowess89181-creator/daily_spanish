from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db.models import Count, Q
from datetime import timedelta

from authentication.models import User
from .models import Notification, NotificationRecipient
from .serializers import NotificationSerializer, MyNotificationSerializer


def _base_recipient_qs():
    return User.objects.filter(is_superuser=False, is_staff=False)


def _parse_bool(v):
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    s = str(v).strip().lower()
    if s in ['1', 'true', 'yes', 'y', 'on']:
        return True
    if s in ['0', 'false', 'no', 'n', 'off']:
        return False
    return None


def _parse_int(v):
    if v in [None, '']:
        return None
    try:
        return int(v)
    except Exception:
        return None


def _apply_filters(qs, filters: dict):
    if not filters:
        return qs

    countries = filters.get('countries') or []
    if isinstance(countries, str):
        countries = [countries]
    countries = [c.strip() for c in countries if str(c).strip()]
    if countries:
        qs = qs.filter(country__in=countries)

    languages = filters.get('native_languages') or []
    if isinstance(languages, str):
        languages = [languages]
    languages = [c.strip() for c in languages if str(c).strip()]
    if languages:
        qs = qs.filter(native_language__in=languages)

    levels = filters.get('levels') or []
    if isinstance(levels, str):
        levels = [levels]
    levels = [c.strip() for c in levels if str(c).strip()]
    if levels:
        qs = qs.filter(level__in=levels)

    genders = filters.get('genders') or []
    if isinstance(genders, str):
        genders = [genders]
    genders = [c.strip() for c in genders if str(c).strip()]
    if genders:
        qs = qs.filter(gender__in=genders)

    age_min = _parse_int(filters.get('age_min'))
    age_max = _parse_int(filters.get('age_max'))
    if age_min is not None:
        qs = qs.filter(age__gte=age_min)
    if age_max is not None:
        qs = qs.filter(age__lte=age_max)

    joined_from = filters.get('joined_from')
    joined_to = filters.get('joined_to')
    if joined_from:
        qs = qs.filter(date_joined__date__gte=joined_from)
    if joined_to:
        qs = qs.filter(date_joined__date__lte=joined_to)

    query = (filters.get('query') or '').strip()
    if query:
        qs = qs.filter(Q(email__icontains=query) | Q(name__icontains=query) | Q(nickname__icontains=query))

    return qs


def _cleanup_old():
    cutoff = timezone.now() - timedelta(days=30)
    old = Notification.objects.filter(Q(sent_at__lt=cutoff) | (Q(sent_at__isnull=True) & Q(created_at__lt=cutoff)))
    if old.exists():
        old.delete()


def _send_notification(notification: Notification, recipients_qs):
    now = timezone.now()
    ids = list(recipients_qs.values_list('id', flat=True))
    if not ids:
        notification.sent_at = now
        notification.save(update_fields=['sent_at'])
        return 0

    existing = set(
        NotificationRecipient.objects.filter(notification=notification, user_id__in=ids).values_list('user_id', flat=True)
    )
    to_create = []
    for uid in ids:
        if uid in existing:
            continue
        to_create.append(NotificationRecipient(notification=notification, user_id=uid, delivered_at=now))
    NotificationRecipient.objects.bulk_create(to_create, batch_size=1000)

    notification.sent_at = now
    notification.save(update_fields=['sent_at'])
    return len(to_create)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_audience_preview(request):
    if not request.user.is_staff:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    filters = request.query_params.get('filters')
    try:
        import json
        filters_obj = json.loads(filters) if filters else {}
    except Exception:
        filters_obj = {}

    qs = _apply_filters(_base_recipient_qs(), filters_obj)
    total = qs.count()
    return Response({'total': total}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_filter_options(request):
    if not request.user.is_staff:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    qs = _base_recipient_qs()
    countries = list(qs.exclude(country__isnull=True).exclude(country__exact='').values_list('country', flat=True).distinct())
    languages = list(qs.exclude(native_language__isnull=True).exclude(native_language__exact='').values_list('native_language', flat=True).distinct())
    levels = list(qs.exclude(level__isnull=True).exclude(level__exact='').values_list('level', flat=True).distinct())
    genders = list(qs.exclude(gender__isnull=True).exclude(gender__exact='').values_list('gender', flat=True).distinct())

    countries.sort()
    languages.sort()
    levels.sort()
    genders.sort()

    return Response(
        {'countries': countries, 'languages': languages, 'levels': levels, 'genders': genders},
        status=status.HTTP_200_OK,
    )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_notifications(request):
    if not request.user.is_staff:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    _cleanup_old()

    if request.method == 'GET':
        page = _parse_int(request.query_params.get('page')) or 1
        page_size = _parse_int(request.query_params.get('page_size')) or 10
        if page_size < 1:
            page_size = 10
        if page_size > 50:
            page_size = 50

        qs = Notification.objects.all().annotate(
            _recipients_count=Count('recipients', distinct=True),
            _read_count=Count('recipients', filter=Q(recipients__read_at__isnull=False, recipients__deleted_at__isnull=True), distinct=True),
        )
        total = qs.count()
        start = (page - 1) * page_size
        items = NotificationSerializer(qs[start:start + page_size], many=True).data
        return Response({'notifications': items, 'total': total, 'page': page, 'page_size': page_size}, status=status.HTTP_200_OK)

    data = request.data or {}
    n_type = (data.get('type') or 'general').strip()
    if n_type not in dict(Notification.TYPE_CHOICES):
        return Response({'error': 'Invalid notification type'}, status=status.HTTP_400_BAD_REQUEST)

    title = (data.get('title') or '').strip()
    message = (data.get('message') or '').strip()
    if not title or not message:
        return Response({'error': 'Title and message are required'}, status=status.HTTP_400_BAD_REQUEST)

    filters_obj = data.get('filters') or {}
    if not isinstance(filters_obj, dict):
        return Response({'error': 'Invalid filters'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        notif = Notification.objects.create(
            type=n_type,
            title=title,
            message=message,
            audience_filters=filters_obj or None,
            created_by=request.user,
        )
        recipients_qs = _apply_filters(_base_recipient_qs(), filters_obj)
        _send_notification(notif, recipients_qs)
        return Response({'notification': NotificationSerializer(notif).data}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_delete_notification(request, notification_id: str):
    if not request.user.is_staff:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    notif = get_object_or_404(Notification, id=notification_id)
    notif.delete()
    return Response({'message': 'Deleted'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    _cleanup_old()

    page = _parse_int(request.query_params.get('page')) or 1
    page_size = _parse_int(request.query_params.get('page_size')) or 10
    if page_size < 1:
        page_size = 10
    if page_size > 50:
        page_size = 50

    qs = NotificationRecipient.objects.select_related('notification').filter(user=request.user, deleted_at__isnull=True).order_by('-notification__sent_at', '-delivered_at')
    total = qs.count()
    unread = qs.filter(read_at__isnull=True).count()
    start = (page - 1) * page_size
    items = MyNotificationSerializer(qs[start:start + page_size], many=True).data
    return Response({'notifications': items, 'total': total, 'unread': unread, 'page': page, 'page_size': page_size}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id: str):
    _cleanup_old()

    rec = NotificationRecipient.objects.select_related('notification').filter(user=request.user, notification_id=notification_id, deleted_at__isnull=True).first()
    if not rec:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    if rec.read_at is None:
        rec.read_at = timezone.now()
        rec.save(update_fields=['read_at'])
    return Response({'message': 'OK', 'read_at': rec.read_at}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    _cleanup_old()
    now = timezone.now()
    updated = NotificationRecipient.objects.filter(user=request.user, read_at__isnull=True, deleted_at__isnull=True).update(read_at=now)
    return Response({'updated': updated}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_my_notification(request, notification_id: str):
    _cleanup_old()
    rec = NotificationRecipient.objects.filter(user=request.user, notification_id=notification_id, deleted_at__isnull=True).first()
    if not rec:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    rec.deleted_at = timezone.now()
    rec.save(update_fields=['deleted_at'])
    return Response({'message': 'Deleted'}, status=status.HTTP_200_OK)
