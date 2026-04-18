from django.db import models
from django.utils import timezone


class Plan(models.Model):
    BILLING_INTERVAL_CHOICES = [
        ("monthly", "Monthly"),
    ]

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)

    price_try = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    billing_interval = models.CharField(
        max_length=20,
        choices=BILLING_INTERVAL_CHOICES,
        default="monthly",
    )

    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)

    max_organizations = models.PositiveIntegerField(default=1)
    max_users = models.PositiveIntegerField(default=1)
    max_documents_per_month = models.PositiveIntegerField(null=True, blank=True)
    max_emails_per_month = models.PositiveIntegerField(null=True, blank=True)
    max_storage_mb = models.PositiveIntegerField(null=True, blank=True)

    allow_custom_templates = models.BooleanField(default=False)
    allow_pdf_generation = models.BooleanField(default=True)
    allow_email_sending = models.BooleanField(default=False)
    allow_ai_quote_extraction = models.BooleanField(default=False)
    allow_catalog_management = models.BooleanField(default=False)
    allow_branding_removal = models.BooleanField(default=False)

    display_order = models.PositiveIntegerField(default=0)
    is_contact_only = models.BooleanField(default=False)

    class Meta:
        ordering = ["display_order", "price_try", "id"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class Subscription(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        CANCELLED = "cancelled", "Cancelled"
        EXPIRED = "expired", "Expired"
        PAST_DUE = "past_due", "Past Due"

    company = models.ForeignKey(
        "sales.Company",
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    plan = models.ForeignKey(
        Plan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    billing_currency = models.CharField(max_length=10, default="TRY")
    billing_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    started_at = models.DateTimeField()
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()

    cancelled_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    auto_renew = models.BooleanField(default=True)

    external_provider = models.CharField(max_length=50, blank=True, default="iyzico")
    external_subscription_id = models.CharField(max_length=255, blank=True, default="")
    external_customer_id = models.CharField(max_length=255, blank=True, default="")
    external_checkout_token = models.CharField(max_length=255, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def is_active_now(self):
        now = timezone.now()
        return self.status == self.Status.ACTIVE and self.current_period_end >= now


class SubscriptionEvent(models.Model):
    EVENT_TYPES = [
        ("created", "Created"),
        ("renewed", "Renewed"),
        ("upgraded", "Upgraded"),
        ("downgraded", "Downgraded"),
        ("cancelled", "Cancelled"),
        ("expired", "Expired"),
        ("payment_succeeded", "Payment Succeeded"),
        ("payment_failed", "Payment Failed"),
        ("checkout_created", "Checkout Created"),
    ]

    company = models.ForeignKey(
        "sales.Company",
        on_delete=models.CASCADE,
        related_name="subscription_events",
    )
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name="events",
        null=True,
        blank=True,
    )

    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    plan_code = models.CharField(max_length=50, blank=True, default="")
    note = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)


class BillingUsage(models.Model):
    company = models.ForeignKey(
        "sales.Company",
        on_delete=models.CASCADE,
        related_name="billing_usages",
    )

    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()

    emails_sent = models.PositiveIntegerField(default=0)
    documents_created = models.PositiveIntegerField(default=0)
    storage_bytes = models.BigIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("company", "year", "month")