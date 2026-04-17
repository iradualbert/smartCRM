from ..models import DocumentEvent

def log_event(document, event_type, metadata=None, user=None):
    print(f"Logging event: {event_type} for document ID {document.document} by user {user.username}")
    
    return True
    DocumentEvent.objects.create(
        document=document,
        event_type=event_type,
        metadata=metadata or {},
        created_by=user if user and user.is_authenticated else None,
    )