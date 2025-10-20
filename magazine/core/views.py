from django.shortcuts import render
from django.db.models import Q
# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly

from ..articles.models import Article, Comment, Subscription, Notification, Channel
from .serializers import ArticleSerializer, CommentSerializer, SubscriptionSerializer, NotificationSerializer, \
    ChannelSerializer

from datetime import timedelta
from django.utils.timezone import now
from rest_framework.decorators import action, permission_classes, api_view
from rest_framework.response import Response
from rest_framework import viewsets

from .serializers import ArticleSerializer
# class ArticleViewSet(viewsets.ModelViewSet):
#     queryset = Article.objects.all()
#     serializer_class = ArticleSerializer
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "username": user.username,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
    })
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Дозволяє лише адміністраторам створювати/редагувати/видаляти.
    Іншим — тільки читати.
    """
    def has_permission(self, request, view):
        # Дозволити лише GET/HEAD/OPTIONS усім
        if request.method in permissions.SAFE_METHODS:
            return True
        # Для POST/PUT/DELETE — лише staff користувачам
        return request.user and request.user.is_staff

# class ArticleViewSet(viewsets.ModelViewSet):
#     queryset = Article.objects.all()
#     serializer_class = ArticleSerializer
#     permission_classes = [IsAdminOrReadOnly]
#
#     def perform_create(self, serializer):
#         serializer.save(author=self.request.user)
#
#     def get_queryset(self):
#         # queryset = Article.objects.all()
#         # category = self.request.query_params.get("category")
#         # if category:
#         #     queryset = queryset.filter(category=category)
#         # return queryset
#         qs = Article.objects.all()
#         category = self.request.query_params.get("category")
#         user = self.request.user
#
#         print("=== DEBUG USER ===")
#         print("User:", user)
#         print("Is authenticated:", user.is_authenticated)
#         if hasattr(user, "profile"):
#             print("Has profile, is_premium =", user.profile.is_premium)
#         else:
#             print("No profile")
#         print("=================")
#
#         if category:
#             qs = qs.filter(category__iexact=category.strip())
#
#         if user.is_authenticated and (user.is_staff or user.is_superuser):
#             return qs
#
#         if not user.is_authenticated:
#             return qs.filter(is_premium=False)
#
#         if hasattr(user, "profile") and user.profile.is_premium:
#             return qs
#
#         return qs.filter(is_premium=False)
#
#     def get_permissions(self):
#         # тільки адміністратори можуть створювати / змінювати / видаляти
#         if self.action in ['create', 'update', 'partial_update', 'destroy']:
#             permission_classes = [IsAdminUser]
#         else:
#             permission_classes = []  # доступ для перегляду — відкритий
#         return [permission() for permission in permission_classes]
#
#     @action(detail=False, methods=["get"], url_path="recent")
#
#     def recent_articles(self, request):
#         # last_month = now() - timedelta(days=30)
#         # articles = Article.objects.filter(
#         #     created_at__gte=last_month
#         # ).order_by("-created_at")
#         # serializer = self.get_serializer(articles, many=True)
#         # return Response(serializer.data)
#         one_month_ago = now() - timedelta(days=30)
#
#         # якщо користувач автентифікований
#         if request.user.is_authenticated:
#             profile = getattr(request.user, "profile", None)
#
#             if request.user.is_staff:
#                 queryset = Article.objects.filter(created_at__gte=one_month_ago)
#             elif profile and profile.is_premium:
#                 queryset = Article.objects.filter(created_at__gte=one_month_ago)
#             else:
#                 queryset = Article.objects.filter(created_at__gte=one_month_ago, is_premium=False)
#         else:
#             # анонімні бачать тільки без преміум
#             queryset = Article.objects.filter(created_at__gte=one_month_ago, is_premium=False)
#
#         serializer = ArticleSerializer(queryset, many=True)
#         return Response(serializer.data)
class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        qs = Article.objects.all()
        category = self.request.query_params.get("category")
        user = self.request.user

        if category:
            qs = qs.filter(category__iexact=category.strip())

        # Адмін бачить усі статті
        if user.is_authenticated and (user.is_staff or user.is_superuser):
            return qs

        # Звичайний користувач бачить лише непреміум
        if user.is_authenticated:
            profile = getattr(user, "profile", None)
            if profile and profile.is_premium:
                return qs  # преміум-користувач бачить усе
            else:
                return qs.filter(is_premium=False)

        # Анонімні користувачі бачать лише непреміум
        return qs.filter(is_premium=False)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=["get"], url_path="recent")
    def recent_articles(self, request):
        one_month_ago = now() - timedelta(days=30)
        qs = Article.objects.filter(created_at__gte=one_month_ago, channel__isnull=True)

        if not request.user.is_authenticated:
            qs = qs.filter(is_premium=False)
        elif hasattr(request.user, "profile") and not request.user.profile.is_premium:
            qs = qs.filter(is_premium=False)

        serializer = ArticleSerializer(qs.order_by("-created_at"), many=True)
        return Response(serializer.data)
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


# class ChannelViewSet(viewsets.ModelViewSet):
#     queryset = Channel.objects.all()
#     serializer_class = ChannelSerializer
#     permission_classes = [IsAuthenticatedOrReadOnly]
#
#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context.update({"request": self.request})
#         return context
#
#     @action(detail=True, methods=["post"], permission_classes=[IsAuthenticatedOrReadOnly])
#     def subscribe(self, request, pk=None):
#         channel = self.get_object()
#         Subscription.objects.get_or_create(user=request.user, channel=channel)
#         return Response({"status": "subscribed"}, status=status.HTTP_200_OK)
#
#     @action(detail=True, methods=["post"], permission_classes=[IsAuthenticatedOrReadOnly])
#     def unsubscribe(self, request, pk=None):
#         channel = self.get_object()
#         Subscription.objects.filter(user=request.user, channel=channel).delete()
#         return Response({"status": "unsubscribed"}, status=status.HTTP_200_OK)
#
#     @action(detail=True, methods=['get'])
#     def articles(self, request, pk=None):
#         channel = self.get_object()
#
#         # Статті конкретного каналу
#         articles = Article.objects.filter(channel=channel, status='published')
#
#         serializer = ArticleSerializer(articles, many=True)
#         return Response(serializer.data)
class ChannelViewSet(viewsets.ModelViewSet):
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def list(self, request, *args, **kwargs):
        """Повертаємо список каналів з полем is_subscribed для поточного користувача"""
        channels = self.get_queryset()
        user = request.user if request.user.is_authenticated else None

        serialized = []
        for channel in channels:
            is_subscribed = False
            if user:
                is_subscribed = Subscription.objects.filter(user=user, channel=channel).exists()
            data = ChannelSerializer(channel, context=self.get_serializer_context()).data
            data['is_subscribed'] = is_subscribed
            serialized.append(data)
        return Response(serialized)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticatedOrReadOnly])
    def subscribe(self, request, pk=None):
        channel = self.get_object()
        Subscription.objects.get_or_create(user=request.user, channel=channel)
        return Response({"status": "subscribed"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticatedOrReadOnly])
    def unsubscribe(self, request, pk=None):
        channel = self.get_object()
        Subscription.objects.filter(user=request.user, channel=channel).delete()
        return Response({"status": "unsubscribed"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def articles(self, request, pk=None):
        """Статті конкретного каналу"""
        channel = self.get_object()
        articles = Article.objects.filter(channel=channel, status='published').order_by('-publish_date', '-created_at')
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)