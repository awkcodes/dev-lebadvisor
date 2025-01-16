# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
from location.models import Location
from categories.models import Category

# 9 Governorates (example). Adjust spelling/wording to match your actual list.
GOVERNORATE_CHOICES = [
    ("Beirut", "Beirut"),
    ("Mount Lebanon", "Mount Lebanon"),
    ("North Lebanon", "North Lebanon"),
    ("Akkar", "Akkar"),
    ("Baalbek-Hermel", "Baalbek-Hermel"),
    ("Bekaa", "Bekaa"),
    ("South Lebanon", "South Lebanon"),
    ("Nabatieh", "Nabatieh"),
    ("Keserwan", "Keserwan"),
]

class PhoneVerification(models.Model):
    phone_number = models.CharField(max_length=15, unique=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self, timeout=300):
        return (timezone.now() - self.created_at) > timedelta(seconds=timeout)

    def __str__(self):
        return f"{self.phone_number} - {self.code}"

class CustomUser(AbstractUser):
    # We'll no longer store age, so remove that.
    # age = models.PositiveIntegerField(null=True, blank=True)  # REMOVED

    phone = models.CharField(max_length=15)
    email = models.EmailField(unique=True)


    # New required governorate field
    governorate = models.CharField(
        max_length=50,
        choices=GOVERNORATE_CHOICES,
        default="Beirut"
    )

    is_supplier = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Supplier(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.user.username

class Customer(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    location = models.ManyToManyField(Location, blank=True)
    preferences = models.ManyToManyField(Category, blank=True)

    def __str__(self):
        return self.user.username
