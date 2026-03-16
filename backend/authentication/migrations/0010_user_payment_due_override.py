from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0009_subscription_onboarding'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='payment_due_override',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

