from django.contrib import admin
from django.contrib.auth import get_user_model

from ..articles.models import Article, Comment, Subscription, Notification, Channel

User = get_user_model()

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'publish_date', 'category', 'type')
    prepopulated_fields = {"slug": ("title",)}
    list_filter = ('status', 'category', 'type')
    search_fields = ('title', 'content')


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_premium', 'date_joined')
    list_filter = ('is_staff', 'is_premium', 'is_active')
    list_editable = ('is_premium',)
    search_fields = ('username', 'email')
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('article', 'user', 'created_at', 'moderated')
    list_filter = ('moderated',)
    search_fields = ('content',)

admin.site.register(Subscription)
admin.site.register(Notification)
admin.site.register(Channel)
