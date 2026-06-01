from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.AddField(
            model_name="user",
            name="authguard_user_id",
            field=models.UUIDField(null=True, blank=True, db_index=True),
        ),
    ]
