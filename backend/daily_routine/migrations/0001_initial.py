import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyRoutineExerciseSet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='daily_routine_exercise_sets', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='DailyRoutineEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('spanish_sentence', models.TextField()),
                ('english_sentence', models.TextField()),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('exercise_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='entries', to='daily_routine.dailyroutineexerciseset')),
            ],
            options={
                'ordering': ['created_at'],
                'unique_together': {('exercise_set', 'spanish_sentence')},
            },
        ),
    ]

