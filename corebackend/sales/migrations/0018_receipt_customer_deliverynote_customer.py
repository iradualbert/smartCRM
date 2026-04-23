from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("sales", "0017_merge_20260423_1200"),
    ]

    operations = [
        migrations.AddField(
            model_name="receipt",
            name="customer",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="receipts",
                to="sales.customer",
            ),
        ),
        migrations.AddField(
            model_name="deliverynote",
            name="customer",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="delivery_notes",
                to="sales.customer",
            ),
        ),
    ]
