from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.mail import EmailMultiAlternatives, get_connection
from django.db import transaction
from django.utils import timezone
from django.utils.html import strip_tags

from sales.models import Document
from sales.models_email import DocumentEmail, EmailSendingConfig
from .email_crypto import decrypt_secret


def _build_connection(config: EmailSendingConfig | None = None):
    if config is None:
        return get_connection(
            backend=getattr(
                settings,
                "EMAIL_BACKEND",
                "django.core.mail.backends.smtp.EmailBackend",
            ),
            fail_silently=False,
        )

    password = decrypt_secret(config.smtp_password_encrypted)

    return get_connection(
        backend="django.core.mail.backends.smtp.EmailBackend",
        host=config.smtp_host,
        port=config.smtp_port,
        username=config.smtp_username,
        password=password,
        use_tls=config.security_type == EmailSendingConfig.SecurityType.TLS,
        use_ssl=config.security_type == EmailSendingConfig.SecurityType.SSL,
        fail_silently=False,
    )


def _formatted_from_email(
    *,
    config: EmailSendingConfig | None = None,
    fallback_from_email: str | None = None,
    fallback_from_name: str | None = None,
) -> str:
    if config:
        if config.from_name:
            return f"{config.from_name} <{config.from_email}>"
        return config.from_email

    from_email = fallback_from_email or getattr(settings, "MODURA_DEFAULT_FROM_EMAIL", None) or getattr(settings, "DEFAULT_FROM_EMAIL", "")
    from_name = fallback_from_name or getattr(settings, "MODURA_DEFAULT_FROM_NAME", "Modura")

    if from_name:
        return f"{from_name} <{from_email}>"
    return from_email


def _safe_identifier_for_instance(instance) -> str:
    return (
        getattr(instance, "quote_number", None)
        or getattr(instance, "invoice_number", None)
        or getattr(instance, "proforma_number", None)
        or getattr(instance, "receipt_number", None)
        or getattr(instance, "delivery_note_number", None)
        or str(instance.pk)
    )


def _attachment_filename_from_document(document: Document | None) -> str:
    if not document or not getattr(document, "file", None):
        return ""
    return str(document.file.name).split("/")[-1]


@transaction.atomic
def create_document_email_log(
    *,
    instance,
    config: EmailSendingConfig | None,
    subject: str,
    body_html: str,
    to: list[str],
    cc: list[str] | None = None,
    bcc: list[str] | None = None,
    include_attachment: bool = True,
    document: Document | None = None,
    sent_by=None,
    fallback_from_email: str | None = None,
    fallback_from_name: str | None = None,
) -> DocumentEmail:
    source_content_type = ContentType.objects.get_for_model(instance.__class__)

    resolved_from_email = (
        config.from_email
        if config
        else fallback_from_email
        or getattr(settings, "MODURA_DEFAULT_FROM_EMAIL", None)
        or getattr(settings, "DEFAULT_FROM_EMAIL", "")
    )

    resolved_from_name = (
        config.from_name
        if config
        else fallback_from_name
        or getattr(settings, "MODURA_DEFAULT_FROM_NAME", "Modura")
    )

    email_log = DocumentEmail.objects.create(
        company=instance.company,
        sending_config=config,
        source_content_type=source_content_type,
        source_object_id=instance.pk,
        attachment_document=document if include_attachment else None,
        from_email=resolved_from_email,
        from_name=resolved_from_name or "",
        to_emails=[v.strip() for v in to if v and v.strip()],
        cc_emails=[v.strip() for v in (cc or []) if v and v.strip()],
        bcc_emails=[v.strip() for v in (bcc or []) if v and v.strip()],
        subject=subject.strip(),
        body_html=body_html or "",
        body_text=strip_tags(body_html or "").strip()
        or "Please view this email in an HTML-capable client.",
        include_attachment=bool(include_attachment),
        attachment_filename=_attachment_filename_from_document(document) if include_attachment else "",
        status=DocumentEmail.Status.PENDING,
        sent_by=sent_by,
        source_model=source_content_type.model,
        source_identifier=_safe_identifier_for_instance(instance),
        created_by=sent_by,
        updated_by=sent_by,
    )
    return email_log


