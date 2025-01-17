# Generated by Django 5.0.6 on 2024-12-21 18:58

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('categories', '0001_initial'),
        ('location', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Catalog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='activities/')),
            ],
        ),
        migrations.CreateModel(
            name='Excluded',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Exclude', models.CharField(max_length=350)),
            ],
        ),
        migrations.CreateModel(
            name='Faq',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.CharField(max_length=500)),
                ('answer', models.CharField(max_length=500)),
            ],
        ),
        migrations.CreateModel(
            name='Included',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('include', models.CharField(max_length=350)),
            ],
        ),
        migrations.CreateModel(
            name='ItineraryStep',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('activity', models.TextField(help_text='What to do there')),
            ],
            options={
                'verbose_name_plural': 'Itinerary Steps',
            },
        ),
        migrations.CreateModel(
            name='TourDay',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day', models.DateField()),
                ('stock', models.IntegerField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
        ),
        migrations.CreateModel(
            name='TourOffer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('stock', models.PositiveIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Tour',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('featured', models.BooleanField(default=False)),
                ('title', models.CharField(max_length=255)),
                ('image', models.ImageField(upload_to='tours/')),
                ('description', models.TextField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('requests', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('available_from', models.DateField()),
                ('available_to', models.DateField()),
                ('stock', models.PositiveIntegerField(default=0)),
                ('period', models.PositiveIntegerField(help_text='Period in hours')),
                ('days_off', models.CharField(blank=True, help_text='Days off (comma-separated)', max_length=255, null=True)),
                ('unit', models.CharField(max_length=50)),
                ('pickup_location', models.TextField()),
                ('pickup_time', models.TimeField()),
                ('dropoff_time', models.TimeField()),
                ('languages', models.TextField(blank=True, null=True)),
                ('min_age', models.IntegerField(blank=True, null=True)),
                ('cancellation_policy', models.TextField(blank=True, null=True)),
                ('additional_info', models.TextField(blank=True, null=True)),
                ('participant_age_range', models.CharField(blank=True, max_length=50, null=True)),
                ('categories', models.ManyToManyField(blank=True, related_name='tours', to='categories.category')),
                ('location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='location.location')),
                ('subcategories', models.ManyToManyField(blank=True, related_name='tours', to='categories.subcategory')),
                ('sublocations', models.ManyToManyField(blank=True, related_name='tours', to='location.sublocation')),
            ],
            options={
                'verbose_name_plural': 'tours',
            },
        ),
    ]
