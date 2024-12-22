from .models import Category, SubCategory
from .serializers import CategorySerializer, SubCategorySerializer
from rest_framework.decorators import (
        api_view,
        permission_classes
        )
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


# get all categories , make it accessible for anyone
@api_view(["GET"])
@permission_classes([AllowAny])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


# get all subcategories , make it accessible for anyone
@api_view(["GET"])
@permission_classes([AllowAny])
def get_subcategories(request):
    subcategories = SubCategory.objects.all()
    serializer = SubCategorySerializer(subcategories, many=True)
    return Response(serializer.data)