def send_logged_email(
    *,
    email_log: DocumentEmail,
    config: EmailSendingConfig | None = None,
    attachments: list[str | Path] | None = None,
    reply_to: list[str] | None = None,
    fallback_from_email: str | None = None,
    fallback_from_name: str | None = None,
) -> DocumentEmail:
    if config and not config.is_active:
        email_log.status = DocumentEmail.Status.FAILED
        email_log.failed_at = timezone.now()
        email_log.failure_reason = "Selected email sending config is inactive."
        email_log.save(update_fields=["status", "failed_at", "failure_reason", "updated_at"])
        raise ValueError("Selected email sending config is inactive.")

    if not email_log.to_emails:
        email_log.status = DocumentEmail.Status.FAILED
        email_log.failed_at = timezone.now()
        email_log.failure_reason = "At least one recipient is required."
        email_log.save(update_fields=["status", "failed_at", "failure_reason", "updated_at"])
        raise ValueError("At least one recipient is required.")

    connection = _build_connection(config)

    message = EmailMultiAlternatives(
        subject=email_log.subject.strip(),
        body=email_log.body_text,
        from_email=_formatted_from_email(
            config=config,
            fallback_from_email=fallback_from_email,
            fallback_from_name=fallback_from_name,
        ),
        to=[v.strip() for v in email_log.to_emails if v and v.strip()],
        cc=[v.strip() for v in (email_log.cc_emails or []) if v and v.strip()],
        bcc=[v.strip() for v in (email_log.bcc_emails or []) if v and v.strip()],
        reply_to=[v.strip() for v in (reply_to or []) if v and v.strip()],
        connection=connection,
    )
    message.attach_alternative(email_log.body_html or "", "text/html")

    for attachment in attachments or []:
        path = Path(attachment)
        if not path.exists() or not path.is_file():
            email_log.status = DocumentEmail.Status.FAILED
            email_log.failed_at = timezone.now()
            email_log.failure_reason = f"Attachment not found: {path}"
            email_log.save(
                update_fields=["status", "failed_at", "failure_reason", "updated_at"]
            )
            raise FileNotFoundError(f"Attachment not found: {path}")
        message.attach_file(str(path))

    try:
        sent_count = message.send(fail_silently=False)
        if sent_count < 1:
            raise RuntimeError("SMTP backend reported zero messages sent.")

        email_log.status = DocumentEmail.Status.SENT
        email_log.sent_at = timezone.now()
        email_log.failure_reason = ""
        email_log.save(
            update_fields=["status", "sent_at", "failure_reason", "updated_at"]
        )
        return email_log
    except Exception as exc:
        email_log.status = DocumentEmail.Status.FAILED
        email_log.failed_at = timezone.now()
        email_log.failure_reason = str(exc)
        email_log.retry_count = (email_log.retry_count or 0) + 1
        email_log.save(
            update_fields=[
                "status",
                "failed_at",
                "failure_reason",
                "retry_count",
                "updated_at",
            ]
        )
        raise


def send_document_email(
    *,
    instance,
    config: EmailSendingConfig | None,
    subject: str,
    body_html: str,
    to: list[str],
    cc: list[str] | None = None,
    bcc: list[str] | None = None,
    include_attachment: bool = True,
    document_file=None,
    document: Document | None = None,
    sent_by=None,
    reply_to: list[str] | None = None,
    fallback_from_email: str | None = None,
    fallback_from_name: str | None = None,
) -> DocumentEmail:
    attachments: list[str | Path] = []

    if include_attachment and document_file and getattr(document_file, "path", None):
        attachments.append(document_file.path)

    email_log = create_document_email_log(
        instance=instance,
        config=config,
        subject=subject,
        body_html=body_html,
        to=to,
        cc=cc,
        bcc=bcc,
        include_attachment=bool(include_attachment),
        document=document if include_attachment else None,
        sent_by=sent_by,
        fallback_from_email=fallback_from_email,
        fallback_from_name=fallback_from_name,
    )

    return send_logged_email(
        email_log=email_log,
        config=config,
        attachments=attachments,
        reply_to=reply_to,
        fallback_from_email=fallback_from_email,
        fallback_from_name=fallback_from_name,
    )


def test_smtp_config(config: EmailSendingConfig) -> None:
    connection = _build_connection(config)
    connection.open()
    connection.close()
    
    
send_logged_email_with_config = send_logged_email
send_email_with_config = send_document_email