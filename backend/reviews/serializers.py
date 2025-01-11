# reviews/serializers.py
from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = Review
        # Include content_type and object_id
        fields = [
            'id',
            'user',
            'content_type',
            'object_id',
            'rating',
            'text',
            'created_at',
            'updated_at',
            'username'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'username']

    def get_username(self, obj):
        return obj.user.username
