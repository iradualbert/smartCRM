import re

from django.db import migrations


def _next_counter_for_queryset(queryset, field_name, prefix):
    max_number = 0
    pattern = re.compile(rf"^{re.escape(prefix)}-(\d+)$")
    for value in queryset.values_list(field_name, flat=True):
        match = pattern.match(value or "")
        if match:
            max_number = max(max_number, int(match.group(1)))
    return max_number + 1 if max_number else 1


def backfill_company_number_counters(apps, schema_editor):
    Company = apps.get_model("sales", "Company")
    Quotation = apps.get_model("sales", "Quotation")
    Proforma = apps.get_model("sales", "Proforma")
    Invoice = apps.get_model("sales", "Invoice")
    Receipt = apps.get_model("sales", "Receipt")
    DeliveryNote = apps.get_model("sales", "DeliveryNote")

    for company in Company.objects.all().iterator():
        company.next_quotation_number = _next_counter_for_queryset(
            Quotation.objects.filter(company=company),
            "quote_number",
            company.quotation_prefix or "QUO",
        )
        company.next_proforma_number = _next_counter_for_queryset(
            Proforma.objects.filter(company=company),
            "proforma_number",
            company.proforma_prefix or "PRO",
        )
        company.next_invoice_number = _next_counter_for_queryset(
            Invoice.objects.filter(company=company),
            "invoice_number",
            company.invoice_prefix or "INV",
        )
        company.next_receipt_number = _next_counter_for_queryset(
            Receipt.objects.filter(company=company),
            "receipt_number",
            company.receipt_prefix or "REC",
        )
        company.next_delivery_note_number = _next_counter_for_queryset(
            DeliveryNote.objects.filter(company=company),
            "delivery_note_number",
            company.delivery_note_prefix or "DN",
        )
        company.save(
            update_fields=[
                "next_quotation_number",
                "next_proforma_number",
                "next_invoice_number",
                "next_receipt_number",
                "next_delivery_note_number",
            ]
        )


class Migration(migrations.Migration):

    dependencies = [
        ("sales", "0014_company_number_counters"),
    ]

    operations = [
        migrations.RunPython(backfill_company_number_counters, migrations.RunPython.noop),
    ]
