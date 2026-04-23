from rest_framework import serializers
from billing.serializers import SubscriptionSerializer

class DashboardSummarySerializer(serializers.Serializer):
    draft_quotations = serializers.IntegerField()
    sent_quotations = serializers.IntegerField()
    outstanding_invoices = serializers.IntegerField()
    overdue_invoices = serializers.IntegerField()
    documents_created_this_month = serializers.IntegerField()
    emails_sent_this_month = serializers.IntegerField()


class DashboardMoneySerializer(serializers.Serializer):
    quotation_pipeline_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    invoice_outstanding_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    receipts_collected_this_month = serializers.DecimalField(max_digits=12, decimal_places=2)


class DashboardUsageSerializer(serializers.Serializer):
    documents_created = serializers.IntegerField()
    emails_sent = serializers.IntegerField()
    storage_bytes = serializers.IntegerField()
    storage_mb = serializers.FloatField()


class DashboardSubscriptionSerializer(serializers.Serializer):
    plan = serializers.CharField(allow_blank=True)
    status = serializers.CharField(allow_blank=True)
    current_period_end = serializers.DateTimeField(allow_null=True)
    auto_renew = serializers.BooleanField(required=False)


class DashboardResponseSerializer(serializers.Serializer):
    company = serializers.DictField()
    summary = DashboardSummarySerializer()
    money = DashboardMoneySerializer()
    usage = DashboardUsageSerializer()
    subscription = DashboardSubscriptionSerializer()
    recent_documents = serializers.ListField()
    recent_events = serializers.ListField()
    attention = serializers.ListField()
    
    
class DashboardMetricCardSerializer(serializers.Serializer):
    label = serializers.CharField()
    value = serializers.CharField()
    hint = serializers.CharField(required=False, allow_blank=True, default="")


class DashboardAttentionItemSerializer(serializers.Serializer):
    type = serializers.CharField()
    label = serializers.CharField()


class DashboardActivityItemSerializer(serializers.Serializer):
    type = serializers.CharField()
    label = serializers.CharField()
    created_at = serializers.DateTimeField()


class DashboardRecentQuotationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    quote_number = serializers.CharField()
    name = serializers.CharField()
    status = serializers.CharField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    created_at = serializers.DateTimeField()


class DashboardSetupItemSerializer(serializers.Serializer):
    key = serializers.CharField()
    label = serializers.CharField()
    value = serializers.CharField()
    ready = serializers.BooleanField()
    detail = serializers.CharField(required=False, allow_blank=True, default="")
    action_label = serializers.CharField(required=False, allow_blank=True, default="")
    action_href = serializers.CharField(required=False, allow_blank=True, default="")


class DashboardPlanLimitsSerializer(serializers.Serializer):
    max_documents_per_month = serializers.IntegerField(allow_null=True)
    max_emails_per_month = serializers.IntegerField(allow_null=True)
    max_storage_mb = serializers.IntegerField(allow_null=True)
    allow_pdf_generation = serializers.BooleanField()
    allow_email_sending = serializers.BooleanField()


class WorkspaceDashboardSerializer(serializers.Serializer):
    company = serializers.DictField()
    is_new_workspace = serializers.BooleanField(default=False)
    metrics = DashboardMetricCardSerializer(many=True)
    setup = DashboardSetupItemSerializer(many=True)
    usage = serializers.DictField()
    plan_limits = DashboardPlanLimitsSerializer()
    attention = DashboardAttentionItemSerializer(many=True)
    activity = DashboardActivityItemSerializer(many=True)
    recent_quotations = DashboardRecentQuotationSerializer(many=True)
    subscription = DashboardSubscriptionSerializer()
    


class SalesDashboardSerializer(serializers.Serializer):
    company = serializers.DictField()
    metrics = DashboardMetricCardSerializer(many=True)
    status_breakdown = serializers.DictField()
    money = serializers.DictField()
    recent_quotations = DashboardRecentQuotationSerializer(many=True)
    attention = DashboardAttentionItemSerializer(many=True)
    
