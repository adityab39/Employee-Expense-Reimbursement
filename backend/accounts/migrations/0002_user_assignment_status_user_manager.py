from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="assignment_status",
            field=models.CharField(
                choices=[("pending_assignment", "Pending Assignment"), ("active", "Active")],
                default="pending_assignment",
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="manager",
            field=models.ForeignKey(
                blank=True,
                limit_choices_to={"role": "manager"},
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="team_members",
                to="accounts.user",
            ),
        ),
    ]
