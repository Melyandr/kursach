from MySQLdb import IntegrityError
from django.contrib.auth import get_user_model, authenticate
from django.shortcuts import render
from django.db.models import Q
from django.conf import settings
# Create your views here.
from rest_framework import viewsets, permissions, status, generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

from . import factories
from . import serializers
from .factories import get_factory
from ..articles.models import Article, Comment, Subscription, Notification, Channel, SavedArticle, Poll, Vote, Choice
from .serializers import ArticleSerializer, CommentSerializer, SubscriptionSerializer, NotificationSerializer, \
    ChannelSerializer, SavedArticleSerializer, PollSerializer, UserSerializer, PollCreateSerializer

from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import action, permission_classes, api_view
from rest_framework.response import Response
from rest_framework import viewsets

from .serializers import ArticleSerializer



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "is_staff": user.is_staff,
        "is_premium": user.is_premium,
    })


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Дозволяє видаляти лише адміну.
    """

    def has_object_permission(self, request, view, obj):

        if request.user.is_staff:
            return True

        return obj.user == request.user


from rest_framework import permissions


class AllowVoteOrAdmin(permissions.BasePermission):
    """
    Дозволяє всім користувачам голосувати, але редагувати/видаляти — лише адмінам.
    """

    def has_permission(self, request, view):
        if view.action == "vote":
            return request.user and request.user.is_authenticated
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


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
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Фільтрує статті:
        - Виключає interactive статті (вони показуються тільки через канали)
        - Фільтрує за категорією якщо вказано
        - Показує тільки опубліковані статті
        - Premium статті показуються тільки premium користувачам
        """
        queryset = super().get_queryset()

        # Виключаємо interactive статті - вони показуються тільки через канали
        queryset = queryset.exclude(type='interactive')

        # Фільтруємо за категорією, якщо вказано
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__iexact=category)

        # Показуємо тільки опубліковані статті
        queryset = queryset.filter(status='published')

        # Фільтруємо premium статті для не-premium користувачів
        user = self.request.user
        if not user.is_authenticated or not user.is_premium:
            queryset = queryset.filter(is_premium=False)

        return queryset.order_by("-publish_date", "-created_at")

    def get_object(self):
        """
        Перевизначаємо для операцій видалення/редагування,
        щоб знайти статтю незалежно від типу та статусу.
        """
        if self.action in ['destroy', 'update', 'partial_update', 'retrieve']:
            # Використовуємо базовий queryset без фільтрів для цих операцій
            queryset = Article.objects.all()
            lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
            filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
            obj = queryset.get(**filter_kwargs)
            self.check_object_permissions(self.request, obj)
            return obj
        return super().get_object()

    def perform_create(self, serializer):
        # Determine article type from request data
        article_type = self.request.data.get("type", "standard")

        # Use factory method to get appropriate factory
        factory = get_factory(article_type)
        article = factory.create(self.request, self.request.user)
        serializer.instance = article

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Повертає стандартні статті за останній місяць.
        Interactive статті не включаються.
        Premium статті показуються тільки premium користувачам.
        """
        month_ago = timezone.now() - timedelta(days=30)
        articles = Article.objects.filter(
            status='published',
            type='standard',  # Тільки стандартні статті
            publish_date__gte=month_ago
        )

        # Фільтруємо premium статті для не-premium користувачів
        user = request.user
        if not user.is_authenticated or not user.is_premium:
            articles = articles.filter(is_premium=False)

        articles = articles.order_by('-publish_date', '-created_at')

        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]

    def get_queryset(self):
        queryset = Comment.objects.all()
        article_id = self.request.query_params.get('article')
        if article_id:
            queryset = queryset.filter(article_id=article_id)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")


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

    @action(detail=True, methods=['get'])
    def polls(self, request, pk=None):
        channel = self.get_object()
        polls = channel.polls.all()
        serializer = PollSerializer(polls, many=True, context={'request': request})
        return Response(serializer.data)


class ChannelArticlesListView(generics.ListAPIView):
    serializer_class = ArticleSerializer

    def get_queryset(self):
        channel_id = self.kwargs['pk']
        return Article.objects.filter(channel_id=channel_id)


class ChannelPollListView(generics.ListAPIView):
    serializer_class = PollSerializer

    def get_queryset(self):
        channel_id = self.kwargs['pk']  # отримуємо id каналу з URL
        return Poll.objects.filter(channel_id=channel_id)


class SavedArticleViewSet(viewsets.ModelViewSet):
    queryset = SavedArticle.objects.all()
    serializer_class = SavedArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedArticle.objects.filter(user=self.request.user)

    def get(self, request):
        saved = SavedArticle.objects.filter(user=request.user)
        articles = [s.article for s in saved]
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            raise serializers.ValidationError("Ця стаття вже збережена.")




class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all().order_by("-created_at")
    serializer_class = PollSerializer
    permission_classes = [AllowVoteOrAdmin]

    def get_serializer_class(self):
        # для POST/PUT використовуємо створюючий серіалізатор
        if self.action in ["create", "update", "partial_update"]:
            return PollCreateSerializer
        return PollSerializer

    def get_serializer(self, *args, **kwargs):
        kwargs.setdefault('context', self.get_serializer_context())
        return super().get_serializer(*args, **kwargs)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request  #  додаємо користувача до контексту
        return context

    @action(detail=True, methods=['post'], url_path='vote/(?P<choice_id>[^/.]+)')
    def vote(self, request, pk=None, choice_id=None):
        poll = self.get_object()
        choice = Choice.objects.filter(id=choice_id, poll=poll).first()
        if not choice:
            return Response({"error": "Вибір не знайдено"}, status=status.HTTP_404_NOT_FOUND)

        # Перевіряємо чи користувач вже голосував
        if Vote.objects.filter(user=request.user, poll=poll).exists():
            return Response({"error": "Ви вже голосували"}, status=status.HTTP_400_BAD_REQUEST)

        Vote.objects.create(user=request.user, poll=poll, choice=choice)
        choice.votes += 1
        choice.save()
        return Response({
            "message": "Голос зараховано!",
            "choice_id": choice.id,
            "choice_votes": choice.votes
        })


class PollCreateView(generics.CreateAPIView):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer
    permission_classes = [IsAdminUser]


class CreateContentView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]  # тільки адміністратор

    def post(self, request, *args, **kwargs):
        # Get content type from request
        content_type = request.data.get("type")

        if not content_type:
            return Response(
                {"detail": "Параметр 'type' обов'язковий"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Use factory method to get appropriate factory
            factory = get_factory(content_type)
            result = factory.create(request, request.user)

            if hasattr(result, "id"):
                return Response(
                    {"status": "created", "id": result.id},
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {"status": "created"},
                    status=status.HTTP_201_CREATED
                )
        except ValidationError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Повертає список користувачів. Тільки для читання.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class RegisterView(APIView):
    """
    Registration endpoint that accepts email/password.
    Optional admin_secret_key can be provided to create admin user.
    """
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        username = request.data.get('username')
        admin_secret_key = request.data.get('admin_secret_key', '')

        if not email or not password:
            return Response(
                {'detail': 'Email та пароль обов\'язкові'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not username:
            # Generate username from email if not provided
            username = email.split('@')[0]

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'detail': 'Користувач з таким email вже існує'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'detail': 'Користувач з таким ім\'ям вже існує'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate admin secret key if provided
        is_staff = False
        if admin_secret_key:
            admin_secret = getattr(settings, 'ADMIN_SECRET_KEY', '')
            if admin_secret_key != admin_secret:
                return Response(
                    {'detail': 'Невірний секретний ключ адміністратора'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            is_staff = True

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=is_staff
        )

        # Set is_premium=True for admin users by default
        if is_staff:
            user.is_premium = True
            user.save(update_fields=['is_premium'])

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class EmailLoginView(APIView):
    """
    Login endpoint that works with email instead of username.
    """
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'detail': 'Email та пароль обов\'язкові'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Невірний email або пароль'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Authenticate with username (since Django auth uses username)
        user = authenticate(username=user.username, password=password)

        if not user:
            return Response(
                {'detail': 'Невірний email або пароль'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset for managing users and their premium status.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )
        return queryset.order_by('-date_joined')

    @action(detail=True, methods=['post'])
    def toggle_premium(self, request, pk=None):
        """Toggle premium status for a user"""
        user = self.get_object()
        user.is_premium = not user.is_premium
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get premium user statistics"""
        total_users = User.objects.count()
        premium_users = User.objects.filter(is_premium=True).count()
        admin_users = User.objects.filter(is_staff=True).count()

        return Response({
            'total_users': total_users,
            'premium_users': premium_users,
            'admin_users': admin_users,
            'regular_users': total_users - premium_users - admin_users
        })