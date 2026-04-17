# sales/models_email.py
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from .models import Company, TimeStampedModel


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