from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet

router = DefaultRouter()
# If you want /api/reviews/ to handle POST, you typically register with no prefix:
router.register(r'', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
