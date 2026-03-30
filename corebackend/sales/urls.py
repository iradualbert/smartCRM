from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CompanyViewSet,
    CustomerViewSet,
    DeliveryNoteLineViewSet,
    DeliveryNoteViewSet,
    DocumentViewSet,
    InvoiceLineViewSet,
    InvoiceViewSet,
    ProductViewSet,
    ProformaLineViewSet,
    ProformaViewSet,
    QuotationLineViewSet,
    QuotationViewSet,
    ReceiptViewSet,
    TemplateViewSet,
)

router = DefaultRouter()
router.register(r"companies", CompanyViewSet)
router.register(r"documents", DocumentViewSet)
router.register(r"templates", TemplateViewSet)
router.register(r"customers", CustomerViewSet)
router.register(r"products", ProductViewSet)
router.register(r"quotations", QuotationViewSet)
router.register(r"quotation-lines", QuotationLineViewSet)
router.register(r"proformas", ProformaViewSet)
router.register(r"proforma-lines", ProformaLineViewSet)
router.register(r"invoices", InvoiceViewSet)
router.register(r"invoice-lines", InvoiceLineViewSet)
router.register(r"receipts", ReceiptViewSet)
router.register(r"delivery-notes", DeliveryNoteViewSet)
router.register(r"delivery-note-lines", DeliveryNoteLineViewSet)

urlpatterns = [
    path("", include(router.urls)),
]