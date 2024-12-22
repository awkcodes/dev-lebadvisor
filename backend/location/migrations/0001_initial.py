# Generated by Django 5.0.6 on 2024-12-21 18:58

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
            ],
            options={
                'verbose_name_plural': 'locations',
            },
        ),
        migrations.CreateModel(
            name='SubLocation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sublocations', to='location.location')),
            ],
            options={
                'verbose_name_plural': 'sublocations',
            },
        ),
    ]
