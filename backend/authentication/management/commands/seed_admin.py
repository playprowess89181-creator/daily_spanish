from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password


class Command(BaseCommand):
    help = "Seed an admin (superuser) account for the application."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            default="admin@gmail.com",
            help="Email for the admin user",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="admin@123",
            help="Password for the admin user",
        )
        parser.add_argument(
            "--name",
            type=str,
            default="Admin",
            help="Display name for the admin user",
        )

    def handle(self, *args, **options):
        User = get_user_model()
        email = options["email"].strip().lower()
        password = options["password"]
        name = options["name"].strip()

        # If a user with this email exists, update it to superuser/staff
        user = User.objects.filter(email=email).first()
        if user:
            if not user.is_staff or not user.is_superuser:
                user.is_staff = True
                user.is_superuser = True
                if password:
                    user.password = make_password(password)
                if not user.username:
                    user.username = email
                if not user.name:
                    user.name = name
                user.is_verified = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Updated existing user '{email}' to admin."))
            else:
                self.stdout.write(self.style.WARNING(f"Admin user '{email}' already exists."))
            return

        # Create new admin user
        user = User(
            email=email,
            username=email,  # username still exists on the model
            name=name,
            is_staff=True,
            is_superuser=True,
            is_verified=True,
        )
        user.password = make_password(password)
        user.save()

        self.stdout.write(self.style.SUCCESS(f"Created admin user '{email}'."))