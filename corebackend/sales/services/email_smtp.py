from __future__ import annotations

from pathlib import Path

from django.core.mail import EmailMultiAlternatives, get_connection
from django.utils.html import strip_tags

from sales.models_email import EmailSendingConfig
from .email_crypto import decrypt_secret


def _build_connection(config: EmailSendingConfig):
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


def _formatted_from_email(config: EmailSendingConfig) -> str:
    if config.from_name:
        return f"{config.from_name} <{config.from_email}>"
    return config.from_email


def send_email_with_config(
    *,
    config: EmailSendingConfig,
    subject: str,
    body_html: str,
    to: list[str],
    cc: list[str] | None = None,
    bcc: list[str] | None = None,
    attachments: list[str | Path] | None = None,
    reply_to: list[str] | None = None,
) -> int:
    if not config.is_active:
        raise ValueError("Selected email sending config is inactive.")
    if not to:
        raise ValueError("At least one recipient is required.")

    connection = _build_connection(config)
    plain_body = strip_tags(body_html or "").strip() or "Please view this email in an HTML-capable client."

    message = EmailMultiAlternatives(
        subject=subject.strip(),
        body=plain_body,
        from_email=_formatted_from_email(config),
        to=[v.strip() for v in to if v and v.strip()],
        cc=[v.strip() for v in (cc or []) if v and v.strip()],
        bcc=[v.strip() for v in (bcc or []) if v and v.strip()],
        reply_to=[v.strip() for v in (reply_to or []) if v and v.strip()],
        connection=connection,
    )
    message.attach_alternative(body_html or "", "text/html")

    for attachment in attachments or []:
        path = Path(attachment)
        if not path.exists() or not path.is_file():
            raise FileNotFoundError(f"Attachment not found: {path}")
        message.attach_file(str(path))

    return message.send(fail_silently=False)


def test_smtp_config(config: EmailSendingConfig) -> None:
    connection = _build_connection(config)
    connection.open()
    connection.close()