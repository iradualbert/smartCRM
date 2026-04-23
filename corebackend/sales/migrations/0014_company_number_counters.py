from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("sales", "0013_documentevent_source_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="next_delivery_note_number",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="company",
            name="next_invoice_number",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="company",
            name="next_proforma_number",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="company",
            name="next_quotation_number",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="company",
            name="next_receipt_number",
            field=models.PositiveIntegerField(default=1),
        ),
    ]
