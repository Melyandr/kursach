from django.contrib import admin

# Register your models here.
from django.contrib import admin
from ..articles.models import Article, Comment, Subscription, Notification, Profile, Channel

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'publish_date', 'category', 'type')
    prepopulated_fields = {"slug": ("title",)}
    list_filter = ('status', 'category', 'type')
    search_fields = ('title', 'content')




@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "is_premium")
    list_editable = ("is_premium",)
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('article', 'user', 'created_at', 'moderated')
    list_filter = ('moderated',)
    search_fields = ('content',)

admin.site.register(Subscription)
admin.site.register(Notification)
admin.site.register(Channel)
