import os
import re
import tempfile
from pathlib import Path

from django.core.files import File
from django.core.exceptions import ValidationError
from django.utils import timezone

from billing.services.utils import adjust_storage_usage, can_generate_pdf, can_store_additional_bytes
from ..models import CURRENCY_SYMBOL_MAP, Document, Template
from ..template_mapper_utils import (
    build_standard_sales_document_data,
    inspect_template,
    render_mapped_template_to_pdf,
)


def file_exists(field_file):
    try:
        return bool(field_file and field_file.name and os.path.exists(field_file.path))
    except Exception:
        return False


def template_supports_currency(template, currency):
    if not template:
        return False
    if not template.supported_currencies:
        return True
    return currency in template.supported_currencies


def get_company_payload(company):
    if not company:
        return {
            "name": "", "legal_name": "", "address": "",
            "email": "", "phone": "", "website": "", "tax_number": "",
        }
    return {
        "name": company.legal_name or company.name or "",
        "legal_name": company.legal_name or company.name or "",
        "address": company.address or "",
        "email": company.email or "",
        "phone": company.phone or "",
        "website": company.website or "",
        "tax_number": company.tax_number or "",
    }


DOCUMENT_FILENAME_TYPE_MAP = {
    "quotation": "quote",
    "proforma": "proforma",
    "invoice": "invoice",
    "receipt": "receipt",
    "delivery_note": "delivery_note",
}


def infer_document_type(instance) -> str:
    model_name = instance.__class__.__name__.lower()
    mapping = {
        "quotation": "quotation",
        "proforma": "proforma",
        "invoice": "invoice",
        "receipt": "receipt",
        "deliverynote": "delivery_note",
    }
    if model_name not in mapping:
        raise ValidationError(f"Unsupported document instance type '{instance.__class__.__name__}'.")
    return mapping[model_name]


def get_document_identifier(instance) -> str:
    return (
        getattr(instance, "quote_number", None)
        or getattr(instance, "proforma_number", None)
        or getattr(instance, "invoice_number", None)
        or getattr(instance, "receipt_number", None)
        or getattr(instance, "delivery_note_number", None)
        or str(instance.pk)
    )


def get_document_customer_name(instance) -> str:
    customer = getattr(instance, "customer", None)
    if customer and getattr(customer, "name", None):
        return customer.name

    proforma = getattr(instance, "proforma", None)
    if proforma and getattr(proforma, "customer", None) and getattr(proforma.customer, "name", None):
        return proforma.customer.name

    quotation = getattr(instance, "quotation", None)
    if quotation and getattr(quotation, "customer", None) and getattr(quotation.customer, "name", None):
        return quotation.customer.name

    invoice = getattr(instance, "invoice", None)
    if invoice and getattr(invoice, "customer", None) and getattr(invoice.customer, "name", None):
        return invoice.customer.name
    if invoice and getattr(invoice, "proforma", None) and getattr(invoice.proforma, "customer", None):
        return invoice.proforma.customer.name

    return "customer"


def sanitize_filename_part(value: str) -> str:
    normalized = re.sub(r"[^A-Za-z0-9_-]+", "_", (value or "").strip())
    normalized = re.sub(r"_+", "_", normalized).strip("_")
    return normalized or "document"


def build_document_filename(instance, document_type: str | None = None) -> str:
    resolved_type = document_type or infer_document_type(instance)
    filename_type = DOCUMENT_FILENAME_TYPE_MAP.get(resolved_type, resolved_type)
    identifier = sanitize_filename_part(get_document_identifier(instance))
    customer_name = sanitize_filename_part(get_document_customer_name(instance))
    return f"{filename_type}_{identifier}_{customer_name}.pdf"


def get_template_for_instance(instance, document_type: str):
    currency = instance.get_effective_currency()
    selected_template = getattr(instance, "selected_template", None)

    if (
        selected_template
        and selected_template.is_active
        and selected_template.document_type == document_type
        and template_supports_currency(selected_template, currency)
    ):
        return selected_template

    company = getattr(instance, "company", None)

    if company:
        company_default_templates = Template.objects.filter(
            company=company,
            document_type=document_type,
            is_active=True,
            is_default=True,
        ).order_by("-created_at")
        for template in company_default_templates:
            if template_supports_currency(template, currency):
                return template

        company_templates = Template.objects.filter(
            company=company,
            document_type=document_type,
            is_active=True,
        ).order_by("-created_at")
        for template in company_templates:
            if template_supports_currency(template, currency):
                return template

    global_default_templates = Template.objects.filter(
        company__isnull=True,
        document_type=document_type,
        is_active=True,
        is_default=True,
    ).order_by("-created_at")
    for template in global_default_templates:
        if template_supports_currency(template, currency):
            return template

    global_templates = Template.objects.filter(
        company__isnull=True,
        document_type=document_type,
        is_active=True,
    ).order_by("-created_at")
    for template in global_templates:
        if template_supports_currency(template, currency):
            return template

    return None


