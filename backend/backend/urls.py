from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from .views import index
urlpatterns = [
    path("", index),
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('api/', include('api.urls')),
    path('tinymce/', include('tinymce.urls')),
]
urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT)
