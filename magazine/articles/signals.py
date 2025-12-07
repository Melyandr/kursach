# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.contrib.auth import get_user_model
#
# from .models import Article, Notification
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Subscription, Article, Notification, Poll


# User = get_user_model()


@receiver(post_save, sender=Article)
def create_notifications_for_article(sender, instance, created, **kwargs):
    if not created or not instance.channel:
        return

    # беремо тільки активних користувачів, які підписані на канал
    subscribers = Subscription.objects.filter(
        channel=instance.channel,
        user__is_active=True
    ).select_related('user')

    seen_users = set()
    for sub in subscribers:
        if sub.user_id in seen_users:
            continue
        seen_users.add(sub.user_id)
        Notification.objects.create(
            user=sub.user,
            text=f"Нова стаття в каналі {instance.channel.name}: {instance.title}",
            link=f"/channels/{instance.channel.id}/articles/{instance.id}/",
            channel_name=instance.channel.name
        )


from ..core.observer import NotificationObserver
from ..core.subjects import PollSubject

@receiver(post_save, sender=Poll)
def poll_post_save(sender, instance, created, **kwargs):
    if not created:
        return

    # Створюємо Subject
    poll_subject = PollSubject(instance)

    # Додаємо Observer для кожного підписника
    subs = Subscription.objects.filter(channel=instance.channel)
    for s in subs:
        observer = NotificationObserver(s.user)
        poll_subject.attach(observer)

    # Повідомляємо всіх спостерігачів
    poll_subject.notify()