def build_standard_data_from_instance(instance, document_type: str):
    currency = instance.get_effective_currency()
    currency_symbol = CURRENCY_SYMBOL_MAP.get(currency, "$")
    company = getattr(instance, "company", None)

    if document_type == "quotation":
        customer = instance.customer
        return build_standard_sales_document_data(
            {
                "document": {
                    "number": instance.quote_number,
                    "date": instance.created_at.date().isoformat() if instance.created_at else "",
                    "valid_until": "",
                    "currency": currency,
                    "currency_symbol": currency_symbol,
                },
                "company": get_company_payload(company),
                "client": {
                    "name": customer.name if customer else "",
                    "details": (customer.address or customer.email or "") if customer else "",
                },
                "lines": [
                    {
                        "description": line.description or (line.product.name if line.product else ""),
                        "qty": line.quantity,
                        "unit_price": line.unit_price,
                        "total": line.line_total,
                    }
                    for line in instance.lines.all()
                ],
                "notes": instance.description or "",
            },
            document_type="quotation",
        )

    if document_type == "proforma":
        customer = instance.customer
        return build_standard_sales_document_data(
            {
                "document": {
                    "number": instance.proforma_number,
                    "date": instance.created_at.date().isoformat() if instance.created_at else "",
                    "due_date": "",
                    "currency": currency,
                    "currency_symbol": currency_symbol,
                },
                "company": get_company_payload(company),
                "client": {
                    "name": customer.name if customer else "",
                    "details": (customer.address or customer.email or "") if customer else "",
                },
                "lines": [
                    {
                        "description": line.description or (line.product.name if line.product else ""),
                        "qty": line.quantity,
                        "unit_price": line.unit_price,
                        "total": line.line_total,
                    }
                    for line in instance.lines.all()
                ],
            },
            document_type="proforma",
        )

    if document_type == "invoice":
        customer = (
            instance.customer
            or (instance.proforma.customer if instance.proforma and instance.proforma.customer else None)
            or (instance.quotation.customer if instance.quotation and instance.quotation.customer else None)
        )
        effective_company = company or (instance.proforma.company if instance.proforma else None) or (instance.quotation.company if instance.quotation else None)
        return build_standard_sales_document_data(
            {
                "document": {
                    "number": instance.invoice_number,
                    "date": instance.created_at.date().isoformat() if instance.created_at else "",
                    "due_date": "",
                    "currency": currency,
                    "currency_symbol": currency_symbol,
                },
                "company": get_company_payload(effective_company),
                "client": {
                    "name": customer.name if customer else "",
                    "details": (customer.address or customer.email or "") if customer else "",
                },
                "lines": [
                    {
                        "description": line.description or (line.product.name if line.product else ""),
                        "qty": line.quantity,
                        "unit_price": line.unit_price,
                        "total": line.line_total,
                    }
                    for line in instance.lines.all()
                ],
            },
            document_type="invoice",
        )

    if document_type == "delivery_note":
        customer = None
        if instance.customer:
            customer = instance.customer
        elif instance.invoice:
            customer = instance.invoice.customer or (
                instance.invoice.proforma.customer
                if instance.invoice.proforma and instance.invoice.proforma.customer
                else None
            )
        effective_company = company or (
            instance.invoice.company if instance.invoice else None
        ) or (
            instance.invoice.proforma.company if instance.invoice and instance.invoice.proforma else None
        )
        return build_standard_sales_document_data(
            {
                "document": {
                    "number": instance.delivery_note_number,
                    "date": instance.created_at.date().isoformat() if instance.created_at else "",
                    "delivery_date": instance.delivery_date.isoformat() if instance.delivery_date else "",
                    "currency": currency,
                    "currency_symbol": currency_symbol,
                },
                "company": get_company_payload(effective_company),
                "client": {
                    "name": customer.name if customer else "",
                    "details": (customer.address or customer.email or "") if customer else "",
                },
                "lines": [
                    {
                        "description": line.description or (line.product.name if line.product else ""),
                        "qty": line.quantity,
                    }
                    for line in instance.lines.all()
                ],
            },
            document_type="delivery_note",
        )

    if document_type == "receipt":
        customer = None
        if instance.customer:
            customer = instance.customer
        elif instance.invoice:
            customer = instance.invoice.customer or (
                instance.invoice.proforma.customer
                if instance.invoice.proforma and instance.invoice.proforma.customer
                else None
            )
        effective_company = company or (
            instance.invoice.company if instance.invoice else None
        ) or (
            instance.invoice.proforma.company if instance.invoice and instance.invoice.proforma else None
        )
        amount_paid = instance.amount_paid or 0
        total_str = f"{currency_symbol}{amount_paid:,.2f}"

        return {
            "document": {
                "number": instance.receipt_number,
                "date": instance.created_at.date().isoformat() if instance.created_at else "",
                "currency": currency,
                "currency_symbol": currency_symbol,
            },
            "company": get_company_payload(effective_company),
            "client": {
                "name": customer.name if customer else "",
                "details": (customer.address or customer.email or "") if customer else "",
            },
            "totals": {
                "subtotal": total_str,
                "discount": f"{currency_symbol}0.00",
                "tax": f"{currency_symbol}0.00",
                "total": total_str,
                "tax_rate_percent": "0.00%",
            },
            "lines": [],
            "notes": "",
            "document_type": "receipt",
        }

    raise ValidationError(f"Unsupported document type: {document_type}")


