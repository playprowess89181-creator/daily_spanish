from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0006_alter_user_profile_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='referral_source',
            field=models.CharField(max_length=100, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='user',
            name='legal_notice_accepted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='legal_notice_accepted_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]

