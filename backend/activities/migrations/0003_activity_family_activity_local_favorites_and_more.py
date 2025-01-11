# Generated by Django 5.0.6 on 2024-12-25 16:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='activity',
            name='family',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='activity',
            name='local_favorites',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='activity',
            name='seasonal',
            field=models.BooleanField(default=False),
        ),
    ]
