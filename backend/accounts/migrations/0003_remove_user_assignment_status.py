from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_assignment_status_user_manager"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="user",
            name="assignment_status",
        ),
    ]
