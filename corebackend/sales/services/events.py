from ..models import DocumentEvent


def log_event(instance, event_type, metadata=None, user=None):
    doc = getattr(instance, "document", None)
    if not doc:
        return
    try:
        DocumentEvent.objects.create(
            document=doc,
            event_type=event_type,
            metadata=metadata or {},
            created_by=user if user and user.is_authenticated else None,
        )
    except Exception:
        pass