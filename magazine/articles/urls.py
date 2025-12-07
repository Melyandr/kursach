"""
URL configuration for articles project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from django.contrib import admin
# from django.urls import path
#
# urlpatterns = [
#     path("admin/", admin.site.urls),
# ]
from django.contrib import admin
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from ..core.serializers import UserNotificationsView
from ..core.views import ArticleViewSet, CommentViewSet, SubscriptionViewSet, NotificationViewSet, current_user, \
    ChannelViewSet, SavedArticleViewSet, PollViewSet, UserViewSet, ChannelPollListView, UserMeView, \
    RegisterView, EmailLoginView, UserManagementViewSet
from ..core.views import CreateContentView

router = DefaultRouter()
router.register(r'articles', ArticleViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r"channels", ChannelViewSet, basename="channel")
router.register(r'saved', SavedArticleViewSet, basename='saved')
router.register(r'polls', PollViewSet, basename='polls')
router.register(r'users', UserViewSet, basename='user')
router.register(r'admin/users', UserManagementViewSet, basename='admin-users')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/login/', EmailLoginView.as_view(), name='email-login'),
    path('api/register/', RegisterView.as_view(), name='register'),

    path('api/user/', current_user),
    path('api/users/me/', UserMeView.as_view(), name='user-me'),

    path("", include(router.urls)),
    path('channels/<int:id>/polls/', ChannelPollListView.as_view(), name='channel-polls'),

    path("api/content/create/", CreateContentView.as_view(), name="create-content"),
    path("api/my-notifications/", UserNotificationsView.as_view(), name="my-notifications"),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
