from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0010_user_payment_due_override'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='companion_image',
            field=models.CharField(blank=True, choices=[('B_1', 'B_1'), ('G_1', 'G_1'), ('O_1', 'O_1'), ('P_1', 'P_1')], max_length=10, null=True),
        ),
    ]

