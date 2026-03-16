from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vocabulary', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vocabulary',
            name='image',
            field=models.ImageField(upload_to='exercise_images/'),
        ),
    ]
