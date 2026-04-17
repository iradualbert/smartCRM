from decimal import Decimal
from django.db.models import Count, Sum, Q
from django.utils import timezone

from  billing.models import BillingUsage, Subscription, SubscriptionEvent
from ..models import DeliveryNote, DocumentEvent, Invoice, Proforma, Quotation, Receipt
import re


def _build_company_dashboard_context(company):
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    quotations = company.quotations.all()
    proformas = company.proformas.all()
    invoices = company.invoices.all()
    receipts = company.receipts.all()
    delivery_notes = company.deliverynotes.all()

    usage = BillingUsage.objects.filter(
        company=company,
        year=now.year,
        month=now.month,
    ).first()

    subscription = company.subscriptions.order_by("-created_at").first()

    quote_pipeline_total = quotations.filter(
        status__in=["sent", "approved"]
    ).aggregate(total=Sum("total"))["total"] or Decimal("0.00")

    outstanding_invoice_total = invoices.filter(
        status__in=["sent", "partially_paid", "overdue"]
    ).aggregate(total=Sum("total"))["total"] or Decimal("0.00")

    receipts_this_month_total = receipts.filter(
        created_at__gte=month_start
    ).aggregate(total=Sum("amount_paid"))["total"] or Decimal("0.00")

    recent_document_events = DocumentEvent.objects.filter(
        created_at__gte=month_start,
        created_by__company_memberships__company=company,
    ).select_related("document").order_by("-created_at")[:8]

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
            "label": "Open quotations",
            "value": str(draft_quotations_count + sent_quotations_count),
            "hint": "Draft and sent quotations in motion",
        },
        {
            "label": "Outstanding invoices",
            "value": str(
                invoices.filter(status__in=["sent", "partially_paid", "overdue"]).count()
            ),
            "hint": "Invoices still waiting for payment",
        },
        {
            "label": "Documents this month",
            "value": str(usage.documents_created if usage else 0),
            "hint": "Monthly document activity",
        },
        {
            "label": "Emails sent",
            "value": str(usage.emails_sent if usage else 0),
            "hint": "Monthly communication volume",
        },
    ]

    sales_metrics = [
        {
            "label": "Draft quotations",
            "value": str(draft_quotations_count),
            "hint": "Need review or sending",
        },
        {
            "label": "Sent quotations",
            "value": str(sent_quotations_count),
            "hint": "Currently in client hands",
        },
        {
            "label": "Overdue invoices",
            "value": str(overdue_invoices_count),
            "hint": "Require follow-up",
        },
        {
            "label": "Receipts this month",
            "value": str(receipts.filter(created_at__gte=month_start).count()),
            "hint": "Issued this billing period",
        },
    ]

    return {
        "company": {
            "id": company.id,
            "name": company.name,
            "currency": company.default_currency,
            "currency_symbol": company.currency_symbol,
        },
        "workspace_metrics": workspace_metrics,
        "sales_metrics": sales_metrics,
        "usage": {
            "documents_created": usage.documents_created if usage else 0,
            "emails_sent": usage.emails_sent if usage else 0,
            "storage_bytes": usage.storage_bytes if usage else 0,
            "storage_mb": round((usage.storage_bytes / (1024 * 1024)), 2) if usage else 0,
        },
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
                "approved": quotations.filter(status="approved").count(),
                "rejected": quotations.filter(status="rejected").count(),
                "expired": quotations.filter(status="expired").count(),
            },
            "invoices": {
                "draft": invoices.filter(status="draft").count(),
                "sent": invoices.filter(status="sent").count(),
                "partially_paid": invoices.filter(status="partially_paid").count(),
                "paid": invoices.filter(status="paid").count(),
                "overdue": invoices.filter(status="overdue").count(),
                "cancelled": invoices.filter(status="cancelled").count(),
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






def _next_document_number(company, field_name: str, prefix: str):
    model_map = {
        "quote_number": Quotation,
        "proforma_number": Proforma,
        "invoice_number": Invoice,
        "receipt_number": Receipt,
        "delivery_note_number": DeliveryNote,
    }
    model_cls = model_map[field_name]

    values = model_cls.objects.filter(
        company=company,
        **{f"{field_name}__startswith": f"{prefix}-"}
    ).values_list(field_name, flat=True)

    max_number = 0
    for value in values:
        match = re.search(rf"^{re.escape(prefix)}-(\d+)$", value or "")
        if match:
            max_number = max(max_number, int(match.group(1)))

    return f"{prefix}-{str(max_number + 1).zfill(5)}"
