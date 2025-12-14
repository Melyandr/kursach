from django.contrib.auth import get_user_model
from rest_framework import serializers, generics, permissions
from rest_framework.serializers import ModelSerializer

from ..articles.models import Article, Comment, Subscription, Notification, Channel, SavedArticle, Choice, Poll, Vote

User = get_user_model()


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ["author"]

class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'




class ChannelSerializer(serializers.ModelSerializer):
    is_subscribed = serializers.SerializerMethodField()

    class Meta:
        model = Channel
        fields = ["id", "name", "description", "is_subscribed"]

    def get_is_subscribed(self, obj):
        request = self.context.get("request")
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.subscription_set.filter(user=request.user).exists()
        return False

class SavedArticleSerializer(serializers.ModelSerializer):
    article_detail = ArticleSerializer(source='article', read_only=True)
    class Meta:
        model = SavedArticle
        fields = ['id', 'article','article_detail', 'user', 'created_at']
        read_only_fields = ['user']

# class ChoiceSerializer(serializers.ModelSerializer):
#     percentage = serializers.SerializerMethodField()
#
#     class Meta:
#         model= Choice
#         fields = ['id', 'text', 'votes', 'percentage']
#
#     def get_percentage(self, obj):
#         total = obj.poll.total_votes()
#         return round((obj.votes / total) * 100, 2) if total > 0 else 0
#
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         user = self.context['request'].user
#         if not user.is_staff:
#             data.pop('votes')  # звичайним користувачам не показуємо кількість голосів
#         return data
# class ChoiceSerializer(serializers.ModelSerializer):
#     percentage = serializers.SerializerMethodField()
#     votes = serializers.IntegerField(read_only=True)
#
#     class Meta:
#         model = Choice
#         fields = ['id', 'text', 'votes', 'percentage']
#
#     def get_percentage(self, obj):
#         total = 0
#         try:
#             total = obj.poll.total_votes() if obj.poll else 0
#         except Exception:
#             total = 0
#         return round((obj.votes / total) * 100, 2) if total > 0 else 0
#
#     def to_representation(self, instance):
#         # Безпечний доступ до request
#         data = super().to_representation(instance)
#         request = self.context.get('request', None)
#         # Якщо request відсутній або користувач не staff — видаляємо votes
#         if request is None or not getattr(request.user, 'is_staff', False):
#             data.pop('votes', None)
#         return data
#
# class PollSerializer(serializers.ModelSerializer):
#     choices = ChoiceSerializer(many=True)
#
#     class Meta:
#         model = Poll
#         fields = ['id', 'question', 'channel', 'choices']
#
#     def create(self, validated_data):
#         choices_data = validated_data.pop('choices')
#         poll = Poll.objects.create(**validated_data)
#         for choice_data in choices_data:
#             Choice.objects.create(poll=poll, **choice_data)
#         return poll
class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'votes']

# class PollSerializer(serializers.ModelSerializer):
#     choices = ChoiceSerializer(many=True)
#
#     class Meta:
#         model = Poll
#         fields = ['id', 'question', 'choices', 'channel', 'created_at']
#
#     def create(self, validated_data):
#         choices_data = validated_data.pop('choices')
#         poll = Poll.objects.create(**validated_data)
#         for choice_data in choices_data:
#             Choice.objects.create(poll=poll, **choice_data)
#         return poll
class PollSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)
    total_votes = serializers.SerializerMethodField()
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = ["id", "question", "choices", "channel", "created_at", "total_votes", "has_voted"]

    def get_total_votes(self, obj):
        return sum(choice.votes for choice in obj.choices.all())

    def get_has_voted(self, obj):
        user = self.context.get("request").user
        if not user.is_authenticated:
            return False
        return Vote.objects.filter(user=user, poll=obj).exists()

# class PollCreateSerializer(serializers.ModelSerializer):
#     # очікуємо choices як список рядків
#     choices = serializers.ListField(child=serializers.CharField(), write_only=True)
#
#     class Meta:
#         model = Poll
#         fields = ["id", "question", "channel", "created_at", "choices"]
#         read_only_fields = ["id", "created_at"]
#
#     def validate_channel(self, value):
#         # дозволяємо null, але якщо вказаний — перевіряємо наявність
#         return value
#
#     def create(self, validated_data):
#         choices = validated_data.pop("choices", [])
#         poll = Poll.objects.create(**validated_data)
#         for ch_text in choices:
#             ch_text = (ch_text or "").strip()
#             if ch_text:
#                 Choice.objects.create(poll=poll, text=ch_text)
#         return poll
class PollCreateSerializer(serializers.ModelSerializer):
    choices = serializers.ListField(
        child=serializers.CharField(), write_only=True
    )
    channel = serializers.PrimaryKeyRelatedField(
        queryset=Channel.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = Poll
        fields = ["id", "question", "channel", "created_at", "choices"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        choices = validated_data.pop("choices", [])
        poll = Poll.objects.create(**validated_data)  # тут channel буде записано автоматично
        for ch_text in choices:
            ch_text = (ch_text or "").strip()
            if ch_text:
                Choice.objects.create(poll=poll, text=ch_text)
        return poll
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_premium']


class UserNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")