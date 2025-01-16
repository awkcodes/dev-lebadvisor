# activities/serializers.py
from rest_framework import serializers
from .models import Activity, Period, Included, Excluded, Faq, Catalog, ActivityOffer
from users.models import Supplier
from categories.models import Category, SubCategory
from location.models import Location, SubLocation
from location.serializers import LocationSerializer

class IncludedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Included
        fields = ["id", "include"]

class ExcludedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Excluded
        fields = ["id", "Exclude"]

class FaqSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faq
        fields = ["id", "question", "answer"]

class CatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catalog
        fields = ["id", "image"]

class OffActivitySerializer(serializers.ModelSerializer):
    included_items = IncludedSerializer(
        many=True, read_only=True, source="included_set"
    )
    excluded_items = ExcludedSerializer(
        many=True, read_only=True, source="excluded_set"
    )
    faqs = FaqSerializer(many=True, read_only=True, source="faq_set")
    catalogs = CatalogSerializer(many=True, read_only=True, source="catalog_set")
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all())
    categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True
    )
    location = LocationSerializer()

    # ADD subcategories and sublocations here if you want them in OffActivity too
    subcategories = serializers.PrimaryKeyRelatedField(
        queryset=SubCategory.objects.all(), many=True
    )
    sublocations = serializers.PrimaryKeyRelatedField(
        queryset=SubLocation.objects.all(), many=True
    )

    class Meta:
        model = Activity
        fields = [
            "id",
            "supplier",
            "title",
            "image",
            "description",
            "price",
            "requests",
            "created_at",
            "available_from",
            "available_to",
            "categories",
            "subcategories",       # new
            "sublocations",        # new
            "stock",
            "period",
            "days_off",
            "unit",
            "start_time",
            "end_time",
            "location",
            "audio_languages",
            "cancellation_policy",
            "group_size",
            "participant_age_range",
            "included_items",
            "excluded_items",
            "faqs",
            "catalogs",
            "map",
        ]
        read_only_fields = ["created_at"]


class ActivityOfferSerializer(serializers.ModelSerializer):
    activity = OffActivitySerializer()

    class Meta:
        model = ActivityOffer
        fields = ["id", "title", "price", "stock", "activity"]


class ActivitySerializer(serializers.ModelSerializer):
    included_items = IncludedSerializer(
        many=True, read_only=True, source="included_set"
    )
    excluded_items = ExcludedSerializer(
        many=True, read_only=True, source="excluded_set"
    )
    faqs = FaqSerializer(many=True, read_only=True, source="faq_set")
    catalogs = CatalogSerializer(many=True, read_only=True, source="catalog_set")
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all())
    categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True
    )
    location = LocationSerializer()
    offers = ActivityOfferSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    # The critical fix: 
    # We add subcategories + sublocations fields so the front-end sees them
    subcategories = serializers.PrimaryKeyRelatedField(
        queryset=SubCategory.objects.all(), many=True
    )
    sublocations = serializers.PrimaryKeyRelatedField(
        queryset=SubLocation.objects.all(), many=True
    )

    class Meta:
        model = Activity
        fields = [
            "id",
            "supplier",
            "title",
            "image",
            "description",
            "price",
            "requests",
            "created_at",
            "available_from",
            "available_to",
            "categories",
            "subcategories",
            "sublocations",
            "stock",
            "period",
            "days_off",
            "unit",
            "start_time",
            "end_time",
            "location",
            "audio_languages",
            "cancellation_policy",
            "group_size",
            "participant_age_range",
            "included_items",
            "excluded_items",
            "faqs",
            "catalogs",
            "map",
            "offers",
            "average_rating",
            "reviews_count",
        ]
        read_only_fields = ["created_at"]


class PeriodSerializer(serializers.ModelSerializer):
    activity_offer = ActivityOfferSerializer()

    class Meta:
        model = Period
        fields = "__all__"
