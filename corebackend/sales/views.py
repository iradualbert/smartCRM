from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import (
    Customer,
    DeliveryNote,
    DeliveryNoteLine,
    Document,
    Invoice,
    InvoiceLine,
    Product,
    Proforma,
    ProformaLine,
    Quotation,
    QuotationLine,
    Receipt,
    Template,
)
from .serializers import (
    CustomerSerializer,
    DeliveryNoteLineSerializer,
    DeliveryNoteSerializer,
    DocumentSerializer,
    InvoiceLineSerializer,
    InvoiceSerializer,
    ProductSerializer,
    ProformaLineSerializer,
    ProformaSerializer,
    QuotationLineSerializer,
    QuotationSerializer,
    ReceiptSerializer,
    TemplateSerializer,
)


class BaseModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]


class DocumentViewSet(BaseModelViewSet):
    queryset = Document.objects.all().order_by("-created_at")
    serializer_class = DocumentSerializer


class TemplateViewSet(BaseModelViewSet):
    queryset = Template.objects.all().order_by("-created_at")
    serializer_class = TemplateSerializer


class CustomerViewSet(BaseModelViewSet):
    queryset = Customer.objects.all().order_by("-created_at")
    serializer_class = CustomerSerializer


class ProductViewSet(BaseModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer


class QuotationViewSet(BaseModelViewSet):
    queryset = Quotation.objects.select_related(
        "customer", "document", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = QuotationSerializer


class QuotationLineViewSet(BaseModelViewSet):
    queryset = QuotationLine.objects.select_related(
        "quotation", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = QuotationLineSerializer

    def perform_create(self, serializer):
        obj = serializer.save(
            created_by=self.request.user if self.request.user.is_authenticated else None,
            updated_by=self.request.user if self.request.user.is_authenticated else None,
        )
        obj.quotation.recalculate_totals()

    def perform_update(self, serializer):
        obj = serializer.save(
            updated_by=self.request.user if self.request.user.is_authenticated else None
        )
        obj.quotation.recalculate_totals()

    def perform_destroy(self, instance):
        quotation = instance.quotation
        instance.delete()
        quotation.recalculate_totals()


class ProformaViewSet(BaseModelViewSet):
    queryset = Proforma.objects.select_related(
        "quotation", "customer", "document", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = ProformaSerializer


class ProformaLineViewSet(BaseModelViewSet):
    queryset = ProformaLine.objects.select_related(
        "proforma", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = ProformaLineSerializer

    def perform_create(self, serializer):
        obj = serializer.save(
            created_by=self.request.user if self.request.user.is_authenticated else None,
            updated_by=self.request.user if self.request.user.is_authenticated else None,
        )
        obj.proforma.recalculate_totals()

    def perform_update(self, serializer):
        obj = serializer.save(
            updated_by=self.request.user if self.request.user.is_authenticated else None
        )
        obj.proforma.recalculate_totals()

    def perform_destroy(self, instance):
        proforma = instance.proforma
        instance.delete()
        proforma.recalculate_totals()


class InvoiceViewSet(BaseModelViewSet):
    queryset = Invoice.objects.select_related(
        "proforma", "document", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = InvoiceSerializer


class InvoiceLineViewSet(BaseModelViewSet):
    queryset = InvoiceLine.objects.select_related(
        "invoice", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = InvoiceLineSerializer

    def perform_create(self, serializer):
        obj = serializer.save(
            created_by=self.request.user if self.request.user.is_authenticated else None,
            updated_by=self.request.user if self.request.user.is_authenticated else None,
        )
        obj.invoice.recalculate_totals()

    def perform_update(self, serializer):
        obj = serializer.save(
            updated_by=self.request.user if self.request.user.is_authenticated else None
        )
        obj.invoice.recalculate_totals()

    def perform_destroy(self, instance):
        invoice = instance.invoice
        instance.delete()
        invoice.recalculate_totals()


class ReceiptViewSet(BaseModelViewSet):
    queryset = Receipt.objects.select_related(
        "invoice", "document", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = ReceiptSerializer


class DeliveryNoteViewSet(BaseModelViewSet):
    queryset = DeliveryNote.objects.select_related(
        "invoice", "document", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = DeliveryNoteSerializer


class DeliveryNoteLineViewSet(BaseModelViewSet):
    queryset = DeliveryNoteLine.objects.select_related(
        "delivery_note", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = DeliveryNoteLineSerializer