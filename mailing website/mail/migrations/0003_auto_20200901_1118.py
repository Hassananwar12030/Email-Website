# Generated by Django 2.1.5 on 2020-09-01 06:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mail', '0002_auto_20200827_1205'),
    ]

    operations = [
        migrations.AlterField(
            model_name='email',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]