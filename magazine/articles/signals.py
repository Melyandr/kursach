from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Article, Notification

User = get_user_model()

@receiver(post_save, sender=Article)
def article_post_save(sender, instance: Article, created, **kwargs):
    # якщо стаття опублікована і ще не відправляли нотифікації
    if instance.status == 'published' and not instance.notified:
        # приклад: надсилаємо всім активним користувачам
        users = User.objects.filter(is_active=True)
        for user in users:
            # при бажанні фільтруй лише преміум-підписників:
            # subs = user.subscriptions.filter(active=True).first()
            # if instance.is_premium and (not subs or not subs.is_active()): continue

            Notification.objects.create(
                user=user,
                text=f"Нова стаття: {instance.title}",
                link=f"/articles/{instance.slug}/"
            )

        # позначаємо, що нотифікації вже створено
        instance.notified = True
        instance.save(update_fields=['notified'])
