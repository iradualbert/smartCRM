from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.db import models

from .models import Company, Document, TimeStampedModel


class EmailSendingConfig(TimeStampedModel):
    class OwnerType(models.TextChoices):
        COMPANY = "company", "Company"
        USER = "user", "User"

    class SecurityType(models.TextChoices):
        TLS = "tls", "TLS"
        SSL = "ssl", "SSL"
        NONE = "none", "None"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="email_sending_configs",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="email_sending_configs",
    )

    owner_type = models.CharField(max_length=20, choices=OwnerType.choices)

    name = models.CharField(max_length=255)
    from_name = models.CharField(max_length=255, blank=True, null=True)
    from_email = models.EmailField()

    smtp_host = models.CharField(max_length=255)
    smtp_port = models.PositiveIntegerField(default=587)
    smtp_username = models.CharField(max_length=255)
    smtp_password_encrypted = models.TextField()

    security_type = models.CharField(
        max_length=10,
        choices=SecurityType.choices,
        default=SecurityType.TLS,
    )

    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)

    last_tested_at = models.DateTimeField(null=True, blank=True)
    last_test_status = models.CharField(max_length=50, blank=True, null=True)
    last_test_error = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["owner_type", "name"]

    def clean(self):
        if self.owner_type == self.OwnerType.COMPANY and not self.company:
            raise ValidationError({"company": "Company is required for company-owned configs."})
        if self.owner_type == self.OwnerType.USER and not self.user:
            raise ValidationError({"user": "User is required for user-owned configs."})
        if self.company and self.user:
            raise ValidationError("A sending config cannot belong to both a company and a user.")

    def __str__(self):
        return f"{self.name} <{self.from_email}>"


class DocumentEmail(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="document_emails",
    )

    sending_config = models.ForeignKey(
        EmailSendingConfig,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_emails",
    )

    # generic relation to quotation / invoice / proforma / receipt / delivery note
    source_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="document_email_sources",
    )
    source_object_id = models.CharField(max_length=255)
    source_object = GenericForeignKey("source_content_type", "source_object_id")

    # optional direct link to generated PDF document snapshot used at send time
    attachment_document = models.ForeignKey(
        Document,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="emails",
    )

    from_email = models.EmailField()
    from_name = models.CharField(max_length=255, blank=True, null=True)

    to_emails = models.JSONField(default=list, blank=True)
    cc_emails = models.JSONField(default=list, blank=True)
    bcc_emails = models.JSONField(default=list, blank=True)

    subject = models.CharField(max_length=998)
    body_html = models.TextField()
    body_text = models.TextField(blank=True, default="")

    include_attachment = models.BooleanField(default=True)
    attachment_filename = models.CharField(max_length=255, blank=True, default="")

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="document_emails_sent",
    )

    queued_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)

    provider_message_id = models.CharField(max_length=255, blank=True, default="")
    failure_reason = models.TextField(blank=True, default="")
    retry_count = models.PositiveIntegerField(default=0)

    # cached labels for easier list rendering and historical stability
    source_model = models.CharField(max_length=100, blank=True, default="")
    source_identifier = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        ordering = ["-queued_at"]
        indexes = [
            models.Index(fields=["company", "status"]),
            models.Index(fields=["source_content_type", "source_object_id"]),
            models.Index(fields=["queued_at"]),
            models.Index(fields=["sent_at"]),
        ]

    def clean(self):
        return True
        if not self.to_emails:
            raise ValidationError({"to_emails": "At least one recipient email is required."})

    def save(self, *args, **kwargs):
        if self.source_content_type_id and not self.source_model:
            self.source_model = self.source_content_type.model

        if self.source_object and not self.source_identifier:
            self.source_identifier = (
                getattr(self.source_object, "quote_number", None)
                or getattr(self.source_object, "invoice_number", None)
                or getattr(self.source_object, "proforma_number", None)
                or getattr(self.source_object, "receipt_number", None)
                or getattr(self.source_object, "delivery_note_number", None)
                or str(self.source_object.pk)
            )

        if self.attachment_document and not self.attachment_filename:
            file_field = getattr(self.attachment_document, "file", None)
            if file_field:
                self.attachment_filename = file_field.name.split("/")[-1]

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.subject} -> {', '.join(self.to_emails[:2])}"