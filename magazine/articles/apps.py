from django.apps import AppConfig

class ArticlesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'magazine.articles'

    def ready(self):
        import magazine.articles.signals  # noqa
