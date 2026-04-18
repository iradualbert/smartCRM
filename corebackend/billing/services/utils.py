from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from sales.models import Company, CompanyMembership

from ..models import BillingUsage, Plan, Subscription, SubscriptionEvent


def user_can_manage_billing(user, company: Company) -> bool:
    if not user or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    return CompanyMembership.objects.filter(
        company=company,
        user=user,
        is_active=True,
        role__in=[CompanyMembership.Role.OWNER, CompanyMembership.Role.ADMIN],
    ).exists()


def get_current_usage(company: Company) -> BillingUsage:
    now = timezone.now()
    usage, _ = BillingUsage.objects.get_or_create(
        company=company,
        year=now.year,
        month=now.month,
        defaults={
            "emails_sent": 0,
            "documents_created": 0,
            "storage_bytes": 0,
        },
    )
    return usage


def get_active_subscription(company: Company) -> Subscription | None:
    now = timezone.now()
    return (
        Subscription.objects.filter(
            company=company,
            status=Subscription.Status.ACTIVE,
            current_period_end__gte=now,
        )
        .select_related("plan")
        .order_by("-created_at")
        .first()
    )


def get_effective_subscription(company: Company) -> Subscription:
    active = get_active_subscription(company)
    if active:
        return active

    free_plan = Plan.objects.get(code="free")
    now = timezone.now()
    return Subscription(
        company=company,
        plan=free_plan,
        status=Subscription.Status.ACTIVE,
        billing_currency="TRY",
        billing_amount=free_plan.price_try,
        started_at=now,
        current_period_start=now,
        current_period_end=now + timedelta(days=30),
        auto_renew=False,
    )


def can_create_document(company: Company) -> tuple[bool, str | None]:
    subscription = get_effective_subscription(company)
    usage = get_current_usage(company)

    if (
        subscription.plan.max_documents_per_month is not None
        and usage.documents_created >= subscription.plan.max_documents_per_month
    ):
        return False, "Monthly document limit reached for your plan."

    return True, None


def can_send_email(company: Company) -> tuple[bool, str | None]:
    subscription = get_effective_subscription(company)
    usage = get_current_usage(company)

    if not subscription.plan.allow_email_sending:
        return False, "Email sending is not available on your current plan."

    if (
        subscription.plan.max_emails_per_month is not None
        and usage.emails_sent >= subscription.plan.max_emails_per_month
    ):
        return False, "Monthly email limit reached for your plan."

    return True, None


def increment_documents_created(company: Company, amount: int = 1) -> None:
    usage = get_current_usage(company)
    usage.documents_created += amount
    usage.save(update_fields=["documents_created", "updated_at"])


def increment_emails_sent(company: Company, amount: int = 1) -> None:
    usage = get_current_usage(company)
    usage.emails_sent += amount
    usage.save(update_fields=["emails_sent", "updated_at"])


@transaction.atomic
def create_pending_subscription(*, company: Company, plan: Plan, currency: str) -> Subscription:
    amount = plan.price_try if currency == "TRY" else plan.price_usd
    now = timezone.now()

    subscription = Subscription.objects.create(
        company=company,
        plan=plan,
        status=Subscription.Status.PENDING,
        billing_currency=currency,
        billing_amount=amount,
        started_at=now,
        current_period_start=now,
        current_period_end=now + timedelta(days=30),
        auto_renew=True,
        external_provider="iyzico",
    )

    SubscriptionEvent.objects.create(
        company=company,
        subscription=subscription,
        event_type="checkout_created",
        plan_code=plan.code,
        metadata={"currency": currency},
    )

    return subscription


@transaction.atomic
def finalize_successful_payment(*, subscription: Subscription, external_token: str = "") -> Subscription:
    now = timezone.now()

    Subscription.objects.filter(
        company=subscription.company,
        status=Subscription.Status.ACTIVE,
    ).exclude(pk=subscription.pk).update(
        status=Subscription.Status.CANCELLED,
        cancelled_at=now,
        ended_at=now,
        updated_at=now,
    )

    subscription.status = Subscription.Status.ACTIVE
    subscription.started_at = now
    subscription.current_period_start = now
    subscription.current_period_end = now + timedelta(days=30)
    if external_token:
        subscription.external_checkout_token = external_token
    subscription.save()

    SubscriptionEvent.objects.create(
        company=subscription.company,
        subscription=subscription,
        event_type="payment_succeeded",
        plan_code=subscription.plan.code,
        metadata={"currency": subscription.billing_currency},
    )

    return subscription


@transaction.atomic
def mark_payment_failed(*, subscription: Subscription, reason: str = "") -> Subscription:
    subscription.status = Subscription.Status.PAST_DUE
    subscription.save(update_fields=["status", "updated_at"])

    SubscriptionEvent.objects.create(
        company=subscription.company,
        subscription=subscription,
        event_type="payment_failed",
        plan_code=subscription.plan.code,
        note=reason,
    )

    return subscription