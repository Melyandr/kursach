"""
Factory Pattern Implementation for Content Creation

This module implements the Factory Pattern correctly with:
- Abstract base class for type safety
- Separate factories for different content types
- Factory method for factory selection
- Proper error handling and validation
"""
from abc import ABC, abstractmethod
from magazine.articles.models import Article, Channel, Poll, Choice
from rest_framework.exceptions import ValidationError
from django.utils import timezone


class BaseContentFactory(ABC):
    """
    Abstract base class for all content factories.
    Ensures all factories implement the same interface.
    """

    @abstractmethod
    def create(self, request, user):
        """
        Create content object from request data.

        Args:
            request: Django request object with data and FILES
            user: User instance creating the content

        Returns:
            Created content object (Article, Poll, etc.)

        Raises:
            ValidationError: If validation fails
        """
        pass


class StandardArticleFactory(BaseContentFactory):
    """
    Factory for creating standard articles (non-interactive).
    Handles standard articles with category and premium status.
    """

    def create(self, request, user):
        data = request.data

        # Validate required fields
        title = data.get("title")
        if not title:
            raise ValidationError("Заголовок обов'язковий")

        content = data.get("content", "")
        excerpt = data.get("excerpt", "")
        category = data.get("category", "sport")
        is_premium = str(data.get("is_premium", "false")).lower() in ["true", "1", "yes"]

        # Validate category
        valid_categories = ['sport', 'fashion', 'News']
        if category not in valid_categories:
            raise ValidationError(f"Невірна категорія. Дозволені: {', '.join(valid_categories)}")

        # Create article
        article = Article.objects.create(
            title=title,
            content=content,
            excerpt=excerpt,
            type='standard',
            category=category,
            is_premium=is_premium,
            author=user,
            status='published',
            publish_date=timezone.now(),
        )

        # Handle image upload
        if 'image' in request.FILES:
            article.image = request.FILES['image']
            article.save()

        return article


class InteractiveArticleFactory(BaseContentFactory):
    """
    Factory for creating interactive articles (channel-based).
    Handles articles that belong to channels.
    """

    def create(self, request, user):
        data = request.data

        # Validate required fields
        title = data.get("title")
        if not title:
            raise ValidationError("Заголовок обов'язковий")

        content = data.get("content", "")
        excerpt = data.get("excerpt", "")

        # Validate and get channel
        channel_id = data.get("channel")
        if not channel_id:
            raise ValidationError("Не вказано канал для інтерактивної статті")

        try:
            channel_obj = Channel.objects.get(pk=int(channel_id))
        except (Channel.DoesNotExist, ValueError, TypeError):
            raise ValidationError("Канал не знайдено")

        # Create article
        article = Article.objects.create(
            title=title,
            content=content,
            excerpt=excerpt,
            type='interactive',
            category='',  # Interactive articles don't have categories
            is_premium=False,  # Interactive articles are not premium
            author=user,
            channel=channel_obj,
            status='published',
            publish_date=timezone.now(),
        )

        # Handle image upload
        if 'image' in request.FILES:
            article.image = request.FILES['image']
            article.save()

        return article


# class PollFactory(BaseContentFactory):
#     """
#     Factory for creating polls with choices.
#     Handles poll creation with multiple choice options.
#     """
#
#     def create(self, request, user):
#         data = request.data
#
#         # Validate required fields
#         question = data.get("question")
#         if not question:
#             raise ValidationError("Питання опитування обов'язкове")
#
#         choices_data = data.get("choices", [])
#         if not choices_data or len(choices_data) < 2:
#             raise ValidationError("Опитування має містити принаймні 2 варіанти відповіді")
#
#         # Get optional channel
#         channel_obj = None
#         channel_id = data.get("channel")
#         if channel_id:
#             try:
#                 channel_obj = Channel.objects.get(pk=int(channel_id))
#             except (Channel.DoesNotExist, ValueError, TypeError):
#                 raise ValidationError("Канал не знайдено")
#
#         # Create poll
#         poll = Poll.objects.create(
#             question=question,
#             channel=channel_obj,
#         )
#
#         # Create choices
#         for choice_text in choices_data:
#             if not choice_text or not choice_text.strip():
#                 continue
#             Choice.objects.create(
#                 poll=poll,
#                 text=choice_text.strip(),
#                 votes=0
#             )
#
#         return poll


def get_factory(content_type: str) -> BaseContentFactory:
    """
    Factory Method - selects and returns appropriate factory.

    This is the Factory Method pattern - a method that creates
    and returns the appropriate factory instance.

    Args:
        content_type: Type of content ('standard', 'interactive', 'poll')

    Returns:
        Appropriate factory instance

    Raises:
        ValidationError: If content_type is unknown
    """
    factories = {
        'standard': StandardArticleFactory(),
        'interactive': InteractiveArticleFactory()

    }

    factory = factories.get(content_type)
    if not factory:
        valid_types = ', '.join(factories.keys())
        raise ValidationError(
            f"Невідомий тип контенту: '{content_type}'. "
            f"Дозволені типи: {valid_types}"
        )

    return factory
