from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from ..articles.models import Article, Comment, Subscription, Notification
from .serializers import ArticleSerializer, CommentSerializer, SubscriptionSerializer, NotificationSerializer

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

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        queryset = Article.objects.all()
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    def get_permissions(self):
        # тільки адміністратори можуть створювати / змінювати / видаляти
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []  # доступ для перегляду — відкритий
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=["get"], url_path="recent")
    def recent_articles(self, request):
        last_month = now() - timedelta(days=30)
        articles = Article.objects.filter(
            created_at__gte=last_month
        ).order_by("-created_at")
        serializer = self.get_serializer(articles, many=True)
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
