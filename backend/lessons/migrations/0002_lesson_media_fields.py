from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lessons', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='video_file',
            field=models.FileField(blank=True, null=True, upload_to='lesson_videos/'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='video_url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='lesson',
            name='lesson_pdf',
            field=models.FileField(blank=True, null=True, upload_to='lesson_pdfs/'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='keys_pdf',
            field=models.FileField(blank=True, null=True, upload_to='lesson_keys_pdfs/'),
        ),
        migrations.DeleteModel(
            name='LessonPart',
        ),
    ]
