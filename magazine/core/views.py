from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from ..articles.models import Article, Comment, Subscription, Notification
from .serializers import ArticleSerializer, CommentSerializer, SubscriptionSerializer, NotificationSerializer

from datetime import timedelta
from django.utils.timezone import now
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets

from .serializers import ArticleSerializer
# class ArticleViewSet(viewsets.ModelViewSet):
#     queryset = Article.objects.all()
#     serializer_class = ArticleSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()   # <-- додаємо це
    serializer_class = ArticleSerializer

    def get_queryset(self):
        queryset = Article.objects.all()
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    @action(detail=False, methods=["get"], url_path="recent")
    def recent_articles(self, request):
        last_month = now() - timedelta(days=30)
        articles = Article.objects.filter(created_at__gte=last_month).order_by("-created_at")
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
