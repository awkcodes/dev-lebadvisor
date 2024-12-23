# Generated by Django 5.0.6 on 2024-12-21 18:58

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('favorites', '0001_initial'),
        ('packages', '0001_initial'),
        ('tours', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='favoriteactivity',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='favoritepackage',
            name='package',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='packages.package'),
        ),
        migrations.AddField(
            model_name='favoritepackage',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='favoritetour',
            name='tour',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tours.tour'),
        ),
        migrations.AddField(
            model_name='favoritetour',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='favoriteactivity',
            unique_together={('user', 'activity')},
        ),
        migrations.AlterUniqueTogether(
            name='favoritepackage',
            unique_together={('user', 'package')},
        ),
        migrations.AlterUniqueTogether(
            name='favoritetour',
            unique_together={('user', 'tour')},
        ),
    ]
