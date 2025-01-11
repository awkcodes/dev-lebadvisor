from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Filter by content_type and object_id if provided in query parameters
        queryset = super().get_queryset()
        content_type_id = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')
        if content_type_id and object_id:
            queryset = queryset.filter(content_type_id=content_type_id, object_id=object_id)
        return queryset

    def perform_create(self, serializer):
        # Save the review and associate it with the logged-in user
        instance = serializer.save(user=self.request.user)
        instance.content_object.update_reviews()
        # Trigger review calculation on the associated object
        content_object = instance.content_object
        if hasattr(content_object, 'update_reviews'):
            content_object.update_reviews()
