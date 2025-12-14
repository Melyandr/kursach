# from django.core.management.base import BaseCommand
# from django.contrib.auth import get_user_model
# from  ...factories import ArticleFactory, SubscriptionFactory
#
# User = get_user_model()
#
#
# class Command(BaseCommand):
#     help = "Генерує тестові дані: користувачів, статті та підписки"
#
#     def handle(self, *args, **options):
#         # 1. Створюємо користувача (якщо ще немає)
#         user, created = User.objects.get_or_create(
#             username="testuser",
#             defaults={"email": "testuser@example.com", "password": "password123"}
#         )
#         if created:
#             self.stdout.write(self.style.SUCCESS(f"Створено користувача {user.username}"))
#         else:
#             self.stdout.write(self.style.WARNING(f"Користувач {user.username} вже існує"))
#
#         # 2. Створюємо кілька статей
#         ArticleFactory.create_article(
#             article_type='standard',
#             title="Звичайна стаття",
#             slug="standard-article",
#             content="Це приклад звичайної статті.",
#             author=user
#         )
#
#         ArticleFactory.create_article(
#             article_type='interactive',
#             title="Інтерактивна стаття",
#             slug="interactive-article",
#             content="Це приклад інтерактивної статті.",
#             author=user
#         )
#
#         # 3. Створюємо підписку
#         SubscriptionFactory.create_subscription(
#             sub_type="premium",
#             user=user
#         )
#
#         self.stdout.write(self.style.SUCCESS("Дані згенеровано успішно ✅"))
