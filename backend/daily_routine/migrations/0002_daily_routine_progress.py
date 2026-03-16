from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('daily_routine', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyRoutineExerciseProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('correct_count', models.IntegerField(default=0)),
                ('total_count', models.IntegerField(default=0)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('exercise_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='progress', to='daily_routine.dailyroutineexerciseset')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='daily_routine_exercise_progress', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'exercise_set')},
            },
        ),
    ]

