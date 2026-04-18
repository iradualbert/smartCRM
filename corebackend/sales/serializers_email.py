from .models_email import EmailSendingConfig, DocumentEmail
from rest_framework import serializers

class DocumentEmailSerializer(serializers.ModelSerializer):
    sent_by_name = serializers.SerializerMethodField()
    sending_config_name = serializers.CharField(source="sending_config.name", read_only=True)

    class Meta:
        model = DocumentEmail
        fields = (
            "id",
            "company",
            "sending_config",
            "sending_config_name",
            "source_model",
            "source_identifier",
            "subject",
            "to_emails",
            "cc_emails",
            "bcc_emails",
            "include_attachment",
            "attachment_filename",
            "status",
            "queued_at",
            "sent_at",
            "failed_at",
            "failure_reason",
            "retry_count",
            "sent_by",
            "sent_by_name",
            "created_at",
            "updated_at",
        )

    def get_sent_by_name(self, obj):
        if not obj.sent_by:
            return ""
        return obj.sent_by.get_full_name() or obj.sent_by.email or obj.sent_by.username