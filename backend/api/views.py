from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from activities.models import Activity
from activities.serializers import ActivitySerializer
from tours.models import Tour
from tours.serializers import TourSerializer
from packages.models import Package
from packages.serializers import PackageSerializer
from users.models import Customer
from django.db.models import Q
from django.utils import timezone


@api_view(["GET"])
@permission_classes([AllowAny])
def for_you_items(request):
    customer = Customer.objects.get(user=request.user)
    preferred_locations = customer.location.all()
    preferred_categories = customer.preferences.all()

    current_time = timezone.now()
    activities = Activity.objects.filter(
        location__in=preferred_locations,
        categories__in=preferred_categories,
        available_to__gte=current_time,
    ).distinct()
    packages = Package.objects.filter(
        location__in=preferred_locations,
        categories__in=preferred_categories,
        available_to__gte=current_time,
    ).distinct()
    tours = Tour.objects.filter(
        location__in=preferred_locations,
        categories__in=preferred_categories,
        available_to__gte=current_time,
    ).distinct()

    activity_serializer = ActivitySerializer(activities, many=True)
    package_serializer = PackageSerializer(packages, many=True)
    tour_serializer = TourSerializer(tours, many=True)

    combined_results = {
        "activities": activity_serializer.data,
        "packages": package_serializer.data,
        "tours": tour_serializer.data,
    }

    return Response(combined_results)


@api_view(["GET"])
@permission_classes([AllowAny])
def latest_items_api(request):
    current_time = timezone.now()
    activities = Activity.objects.filter(
        available_to__gte=current_time,
    ).order_by(
        "-created_at"
    )[:4]
    tours = Tour.objects.filter(
        available_to__gte=current_time,
    ).order_by(
        "-created_at"
    )[:3]
    packages = Package.objects.filter(
        available_to__gte=current_time,
    ).order_by(
        "-created_at"
    )[:3]
    activity_serializer = ActivitySerializer(activities, many=True)
    tour_serializer = TourSerializer(tours, many=True)
    package_serializer = PackageSerializer(packages, many=True)
    data = {
        "activities": activity_serializer.data,
        "tours": tour_serializer.data,
        "packages": package_serializer.data,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def family_picks_api(request):
    activities = Activity.objects.filter(family=True)
    packages = Package.objects.filter(family=True)
    tours = Tour.objects.filter(family=True)

    activity_serializer = ActivitySerializer(activities, many=True)
    package_serializer = PackageSerializer(packages, many=True)
    tour_serializer = TourSerializer(tours, many=True)

    return Response({
        "activities": activity_serializer.data,
        "packages": package_serializer.data,
        "tours": tour_serializer.data
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def seasonal_highlights_api(request):
    activities = Activity.objects.filter(seasonal=True)
    packages = Package.objects.filter(seasonal=True)
    tours = Tour.objects.filter(seasonal=True)

    activity_serializer = ActivitySerializer(activities, many=True)
    package_serializer = PackageSerializer(packages, many=True)
    tour_serializer = TourSerializer(tours, many=True)

    return Response({
        "activities": activity_serializer.data,
        "packages": package_serializer.data,
        "tours": tour_serializer.data
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def local_favorites_api(request):
    activities = Activity.objects.filter(local_favorites=True)
    packages = Package.objects.filter(local_favorites=True)
    tours = Tour.objects.filter(local_favorites=True)

    activity_serializer = ActivitySerializer(activities, many=True)
    package_serializer = PackageSerializer(packages, many=True)
    tour_serializer = TourSerializer(tours, many=True)

    return Response({
        "activities": activity_serializer.data,
        "packages": package_serializer.data,
        "tours": tour_serializer.data
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def featured_items_api(request):
    # Fetch featured items from each model
    current_time = timezone.now()
    activities = Activity.objects.filter(
        featured=True,
        available_to__gte=current_time,
    ).order_by("-created_at")[:10]
    tours = Tour.objects.filter(
        featured=True,
        available_to__gte=current_time,
    ).order_by("-created_at")[:10]
    packages = Package.objects.filter(
        featured=True,
        available_to__gte=current_time,
    ).order_by("-created_at")[:10]
    activity_serializer = ActivitySerializer(activities, many=True)
    tour_serializer = TourSerializer(tours, many=True)
    package_serializer = PackageSerializer(packages, many=True)
    data = {
        "activities": activity_serializer.data,
        "tours": tour_serializer.data,
        "packages": package_serializer.data,
    }
    return Response(data)



@api_view(["GET"])
@permission_classes([AllowAny])
def search(request):
    """
    Expects GET params:
      ?keyword=...
      &category=... (activities|tours|packages| blank => all)
      &location=...
      &theme_id=... (ID from the Category model)
    Returns JSON of matched items in arrays: 'activities', 'tours', 'packages'.
    """

    keyword = request.GET.get("keyword", "").strip()
    category = request.GET.get("category", "").strip()
    location = request.GET.get("location", "").strip()
    theme_id_str = request.GET.get("theme_id", "").strip()

    activity_results = Activity.objects.none()
    tour_results = Tour.objects.none()
    package_results = Package.objects.none()

    # Should we search each model?
    consider_activities = (category == "") or (category.lower() == "activities")
    consider_tours = (category == "") or (category.lower() == "tours")
    consider_packages = (category == "") or (category.lower() == "packages")

    def build_search_qs(model, kw, loc, theme_id):
        qs = model.objects.all()

        # location filter
        if loc:
            qs = qs.filter(location__name__icontains=loc)

        # keyword filter on title, description, location
        if kw:
            qs = qs.filter(
                Q(title__icontains=kw)
                | Q(description__icontains=kw)
                | Q(location__name__icontains=kw)
            )

        # theme_id filter => categories__id
        if theme_id and theme_id.isdigit():
            qs = qs.filter(categories__id=theme_id)

        return qs.distinct()

    if consider_activities:
        activity_results = build_search_qs(Activity, keyword, location, theme_id_str)

    if consider_tours:
        tour_results = build_search_qs(Tour, keyword, location, theme_id_str)

    if consider_packages:
        package_results = build_search_qs(Package, keyword, location, theme_id_str)

    # Serialize
    activity_serializer = ActivitySerializer(activity_results, many=True)
    tour_serializer = TourSerializer(tour_results, many=True)
    package_serializer = PackageSerializer(package_results, many=True)

    return Response(
        {
            "activities": activity_serializer.data,
            "tours": tour_serializer.data,
            "packages": package_serializer.data,
        },
        status=status.HTTP_200_OK,
    )
