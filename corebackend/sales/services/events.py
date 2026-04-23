from django.contrib.contenttypes.models import ContentType
from django.db.models import Q

from ..models import DocumentEvent


def _source_identifier(instance):
    return (
        getattr(instance, "quote_number", None)
        or getattr(instance, "invoice_number", None)
        or getattr(instance, "proforma_number", None)
        or getattr(instance, "receipt_number", None)
        or getattr(instance, "delivery_note_number", None)
        or str(getattr(instance, "pk", ""))
    )


def _event_source_filter(instance):
    source_content_type = ContentType.objects.get_for_model(instance.__class__)
    query = Q(
        source_content_type=source_content_type,
        source_object_id=str(instance.pk),
    )

    document = getattr(instance, "document", None)
    if document:
        query |= Q(document=document)

    return query


def get_events_for_instance(instance):
    return (
        DocumentEvent.objects.filter(_event_source_filter(instance))
        .select_related("created_by", "document", "company")
        .distinct()
        .order_by("-created_at")
    )


def get_events_for_instances(instances):
    query = Q()
    has_instances = False
    for instance in instances:
        if instance and getattr(instance, "pk", None):
            has_instances = True
            query |= _event_source_filter(instance)

    if not has_instances:
        return DocumentEvent.objects.none()

    return (
        DocumentEvent.objects.filter(query)
        .select_related("created_by", "document", "company")
        .distinct()
        .order_by("-created_at")
    )


def log_event(instance, event_type, metadata=None, user=None):
    source_content_type = ContentType.objects.get_for_model(instance.__class__)
    company = getattr(instance, "company", None)
    event_metadata = {
        "source_document_id": getattr(instance, "pk", None),
        "source_document_number": _source_identifier(instance),
        "source_model": source_content_type.model,
        **(metadata or {}),
    }

    if user and user.is_authenticated:
        event_metadata.setdefault("user", user.get_full_name() or user.email or user.username)

    try:
        DocumentEvent.objects.create(
            document=getattr(instance, "document", None),
            company=company,
            source_content_type=source_content_type,
            source_object_id=str(instance.pk),
            event_type=event_type,
            metadata=event_metadata,
            created_by=user if user and user.is_authenticated else None,
        )
    except Exception:
        return None