def create_or_replace_document(instance, template, pdf_path, user=None, force=False):
    if force and instance.document:
        instance.document.is_current = False
        instance.document.save(update_fields=["is_current", "updated_at"])

    if instance.document and not force:
        document = instance.document
        document.name = str(instance)
        document.description = f"Generated PDF for {instance}"
        document.template = template
        document.is_current = True
        if user and user.is_authenticated:
            document.updated_by = user
    else:
        document = Document(
            name=str(instance),
            description=f"Generated PDF for {instance}",
            template=template,
            is_current=True,
            created_by=user if user and user.is_authenticated else None,
            updated_by=user if user and user.is_authenticated else None,
        )

    with open(pdf_path, "rb") as pdf_file:
        filename = build_document_filename(instance)
        document.file.save(filename, File(pdf_file), save=True)

    instance.document = document
    instance.pdf_generated_at = timezone.now()
    instance.pdf_needs_regeneration = False
    if user and user.is_authenticated:
        instance.updated_by = user
    instance.save(update_fields=["document", "pdf_generated_at", "pdf_needs_regeneration", "updated_by", "updated_at"])
    return document


def generate_document_for_instance(instance, document_type, user=None, force=False):
    if instance.document and file_exists(instance.document.file) and not force:
        return instance.document, False

    company = getattr(instance, "company", None)
    if company:
        allowed, message = can_generate_pdf(company)
        if not allowed:
            raise ValidationError(message)

    template = get_template_for_instance(instance, document_type)
    if not template or not template.file:
        raise ValidationError(f"No active template found for document_type='{document_type}'.")

    standard_data = build_standard_data_from_instance(instance, document_type)
    mapping = template.mapping or {}

    with tempfile.TemporaryDirectory() as tmpdir:
        output_pdf_path = Path(tmpdir) / f"{document_type}_{instance.pk}.pdf"

        render_mapped_template_to_pdf(
            template_path=template.file.path,
            output_pdf_path=output_pdf_path,
            standard_data=standard_data,
            mapping=mapping,
            document_type=document_type,
        )

        previous_size = 0
        if instance.document and file_exists(instance.document.file):
            previous_size = instance.document.file.size or 0

        new_size = output_pdf_path.stat().st_size
        if company:
            allowed, message = can_store_additional_bytes(company, max(new_size - previous_size, 0))
            if not allowed:
                raise ValidationError(message)

        document = create_or_replace_document(
            instance=instance,
            template=template,
            pdf_path=output_pdf_path,
            user=user,
            force=force,
        )

        if company:
            adjust_storage_usage(company, new_size - previous_size)

    return document, True


def get_existing_document_or_raise(instance):
    if instance.document and file_exists(instance.document.file):
        return instance.document
    raise ValidationError("No PDF has been generated for this record yet.")


def inspect_template_file(template):
    if not template.file:
        raise ValidationError("Template file is missing.")
    return inspect_template(
        template_path=template.file.path,
        document_type=template.document_type,
    )
