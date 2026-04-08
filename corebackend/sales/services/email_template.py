from __future__ import annotations

from html import escape
from pathlib import Path
import re
from typing import Any, Dict

from django.conf import settings


PLACEHOLDER_PATTERN = re.compile(r"\[\[([A-Za-z0-9_]+)\]\]")


def load_default_email_template(document_type: str) -> str:
    path = Path(settings.BASE_DIR) / "sales" / "default" / f"{document_type}_email_template.html"
    if not path.exists():
        raise FileNotFoundError(
            f"Default email template not found for document_type='{document_type}' at '{path}'."
        )
    return path.read_text(encoding="utf-8")


def parse_email_template(content: str) -> dict[str, str]:
    lines = content.splitlines()
    subject = ""
    body_lines = lines

    if lines and lines[0].startswith("Subject:"):
        subject = lines[0].replace("Subject:", "", 1).strip()
        body_lines = lines[1:]
        if body_lines and not body_lines[0].strip():
            body_lines = body_lines[1:]

    return {
        "subject": subject,
        "body_html": "\n".join(body_lines).strip(),
    }


def render_subject_template(text: str, values: Dict[str, Any]) -> str:
    def replacer(match: re.Match[str]) -> str:
        key = match.group(1)
        value = values.get(key, "")
        return escape("" if value is None else str(value))

    return PLACEHOLDER_PATTERN.sub(replacer, text)


def render_html_template(text: str, values: Dict[str, Any]) -> str:
    def replacer(match: re.Match[str]) -> str:
        key = match.group(1)
        value = values.get(key, "")
        return escape("" if value is None else str(value))

    return PLACEHOLDER_PATTERN.sub(replacer, text)


def _get_company_and_customer(instance, document_type: str):
    company = getattr(instance, "company", None)
    customer = getattr(instance, "customer", None)

    if document_type == "quotation":
        customer = getattr(instance, "customer", None)
        company = getattr(instance, "company", None)

    elif document_type == "proforma":
        customer = getattr(instance, "customer", None)
        company = getattr(instance, "company", None)

    elif document_type == "invoice":
        proforma = getattr(instance, "proforma", None)
        customer = getattr(proforma, "customer", None) if proforma else None
        company = getattr(instance, "company", None) or getattr(proforma, "company", None)

    elif document_type == "receipt":
        invoice = getattr(instance, "invoice", None)
        proforma = getattr(invoice, "proforma", None) if invoice else None
        customer = getattr(proforma, "customer", None) if proforma else None
        company = (
            getattr(instance, "company", None)
            or getattr(invoice, "company", None)
            or getattr(proforma, "company", None)
        )

    elif document_type == "delivery_note":
        invoice = getattr(instance, "invoice", None)
        proforma = getattr(invoice, "proforma", None) if invoice else None
        customer = getattr(proforma, "customer", None) if proforma else None
        company = (
            getattr(instance, "company", None)
            or getattr(invoice, "company", None)
            or getattr(proforma, "company", None)
        )

    return company, customer


def build_email_context(instance, document_type: str, user=None) -> dict[str, Any]:
    company, customer = _get_company_and_customer(instance, document_type)

    sender_name = ""
    if user and getattr(user, "is_authenticated", False):
        sender_name = user.get_full_name() or getattr(user, "username", "") or ""

    base_context: dict[str, Any] = {
        "RecipientName": customer.name if customer else "",
        "ClientName": customer.name if customer else "",
        "ClientEmail": customer.email if customer and getattr(customer, "email", None) else "",
        "ClientAddress": customer.address if customer and getattr(customer, "address", None) else "",
        "CompanyName": company.name if company else "",
        "YourCompanyName": company.name if company else "",
        "CompanyEmail": company.email if company else "",
        "CompanyPhone": company.phone if company else "",
        "CompanyAddress": company.address if company else "",
        "SenderName": sender_name,
        "UserName": sender_name,
        "SenderPosition": "",
        "UserPosition": "",
        "ContactInfo": company.phone if company else "",
        "Currency": getattr(instance, "currency", "") or (getattr(company, "default_currency", "") if company else ""),
        "Date": getattr(instance, "created_at", None).date().isoformat() if getattr(instance, "created_at", None) else "",
        "ValidUntil": "",
        "DeliveryTimeline": "",
        "PaymentTerms": "",
        "ShortScopeSummary": getattr(instance, "description", "") or getattr(instance, "name", "") or "",
        "ProjectDescription": getattr(instance, "description", "") or getattr(instance, "name", "") or "",
        "ProjectOrGoodsDescription": getattr(instance, "description", "") or getattr(instance, "name", "") or "",
    }

    if document_type == "quotation":
        base_context.update(
            {
                "DocumentNumber": instance.quote_number,
                "QuoteReferenceNumber": instance.quote_number,
                "QuotationNumber": instance.quote_number,
                "TotalPrice": instance.total,
                "Total": instance.total,
            }
        )
        return base_context

    if document_type == "proforma":
        base_context.update(
            {
                "DocumentNumber": instance.proforma_number,
                "ProformaNumber": instance.proforma_number,
                "TotalPrice": instance.total,
                "Total": instance.total,
            }
        )
        return base_context

    if document_type == "invoice":
        base_context.update(
            {
                "DocumentNumber": instance.invoice_number,
                "InvoiceNumber": instance.invoice_number,
                "TotalPrice": instance.total,
                "Total": instance.total,
                "DueDate": "",
            }
        )
        return base_context

    if document_type == "receipt":
        base_context.update(
            {
                "DocumentNumber": instance.receipt_number,
                "ReceiptNumber": instance.receipt_number,
                "TotalPrice": instance.amount_paid,
                "Total": instance.amount_paid,
                "PaymentMethod": "",
                "PaymentDate": getattr(instance, "created_at", None).date().isoformat() if getattr(instance, "created_at", None) else "",
            }
        )
        return base_context

    if document_type == "delivery_note":
        base_context.update(
            {
                "DocumentNumber": instance.delivery_note_number,
                "DeliveryNoteNumber": instance.delivery_note_number,
                "DeliveryDate": instance.delivery_date.isoformat() if getattr(instance, "delivery_date", None) else "",
                "ItemSummary": "",
                "DeliveryDescription": getattr(instance, "description", "") or "",
            }
        )
        return base_context

    raise ValueError(f"Unsupported document_type '{document_type}' for email drafts.")


def build_email_draft_for_instance(instance, document_type: str, user=None) -> dict[str, Any]:
    raw_template = load_default_email_template(document_type)
    parsed = parse_email_template(raw_template)
    context = build_email_context(instance, document_type=document_type, user=user)

    subject = render_subject_template(parsed["subject"], context)
    body_html = render_html_template(parsed["body_html"], context)

    company, customer = _get_company_and_customer(instance, document_type)
    recipient_email = customer.email if customer and getattr(customer, "email", None) else ""

    attachment_url = None
    attachment_name = None
    if getattr(instance, "document", None) and getattr(instance.document, "file", None):
        attachment_url = instance.document.file.url
        attachment_name = instance.document.file.name.split("/")[-1]

    return {
        "to": recipient_email,
        "cc": "",
        "subject": subject,
        "body_html": body_html,
        "attachment_name": attachment_name,
        "attachment_url": attachment_url,
        "document_type": document_type,
        "document_number": context.get("DocumentNumber", ""),
        "company_name": company.name if company else "",
    }