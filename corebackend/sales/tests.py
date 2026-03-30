from template_mapper_utils import (
    build_standard_sales_document_data,
    render_mapped_template_to_pdf,
)

standard_data = build_standard_sales_document_data(
    {
        "document": {
            "number": "INV-1001",
            "date": "2026-03-29",
            "due_date": "2026-04-05",
            "currency": "USD",
            "currency_symbol": "$",
        },
        "company": {
            "name": "Acme Solutions Ltd.",
            "address": "123 Business Street",
            "email": "billing@acme.com",
            "phone": "+90 555 123 4567",
        },
        "client": {
            "name": "John Doe",
            "details": "Berlin, Germany",
        },
        "lines": [
            {"description": "Website Design", "qty": 1, "unit_price": 800},
            {"description": "Hosting", "qty": 1, "unit_price": 120},
        ],
        "tax_rate": 0.18,
        "notes": "Thank you for your business.",
    },
    document_type="invoice",
)

mapping = {
    "DocumentNumber": "document.number",
    "DocumentDate": "document.date",
    "DueDate": "document.due_date",
    "CompanyName": "company.name",
    "CompanyAddress": "company.address",
    "CompanyEmail": "company.email",
    "CompanyPhone": "company.phone",
    "ClientName": "client.name",
    "ClientDetails": "client.details",
    "LineDescription": "lines.description",
    "LineQty": "lines.qty",
    "LineUnitPrice": "lines.unit_price",
    "LineTotal": "lines.total",
    "SubTotal": "totals.subtotal",
    "TaxRatePercent": "totals.tax_rate_percent",
    "Tax": "totals.tax",
    "Total": "totals.total",
    "Notes": "notes",
}

result = render_mapped_template_to_pdf(
    template_path="./content/invoice_standard_template.docx",
    output_pdf_path="./content/output/final_invoice.pdf",
    standard_data=standard_data,
    mapping=mapping,
    document_type="invoice",
)


print("PDF generation result:", result)