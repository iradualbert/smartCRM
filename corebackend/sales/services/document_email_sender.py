# sales/services/document_email_sender.py
from sales.models_email import EmailSendingConfig
from .email_smtp import send_email_with_config


def send_document_email_with_config(
    *,
    config: EmailSendingConfig,
    subject: str,
    body_html: str,
    to: list[str],
    cc: list[str] | None = None,
    bcc: list[str] | None = None,
    include_attachment: bool = True,
    document_file=None,
) -> int:
    attachments = []

    if include_attachment and document_file and getattr(document_file, "path", None):
        attachments.append(document_file.path)

    return send_email_with_config(
        config=config,
        subject=subject,
        body_html=body_html,
        to=to,
        cc=cc,
        bcc=bcc,
        attachments=attachments,
    )