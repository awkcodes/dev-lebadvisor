from django.contrib import admin
from .models import Location
from .models import SubLocation


class SubLocationInline(admin.TabularInline):
    model = SubLocation
    extra = 1


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    inlines = [SubLocationInline]

@admin.register(SubLocation)
class SubLocationAdmin(admin.ModelAdmin):
    list_display = ('name','location')
    list_filter = ('name',)
    search_fields = ('name','location__name')
