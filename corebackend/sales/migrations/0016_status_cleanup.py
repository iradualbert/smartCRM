from django.db import migrations, models


def migrate_document_statuses(apps, schema_editor):
    Quotation = apps.get_model("sales", "Quotation")
    Invoice = apps.get_model("sales", "Invoice")

    Quotation.objects.filter(status="approved").update(status="accepted")
    Quotation.objects.filter(status="expired").update(status="rejected")
    Invoice.objects.filter(status__in=["partially_paid", "cancelled"]).update(status="sent")


class Migration(migrations.Migration):

    dependencies = [
        ("sales", "0015_backfill_company_number_counters"),
    ]

    operations = [
        migrations.RunPython(migrate_document_statuses, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="quotation",
            name="status",
            field=models.CharField(
                choices=[
                    ("draft", "Draft"),
                    ("sent", "Sent"),
                    ("accepted", "Accepted"),
                    ("rejected", "Rejected"),
                ],
                default="draft",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="invoice",
            name="status",
            field=models.CharField(
                choices=[
                    ("draft", "Draft"),
                    ("sent", "Sent"),
                    ("paid", "Paid"),
                    ("overdue", "Overdue"),
                ],
                default="draft",
                max_length=20,
            ),
        ),
    ]
