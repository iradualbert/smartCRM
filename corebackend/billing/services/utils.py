from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from sales.models import Company, CompanyMembership

from ..models import BillingUsage, Plan, Subscription, SubscriptionEvent

TRIAL_DURATION_DAYS = 30
FREE_PLAN_CODE = "free"
BUSINESS_PLAN_CODE = "starter"


def _free_plan() -> Plan:
    return Plan.objects.get(code=FREE_PLAN_CODE)


def _business_plan() -> Plan:
    return Plan.objects.get(code=BUSINESS_PLAN_CODE)


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
    subscription = (
        Subscription.objects.filter(
            company=company,
            status=Subscription.Status.ACTIVE,
            current_period_end__gte=now,
        )
        .select_related("plan")
        .order_by("-created_at")
        .first()
    )
    if subscription and subscription.is_trial and subscription.trial_ends_at and subscription.trial_ends_at < now:
        return downgrade_trial_to_free(company)
    return subscription


def get_effective_subscription(company: Company) -> Subscription:
    active = get_active_subscription(company)
    if active:
        return active

    return ensure_free_subscription(company)


@transaction.atomic
def ensure_free_subscription(company: Company) -> Subscription:
    active = get_active_subscription(company)
    if active:
        return active

    free_plan = _free_plan()
    now = timezone.now()
    subscription = Subscription.objects.create(
        company=company,
        plan=free_plan,
        status=Subscription.Status.ACTIVE,
        billing_currency="TRY",
        billing_amount=free_plan.price_try,
        started_at=now,
        current_period_start=now,
        current_period_end=now + timedelta(days=3650),
        auto_renew=False,
        external_provider="internal",
        is_trial=False,
    )
    SubscriptionEvent.objects.create(
        company=company,
        subscription=subscription,
        event_type="created",
        plan_code=free_plan.code,
        note="Free plan is active.",
        metadata={"source": "system"},
    )
    return subscription


@transaction.atomic
def ensure_business_trial_subscription(company: Company) -> Subscription:
    active = get_active_subscription(company)
    if active:
        return active

    business_plan = _business_plan()
    now = timezone.now()
    trial_end = now + timedelta(days=TRIAL_DURATION_DAYS)
    subscription = Subscription.objects.create(
        company=company,
        plan=business_plan,
        status=Subscription.Status.ACTIVE,
        billing_currency="TRY",
        billing_amount=0,
        started_at=now,
        current_period_start=now,
        current_period_end=trial_end,
        auto_renew=False,
        external_provider="internal",
        is_trial=True,
        trial_started_at=now,
        trial_ends_at=trial_end,
    )
    SubscriptionEvent.objects.create(
        company=company,
        subscription=subscription,
        event_type="created",
        plan_code=business_plan.code,
        note="Business plan trial started.",
        metadata={"source": "signup_onboarding", "trial_days": TRIAL_DURATION_DAYS},
    )
    return subscription


@transaction.atomic
def downgrade_trial_to_free(company: Company) -> Subscription:
    now = timezone.now()
    active_trial = (
        Subscription.objects.select_for_update()
        .filter(company=company, status=Subscription.Status.ACTIVE, is_trial=True)
        .order_by("-created_at")
        .first()
    )

    if not active_trial:
        return ensure_free_subscription(company)

    if active_trial.trial_ends_at and active_trial.trial_ends_at > now:
        return active_trial

    active_trial.status = Subscription.Status.EXPIRED
    active_trial.ended_at = now
    active_trial.auto_renew = False
    active_trial.save(update_fields=["status", "ended_at", "auto_renew", "updated_at"])

    SubscriptionEvent.objects.create(
        company=company,
        subscription=active_trial,
        event_type="expired",
        plan_code=active_trial.plan.code,
        note="Business trial expired.",
        metadata={"source": "trial_expiration"},
    )

    free_subscription = ensure_free_subscription(company)
    SubscriptionEvent.objects.create(
        company=company,
        subscription=free_subscription,
        event_type="downgraded",
        plan_code=free_subscription.plan.code,
        note="Trial ended. Workspace downgraded to the Free plan.",
        metadata={"source": "trial_expiration"},
    )
    return free_subscription


def can_create_document(company: Company) -> tuple[bool, str | None]:
    subscription = get_effective_subscription(company)
    usage = get_current_usage(company)

    if (
        subscription.plan.max_documents_per_month is not None
        and usage.documents_created >= subscription.plan.max_documents_per_month
    ):
        return False, "Monthly document limit reached for your plan."

    return True, None


def can_generate_pdf(company: Company) -> tuple[bool, str | None]:
    subscription = get_effective_subscription(company)
    if not subscription.plan.allow_pdf_generation:
        return False, "PDF generation is not available on your current plan."
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


def can_store_additional_bytes(company: Company, additional_bytes: int) -> tuple[bool, str | None]:
    if additional_bytes <= 0:
        return True, None

    subscription = get_effective_subscription(company)
    storage_limit_mb = subscription.plan.max_storage_mb
    if storage_limit_mb is None:
        return True, None

    usage = get_current_usage(company)
    storage_limit_bytes = storage_limit_mb * 1024 * 1024
    if usage.storage_bytes + additional_bytes > storage_limit_bytes:
        return False, "Storage limit reached for your plan."

    return True, None


def increment_documents_created(company: Company, amount: int = 1) -> None:
    usage = get_current_usage(company)
    usage.documents_created += amount
    usage.save(update_fields=["documents_created", "updated_at"])


def increment_emails_sent(company: Company, amount: int = 1) -> None:
    usage = get_current_usage(company)
    usage.emails_sent += amount
    usage.save(update_fields=["emails_sent", "updated_at"])


def adjust_storage_usage(company: Company, delta_bytes: int) -> None:
    if delta_bytes == 0:
        return

    usage = get_current_usage(company)
    usage.storage_bytes = max((usage.storage_bytes or 0) + delta_bytes, 0)
    usage.save(update_fields=["storage_bytes", "updated_at"])

    company.storage_used_bytes = max((company.storage_used_bytes or 0) + delta_bytes, 0)
    company.save(update_fields=["storage_used_bytes"])


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
