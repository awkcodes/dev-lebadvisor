from django.db import models


class Location(models.Model):
    name = models.CharField(max_length=150)

    class Meta:
        verbose_name_plural = "locations"

    def __str__(self):
        return self.name


class SubLocation(models.Model):
    name = models.CharField(max_length=150)
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name='sublocations'
    )

    class Meta:
        verbose_name_plural = "sublocations"

    def __str__(self):
        return f"{self.location.name} - {self.name}"
