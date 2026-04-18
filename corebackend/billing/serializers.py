from rest_framework import serializers

from .models import BillingUsage, Plan, Subscription, SubscriptionEvent


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = (
            "id",
            "code",
            "name",
            "price_try",
            "price_usd",
            "billing_interval",
            "is_active",
            "is_default",
            "is_public",
            "max_organizations",
            "max_users",
            "max_documents_per_month",
            "max_emails_per_month",
            "max_storage_mb",
            "allow_custom_templates",
            "allow_pdf_generation",
            "allow_email_sending",
            "allow_ai_quote_extraction",
            "allow_catalog_management",
            "allow_branding_removal",
            "display_order",
            "is_contact_only",
        )
        read_only_fields = fields


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Subscription
        fields = (
            "id",
            "company",
            "company_name",
            "plan",
            "status",
            "billing_currency",
            "billing_amount",
            "started_at",
            "current_period_start",
            "current_period_end",
            "cancelled_at",
            "ended_at",
            "auto_renew",
            "external_provider",
            "external_subscription_id",
            "external_customer_id",
            "external_checkout_token",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class BillingUsageSerializer(serializers.ModelSerializer):
    storage_mb = serializers.SerializerMethodField()

    class Meta:
        model = BillingUsage
        fields = (
            "id",
            "company",
            "year",
            "month",
            "emails_sent",
            "documents_created",
            "storage_bytes",
            "storage_mb",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_storage_mb(self, obj):
        return round((obj.storage_bytes or 0) / (1024 * 1024), 2)


class SubscriptionEventSerializer(serializers.ModelSerializer):
    subscription_id = serializers.CharField(source="subscription.id", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = SubscriptionEvent
        fields = (
            "id",
            "company",
            "company_name",
            "subscription",
            "subscription_id",
            "event_type",
            "plan_code",
            "note",
            "metadata",
            "created_at",
        )
        read_only_fields = fields


class BillingOverviewSerializer(serializers.Serializer):
    company_id = serializers.CharField()
    subscription = SubscriptionSerializer()
    usage = BillingUsageSerializer()
    can_manage_billing = serializers.BooleanField()


class CreateCheckoutSerializer(serializers.Serializer):
    company = serializers.CharField()
    plan_code = serializers.CharField()
    currency = serializers.ChoiceField(choices=["TRY", "USD"], default="TRY")

    def validate_plan_code(self, value):
        if not Plan.objects.filter(code=value, is_active=True).exists():
            raise serializers.ValidationError("Selected plan does not exist or is inactive.")
        return value