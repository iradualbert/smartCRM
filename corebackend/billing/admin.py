from datetime import timedelta

from django.contrib import admin, messages
from django.db import transaction
from django.utils import timezone
from django.utils.html import format_html

from .models import BillingUsage, Plan, Subscription, SubscriptionEvent

# admin.site.register(Plan)
# admin.site.register(Subscription)
# admin.site.register(BillingUsage)
# admin.site.register(SubscriptionEvent)



class SubscriptionEventInline(admin.TabularInline):
    model = SubscriptionEvent
    extra = 0
    can_delete = False
    fields = ("created_at", "event_type", "plan_code", "note")
    readonly_fields = ("created_at", "event_type", "plan_code", "note")
    ordering = ("-created_at",)
    show_change_link = True


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "billing_interval",
        "price_try",
        "price_usd",
        "is_active",
        "is_default",
        "is_public",
        "max_users",
        "max_documents_per_month",
        "max_emails_per_month",
        "display_order",
    )
    list_filter = (
        "is_active",
        "is_default",
        "is_public",
        "billing_interval",
        "allow_email_sending",
        "allow_custom_templates",
        "allow_ai_quote_extraction",
        "allow_catalog_management",
        "allow_branding_removal",
    )
    search_fields = ("name", "code")
    ordering = ("display_order", "price_try", "id")
    actions = (
        "mark_active",
        "mark_inactive",
        "mark_public",
        "mark_hidden",
        "make_default",
    )
    fieldsets = (
        (
            "Identity",
            {
                "fields": (
                    "name",
                    "code",
                    "billing_interval",
                    "display_order",
                )
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "price_try",
                    "price_usd",
                )
            },
        ),
        (
            "Visibility & state",
            {
                "fields": (
                    "is_active",
                    "is_default",
                    "is_public",
                )
            },
        ),
        (
            "Limits",
            {
                "fields": (
                    "max_organizations",
                    "max_users",
                    "max_documents_per_month",
                    "max_emails_per_month",
                    "max_storage_mb",
                )
            },
        ),
        (
            "Feature flags",
            {
                "fields": (
                    "allow_custom_templates",
                    "allow_pdf_generation",
                    "allow_email_sending",
                    "allow_ai_quote_extraction",
                    "allow_catalog_management",
                    "allow_branding_removal",
                )
            },
        ),
    )

    @admin.action(description="Mark selected plans as active")
    def mark_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} plan(s) marked active.", level=messages.SUCCESS)

    @admin.action(description="Mark selected plans as inactive")
    def mark_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} plan(s) marked inactive.", level=messages.SUCCESS)

    @admin.action(description="Mark selected plans as public")
    def mark_public(self, request, queryset):
        updated = queryset.update(is_public=True)
        self.message_user(request, f"{updated} plan(s) marked public.", level=messages.SUCCESS)

    @admin.action(description="Mark selected plans as hidden")
    def mark_hidden(self, request, queryset):
        updated = queryset.update(is_public=False)
        self.message_user(request, f"{updated} plan(s) marked hidden.", level=messages.SUCCESS)

    @admin.action(description="Make selected plan the default")
    def make_default(self, request, queryset):
        count = queryset.count()
        if count != 1:
            self.message_user(
                request,
                "Select exactly one plan to make default.",
                level=messages.ERROR,
            )
            return

        selected = queryset.first()
        with transaction.atomic():
            Plan.objects.exclude(pk=selected.pk).update(is_default=False)
            selected.is_default = True
            selected.save(update_fields=["is_default"])

        self.message_user(
            request,
            f'"{selected.name}" is now the default plan.',
            level=messages.SUCCESS,
        )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company",
        "plan",
        "status_badge",
        "billing_currency",
        "billing_amount",
        "auto_renew",
        "period_range",
        "external_provider",
        "created_at",
    )
    list_filter = (
        "status",
        "billing_currency",
        "auto_renew",
        "external_provider",
        "plan",
    )
    search_fields = (
        "id",
        "company__name",
        "plan__name",
        "plan__code",
        "external_subscription_id",
        "external_customer_id",
        "external_checkout_token",
    )
    ordering = ("-created_at",)
    readonly_fields = (
        "created_at",
        "updated_at",
        "started_at",
        "current_period_start",
        "current_period_end",
        "cancelled_at",
        "ended_at",
        "status_badge",
    )
    inlines = [SubscriptionEventInline]
    actions = (
        "mark_active",
        "mark_past_due",
        "mark_cancelled",
        "mark_expired",
        "extend_30_days",
        "disable_auto_renew",
        "enable_auto_renew",
    )
    fieldsets = (
        (
            "Ownership",
            {
                "fields": (
                    "company",
                    "plan",
                )
            },
        ),
        (
            "Billing state",
            {
                "fields": (
                    "status",
                    "status_badge",
                    "billing_currency",
                    "billing_amount",
                    "auto_renew",
                )
            },
        ),
        (
            "Period",
            {
                "fields": (
                    "started_at",
                    "current_period_start",
                    "current_period_end",
                    "cancelled_at",
                    "ended_at",
                )
            },
        ),
        (
            "Provider",
            {
                "fields": (
                    "external_provider",
                    "external_subscription_id",
                    "external_customer_id",
                    "external_checkout_token",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    @admin.display(description="Status")
    def status_badge(self, obj):
        color_map = {
            "pending": "#f59e0b",
            "active": "#16a34a",
            "cancelled": "#6b7280",
            "expired": "#dc2626",
            "past_due": "#ea580c",
        }
        color = color_map.get(obj.status, "#334155")
        return format_html(
            '<span style="display:inline-block;padding:2px 8px;border-radius:9999px;'
            'background:{}20;color:{};font-weight:600;text-transform:capitalize;">{}</span>',
            color,
            color,
            obj.status,
        )

    @admin.display(description="Billing period")
    def period_range(self, obj):
        start = obj.current_period_start.strftime("%Y-%m-%d") if obj.current_period_start else "—"
        end = obj.current_period_end.strftime("%Y-%m-%d") if obj.current_period_end else "—"
        return f"{start} → {end}"

    @admin.action(description="Mark selected subscriptions as active")
    def mark_active(self, request, queryset):
        now = timezone.now()
        updated = queryset.update(status=Subscription.Status.ACTIVE, ended_at=None, updated_at=now)
        self.message_user(
            request,
            f"{updated} subscription(s) marked active.",
            level=messages.SUCCESS,
        )

    @admin.action(description="Mark selected subscriptions as past due")
    def mark_past_due(self, request, queryset):
        now = timezone.now()
        updated = queryset.update(status=Subscription.Status.PAST_DUE, updated_at=now)
        self.message_user(
            request,
            f"{updated} subscription(s) marked past due.",
            level=messages.SUCCESS,
        )

    @admin.action(description="Mark selected subscriptions as cancelled")
    def mark_cancelled(self, request, queryset):
        now = timezone.now()
        updated = queryset.update(
            status=Subscription.Status.CANCELLED,
            cancelled_at=now,
            ended_at=now,
            updated_at=now,
        )
        self.message_user(
            request,
            f"{updated} subscription(s) marked cancelled.",
            level=messages.SUCCESS,
        )

    @admin.action(description="Mark selected subscriptions as expired")
    def mark_expired(self, request, queryset):
        now = timezone.now()
        updated = queryset.update(
            status=Subscription.Status.EXPIRED,
            ended_at=now,
            updated_at=now,
        )
        self.message_user(
            request,
            f"{updated} subscription(s) marked expired.",
            level=messages.SUCCESS,
        )

    @admin.action(description="Extend selected subscriptions by 30 days")
    def extend_30_days(self, request, queryset):
        updated = 0
        now = timezone.now()

        for subscription in queryset:
            base = subscription.current_period_end if subscription.current_period_end and subscription.current_period_end > now else now
            subscription.current_period_end = base + timedelta(days=30)
            if subscription.status in {
                Subscription.Status.PAST_DUE,
                Subscription.Status.EXPIRED,
                Subscription.Status.CANCELLED,
            }:
                subscription.status = Subscription.Status.ACTIVE
                subscription.ended_at = None
            subscription.save(
                update_fields=[
                    "current_period_end",
                    "status",
                    "ended_at",
                    "updated_at",
                ]
            )
            updated += 1

        self.message_user(
            request,
            f"{updated} subscription(s) extended by 30 days.",
            level=messages.SUCCESS,
        )

    @admin.action(description="Disable auto renew on selected subscriptions")
    def disable_auto_renew(self, request, queryset):
        updated = queryset.update(auto_renew=False)
        self.message_user(
            request,
            f"Auto renew disabled for {updated} subscription(s).",
            level=messages.SUCCESS,
        )

    @admin.action(description="Enable auto renew on selected subscriptions")
    def enable_auto_renew(self, request, queryset):
        updated = queryset.update(auto_renew=True)
        self.message_user(
            request,
            f"Auto renew enabled for {updated} subscription(s).",
            level=messages.SUCCESS,
        )


@admin.register(BillingUsage)
class BillingUsageAdmin(admin.ModelAdmin):
    list_display = (
        "company",
        "year",
        "month",
        "documents_created",
        "emails_sent",
        "storage_mb",
        "updated_at",
    )
    list_filter = ("year", "month")
    search_fields = ("company__name",)
    ordering = ("-year", "-month", "company__name")
    readonly_fields = ("created_at", "updated_at", "storage_mb")
    actions = ("reset_email_usage", "reset_document_usage")

    fieldsets = (
        (
            "Scope",
            {
                "fields": (
                    "company",
                    "year",
                    "month",
                )
            },
        ),
        (
            "Usage",
            {
                "fields": (
                    "emails_sent",
                    "documents_created",
                    "storage_bytes",
                    "storage_mb",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    @admin.display(description="Storage (MB)")
    def storage_mb(self, obj):
        return round((obj.storage_bytes or 0) / (1024 * 1024), 2)

    @admin.action(description="Reset email usage for selected rows")
    def reset_email_usage(self, request, queryset):
        updated = queryset.update(emails_sent=0)
        self.message_user(
            request,
            f"Email usage reset for {updated} row(s).",
            level=messages.SUCCESS,
        )

    @admin.action(description="Reset document usage for selected rows")
    def reset_document_usage(self, request, queryset):
        updated = queryset.update(documents_created=0)
        self.message_user(
            request,
            f"Document usage reset for {updated} row(s).",
            level=messages.SUCCESS,
        )


@admin.register(SubscriptionEvent)
class SubscriptionEventAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "company",
        "subscription",
        "event_type",
        "plan_code",
        "short_note",
    )
    list_filter = ("event_type", "plan_code", "created_at")
    search_fields = (
        "company__name",
        "subscription__id",
        "plan_code",
        "note",
    )
    ordering = ("-created_at",)
    readonly_fields = (
        "company",
        "subscription",
        "event_type",
        "plan_code",
        "note",
        "metadata",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description="Note")
    def short_note(self, obj):
        if not obj.note:
            return "—"
        return obj.note[:80] + ("..." if len(obj.note) > 80 else "")