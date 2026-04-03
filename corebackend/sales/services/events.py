from ..models import DocumentEvent

def log_event(document, event_type, metadata=None, user=None):
    DocumentEvent.objects.create(
        document=document.document if hasattr(document, "document") else document,
        event_type=event_type,
        metadata=metadata or {},
        created_by=user if user and user.is_authenticated else None,
    )