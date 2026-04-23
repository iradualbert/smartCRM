from decimal import Decimal
from django.db import transaction
from django.db.models import Count, Sum, Q
from django.utils import timezone

from  billing.models import BillingUsage, Plan, Subscription, SubscriptionEvent
from ..models import Company, DeliveryNote, DocumentEvent, Invoice, Proforma, Quotation, Receipt
from ..models_email import EmailSendingConfig


def _build_company_dashboard_context(company):
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    quotations = company.quotations.all()
    proformas = company.proformas.all()
    invoices = company.invoices.all()
    receipts = company.receipts.all()
    delivery_notes = company.deliverynotes.all()
    customers = company.customers.all()
    products = company.products.all()
    templates = company.templates.filter(is_active=True)
    sending_configs = EmailSendingConfig.objects.filter(company=company, is_active=True)

    usage = BillingUsage.objects.filter(
        company=company,
        year=now.year,
        month=now.month,
    ).first()

    subscription = company.subscriptions.order_by("-created_at").first()

    quote_pipeline_total = quotations.filter(
        status__in=["sent", "accepted"]
    ).aggregate(total=Sum("total"))["total"] or Decimal("0.00")

    outstanding_invoice_total = invoices.filter(
        status__in=["sent", "overdue"]
    ).aggregate(total=Sum("total"))["total"] or Decimal("0.00")

    receipts_this_month_total = receipts.filter(
        created_at__gte=month_start
    ).aggregate(total=Sum("amount_paid"))["total"] or Decimal("0.00")

    recent_document_events = DocumentEvent.objects.filter(
        created_at__gte=month_start,
    ).filter(
        Q(company=company) | Q(created_by__company_memberships__company=company)
    ).select_related("document").distinct().order_by("-created_at")[:8]

    recent_subscription_events = SubscriptionEvent.objects.filter(
        company=company
    ).order_by("-created_at")[:5]

    activity = [
        {
            "type": item.event_type,
            "label": item.message or item.event_type.replace("_", " ").title(),
            "created_at": item.created_at,
        }
        for item in recent_document_events
    ] + [
        {
            "type": item.event_type,
            "label": item.note or item.event_type.replace("_", " ").title(),
            "created_at": item.created_at,
        }
        for item in recent_subscription_events
    ]

    activity = sorted(activity, key=lambda x: x["created_at"], reverse=True)[:10]

    overdue_invoices_count = invoices.filter(status="overdue").count()
    draft_quotations_count = quotations.filter(status="draft").count()
    sent_quotations_count = quotations.filter(status="sent").count()

    attention = []
    if overdue_invoices_count:
        attention.append(
            {
                "type": "overdue_invoice",
                "label": f"{overdue_invoices_count} overdue invoice{'s' if overdue_invoices_count != 1 else ''} need attention.",
            }
        )

    if draft_quotations_count:
        attention.append(
            {
                "type": "draft_quotation",
                "label": f"{draft_quotations_count} quotation draft{'s are' if draft_quotations_count != 1 else ' is'} still open.",
            }
        )

    if subscription and subscription.status in ["past_due", "cancelled", "expired"]:
        attention.append(
            {
                "type": "subscription",
                "label": f"Subscription status is {subscription.status.replace('_', ' ')}.",
            }
        )

    recent_quotations = [
        {
            "id": item.id,
            "quote_number": item.quote_number,
            "name": item.name,
            "status": item.status,
            "total": item.total,
            "created_at": item.created_at,
        }
        for item in quotations.order_by("-created_at")[:6]
    ]

    workspace_metrics = [
        {
            "label": "Customers",
            "value": str(customers.count()),
            "hint": "Customer records available to the team",
        },
        {
            "label": "Products",
            "value": str(products.count()),
            "hint": "Catalog items ready for line items",
        },
        {
            "label": "Templates ready",
            "value": str(templates.count()),
            "hint": "Active document templates in this workspace",
        },
        {
            "label": "Open issues",
            "value": "0",
            "hint": "Items that need attention before the workflow is fully clear",
        },
    ]

    sales_metrics = [
        {
            "label": "Draft quotations",
            "value": str(draft_quotations_count),
            "hint": "Quotations still being prepared",
        },
        {
            "label": "Sent quotations",
            "value": str(sent_quotations_count),
            "hint": "Waiting for a customer decision",
        },
        {
            "label": "Outstanding invoices",
            "value": str(invoices.filter(status__in=["sent", "overdue"]).count()),
            "hint": "Invoices still awaiting payment",
        },
        {
            "label": "Overdue invoices",
            "value": str(overdue_invoices_count),
            "hint": "Collections that need follow-up now",
        },
    ]

    setup_items = [
        {
            "key": "customers",
            "label": "Customer records",
            "value": str(customers.count()),
            "ready": customers.exists(),
            "detail": "Add at least one customer so the team can create quotations quickly.",
            "action_label": "Manage customers",
            "action_href": "/customers",
        },
        {
            "key": "products",
            "label": "Product catalog",
            "value": str(products.count()),
            "ready": products.exists(),
            "detail": "Keep your catalog ready so line items can be reused across documents.",
            "action_label": "Manage products",
            "action_href": "/products",
        },
        {
            "key": "templates",
            "label": "Custom templates",
            "value": str(templates.count()),
            "ready": templates.exists(),
            "detail": "Built-in templates already work. Add branded templates when you are ready.",
            "action_label": "Open templates",
            "action_href": "/templates",
        },
        {
            "key": "sending_configs",
            "label": "Sending accounts",
            "value": str(sending_configs.count()),
            "ready": sending_configs.exists(),
            "detail": "The default sender works for testing. Add a mailbox before going live.",
            "action_label": "Configure email",
            "action_href": "/settings/email",
        },
    ]

    workspace_metrics[-1]["value"] = str(len(attention))

    is_new_workspace = (
        not quotations.exists()
        and not invoices.exists()
        and not proformas.exists()
    )

    # Resolve effective plan for limits (fall back to free plan when no active subscription)
    active_sub = company.subscriptions.filter(status="active").select_related("plan").order_by("-created_at").first()
    if active_sub:
        effective_plan = active_sub.plan
    else:
        effective_plan = Plan.objects.filter(code="free").first()

    plan_limits = {
        "max_documents_per_month": effective_plan.max_documents_per_month if effective_plan else None,
        "max_emails_per_month": effective_plan.max_emails_per_month if effective_plan else None,
        "max_storage_mb": effective_plan.max_storage_mb if effective_plan else None,
        "allow_pdf_generation": effective_plan.allow_pdf_generation if effective_plan else True,
        "allow_email_sending": effective_plan.allow_email_sending if effective_plan else True,
    }

    return {
        "company": {
            "id": company.id,
            "name": company.name,
            "currency": company.default_currency,
            "currency_symbol": company.currency_symbol,
        },
        "is_new_workspace": is_new_workspace,
        "workspace_metrics": workspace_metrics,
        "sales_metrics": sales_metrics,
        "setup": setup_items,
        "usage": {
            "documents_created": usage.documents_created if usage else 0,
            "emails_sent": usage.emails_sent if usage else 0,
            "storage_bytes": usage.storage_bytes if usage else 0,
            "storage_mb": round((usage.storage_bytes / (1024 * 1024)), 2) if usage else 0,
        },
        "plan_limits": plan_limits,
        "subscription": {
            "plan": subscription.plan if subscription else "",
            "status": subscription.status if subscription else "",
            "current_period_end": subscription.current_period_end if subscription else None,
            "auto_renew": subscription.auto_renew if subscription else False,
        },
        "attention": attention,
        "activity": activity,
        "recent_quotations": recent_quotations,
        "status_breakdown": {
            "quotations": {
                "draft": quotations.filter(status="draft").count(),
                "sent": quotations.filter(status="sent").count(),
                "accepted": quotations.filter(status="accepted").count(),
                "rejected": quotations.filter(status="rejected").count(),
            },
            "invoices": {
                "draft": invoices.filter(status="draft").count(),
                "sent": invoices.filter(status="sent").count(),
                "paid": invoices.filter(status="paid").count(),
                "overdue": invoices.filter(status="overdue").count(),
            },
            "proformas": {
                "draft": proformas.filter(status="draft").count(),
                "sent": proformas.filter(status="sent").count(),
                "paid": proformas.filter(status="paid").count(),
                "cancelled": proformas.filter(status="cancelled").count(),
            },
            "delivery_notes": {
                "draft": delivery_notes.filter(status="draft").count(),
                "dispatched": delivery_notes.filter(status="dispatched").count(),
                "delivered": delivery_notes.filter(status="delivered").count(),
                "cancelled": delivery_notes.filter(status="cancelled").count(),
            },
        },
        "money": {
            "quotation_pipeline_total": quote_pipeline_total,
            "invoice_outstanding_total": outstanding_invoice_total,
            "receipts_collected_this_month": receipts_this_month_total,
        },
    }

