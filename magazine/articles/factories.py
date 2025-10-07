from .models import Article, Subscription
from django.utils import timezone
from django.conf import settings

class ArticleFactory:
    @staticmethod
    def create_article(article_type, **kwargs):
        """
        Фабрика для створення статей різних типів.
        article_type: 'standard' або 'interactive'
        """
        if article_type not in ['standard', 'interactive']:
            raise ValueError("Невідомий тип статті")

        kwargs['type'] = article_type
        return Article.objects.create(**kwargs)


class SubscriptionFactory:
    @staticmethod
    def create_subscription(user, tier='free', **kwargs):
        """
        Фабрика для створення підписок.
        tier: 'free' або 'premium'
        """
        if tier not in ['free', 'premium']:
            raise ValueError("Невідомий тип підписки")

        return Subscription.objects.create(
            user=user,
            tier=tier,
            started_at=timezone.now(),
            active=True,
            **kwargs
        )
