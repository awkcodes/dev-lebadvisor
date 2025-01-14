from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
from location.models import Location
from categories.models import Category

class PhoneVerification(models.Model):
    phone_number = models.CharField(max_length=15, unique=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self, timeout=300):
        """
        Check if the code is expired after `timeout` seconds.
        Default timeout is 5 minutes (300 seconds).
        """
        return (timezone.now() - self.created_at) > timedelta(seconds=timeout)

    def __str__(self):
        return f"{self.phone_number} - {self.code}"

class CustomUser(AbstractUser):
    """
    Inherits:
      - username
      - password
      - first_name
      - last_name
      - email
    from AbstractUser.
    """

    phone = models.CharField(max_length=15)  
    age = models.PositiveIntegerField(null=True, blank=True)  # optional

    is_supplier = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Supplier(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return self.user.username

class Customer(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    location = models.ManyToManyField(Location, blank=True)
    preferences = models.ManyToManyField(Category, blank=True)

    def __str__(self):
        return self.user.username