DOCUMENT_NUMBER_CONFIG = {
    "quote_number": ("quotation_prefix", "next_quotation_number", "QUO"),
    "proforma_number": ("proforma_prefix", "next_proforma_number", "PRO"),
    "invoice_number": ("invoice_prefix", "next_invoice_number", "INV"),
    "receipt_number": ("receipt_prefix", "next_receipt_number", "REC"),
    "delivery_note_number": ("delivery_note_prefix", "next_delivery_note_number", "DN"),
}


def _format_document_number(prefix: str, number: int) -> str:
    return f"{prefix}-{number:04d}"


def _parse_document_number(value: str, prefix: str) -> int | None:
    if not value:
        return None
    normalized = value.strip()
    expected_prefix = f"{prefix}-"
    if not normalized.startswith(expected_prefix):
        return None
    suffix = normalized[len(expected_prefix):]
    if not suffix.isdigit():
        return None
    return int(suffix)


@transaction.atomic
def _next_document_number(company, field_name: str, prefix: str, provided_value: str | None = None):
    prefix_field, counter_field, default_prefix = DOCUMENT_NUMBER_CONFIG[field_name]
    locked_company = Company.objects.select_for_update().get(pk=company.pk)
    resolved_prefix = prefix or getattr(locked_company, prefix_field) or default_prefix
    next_number = max(getattr(locked_company, counter_field) or 1, 1)

    if provided_value and provided_value.strip():
        parsed_value = _parse_document_number(provided_value, resolved_prefix)
        if parsed_value is not None and parsed_value >= next_number:
            setattr(locked_company, counter_field, parsed_value + 1)
            locked_company.save(update_fields=[counter_field, "updated_at"])
        return provided_value.strip()

    generated_number = _format_document_number(resolved_prefix, next_number)
    setattr(locked_company, counter_field, next_number + 1)
    locked_company.save(update_fields=[counter_field, "updated_at"])
    return generated_number
