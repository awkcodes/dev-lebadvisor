# Generated by Django 5.0.6 on 2024-12-25 16:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tour',
            name='family',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='tour',
            name='local_favorites',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='tour',
            name='seasonal',
            field=models.BooleanField(default=False),
        ),
    ]