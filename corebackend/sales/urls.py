from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views_email import EmailSendingConfigViewSet

from .views import (
    CompanyViewSet,
    DeliveryNoteLineViewSet,
    DeliveryNoteViewSet,
    DocumentViewSet,
    InvoiceLineViewSet,
    InvoiceViewSet,
    ProformaLineViewSet,
    ProformaViewSet,
    QuotationLineViewSet,
    QuotationViewSet,
    ReceiptViewSet,
    TemplateViewSet,
)

from .views_product_customer import CustomerViewSet, ProductViewSet

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
router.register(r"email-sending-configs", EmailSendingConfigViewSet)

urlpatterns = [
    path("", include(router.urls)),
]