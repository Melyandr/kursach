from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User model that extends Django's AbstractUser.
    Adds is_premium field for premium user status.
    """
    is_premium = models.BooleanField(default=False)

    class Meta:
        db_table = 'auth_user'


class Article(models.Model):
    TYPE_CHOICES = [
        ('standard', 'Звичайна'),
        ('interactive', 'Інтерактивна'),
    ]
    CATEGORY_CHOICES = [
        ('sport', 'Спорт'),
        ('fashion', 'Мода'),
        ('News', 'Новини'),

    ]
    STATUS_CHOICES = [
        ('draft', 'Чернетка'),
        ('published', 'Опубліковано'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, null=True, blank=True)
    content = models.TextField(blank=True, null=True)
    excerpt = models.TextField(blank=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='articles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    publish_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='standard')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='tech')
    is_premium = models.BooleanField(default=False)  # чи потрібна преміум-локація для цієї статті
    # image_url = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to='articles/', blank=True, null=True)
    notified = models.BooleanField(default=False)  # використовуємо, щоб не дублювати нотифікації

    channel = models.ForeignKey(
        "Channel",
        on_delete=models.CASCADE,
        related_name="articles",
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-publish_date', '-created_at']

    def publish(self):
        if self.status != 'published':
            self.status = 'published'
            self.publish_date = timezone.now()
            self.save(update_fields=['status', 'publish_date'])

    def __str__(self):
        return self.title


class Comment(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    moderated = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.user} on {self.article}'


# from django.contrib.auth.models import User

class Channel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Subscription(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "channel")

    def __str__(self):
        return f"{self.user.username} → {self.channel.name}"


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    text = models.CharField(max_length=500)
    link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    channel_name = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Notification to {self.user}: {self.text[:30]}'


class SavedArticle(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_articles")
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'article')  # не дозволяє дублікати


# class Poll(models.Model):
#     question = models.CharField(max_length=255)
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def total_votes(self):
#         return sum(choice.votes for choice in self.choices.all())
#
#     def __str__(self):
#         return self.question
class Poll(models.Model):
    question = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    channel = models.ForeignKey(
        "Channel",
        on_delete=models.CASCADE,
        related_name="polls",
        null=True,
        blank=True
    )

    def total_votes(self):
        return sum(choice.votes for choice in self.choices.all())

    def __str__(self):
        return self.question


class Choice(models.Model):
    poll = models.ForeignKey(Poll, related_name='choices', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    votes = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.text} ({self.votes} голосів)"


class Vote(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('poll', 'user')

# @receiver(post_save, sender=Article)
# def create_notifications_for_article(sender, instance, created, article=None, **kwargs):
#     if not created:
#         return
#
#     # всі підписані на канал
#     subs = Subscription.objects.filter(channel=instance.channel)
#
#     for s in subs:
#             Notification.objects.create(
#                 user=s.user,
#                 text=f"Нова стаття у каналі {instance.channel.name}: {instance.title}",
#                 link=f"/articles/{instance.id}"
#             )
