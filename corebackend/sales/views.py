import os

from django.http import FileResponse, Http404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import (
    Company,
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
    CompanySerializer,
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
from .services.document_generation import (
    file_exists,
    generate_document_for_instance,
    get_existing_document_or_raise,
    inspect_template_file,
)


class BaseModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]


class DocumentLifecycleMixin:
    document_type = None

    @action(detail=True, methods=["get"])
    def pdf(self, request, pk=None):
        instance = self.get_object()
        try:
            document = get_existing_document_or_raise(instance)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)

        if not document.file or not file_exists(document.file):
            raise Http404("PDF file not found.")

        return FileResponse(
            open(document.file.path, "rb"),
            content_type="application/pdf",
            filename=os.path.basename(document.file.name),
        )

    @action(detail=True, methods=["post"])
    def generate_pdf(self, request, pk=None):
        instance = self.get_object()
        try:
            document, generated = generate_document_for_instance(
                instance=instance,
                document_type=self.document_type,
                user=request.user,
                force=False,
            )
            response_status = status.HTTP_201_CREATED if generated else status.HTTP_200_OK
            return Response(
                {
                    "detail": "PDF generated." if generated else "Existing PDF reused.",
                    "document_id": document.id,
                    "document_file": document.file.url if document.file else None,
                    "pdf_generated_at": instance.pdf_generated_at,
                    "pdf_needs_regeneration": instance.pdf_needs_regeneration,
                },
                status=response_status,
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def regenerate_pdf(self, request, pk=None):
        instance = self.get_object()
        try:
            document, _ = generate_document_for_instance(
                instance=instance,
                document_type=self.document_type,
                user=request.user,
                force=True,
            )
            return Response(
                {
                    "detail": "PDF regenerated.",
                    "document_id": document.id,
                    "document_file": document.file.url if document.file else None,
                    "pdf_generated_at": instance.pdf_generated_at,
                    "pdf_needs_regeneration": instance.pdf_needs_regeneration,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class CompanyViewSet(BaseModelViewSet):
    queryset = Company.objects.all().order_by("-created_at")
    serializer_class = CompanySerializer


class DocumentViewSet(BaseModelViewSet):
    queryset = Document.objects.select_related("template").all().order_by("-created_at")
    serializer_class = DocumentSerializer


class TemplateViewSet(BaseModelViewSet):
    queryset = Template.objects.select_related("company").all().order_by("-created_at")
    serializer_class = TemplateSerializer

    @action(detail=True, methods=["post"])
    def inspect(self, request, pk=None):
        template = self.get_object()
        try:
            result = inspect_template_file(template)
            return Response(result)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class CustomerViewSet(BaseModelViewSet):
    queryset = Customer.objects.select_related("company").all().order_by("-created_at")
    serializer_class = CustomerSerializer


class ProductViewSet(BaseModelViewSet):
    queryset = Product.objects.select_related("company").all().order_by("-created_at")
    serializer_class = ProductSerializer


class QuotationViewSet(DocumentLifecycleMixin, BaseModelViewSet):
    document_type = "quotation"
    queryset = Quotation.objects.select_related(
        "customer", "company", "document", "selected_template", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = QuotationSerializer


class QuotationLineViewSet(BaseModelViewSet):
    queryset = QuotationLine.objects.select_related(
        "quotation", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = QuotationLineSerializer

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        obj = serializer.save(created_by=user, updated_by=user)
        obj.quotation.recalculate_totals()

    def perform_update(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        obj = serializer.save(updated_by=user)
        obj.quotation.recalculate_totals()

    def perform_destroy(self, instance):
        quotation = instance.quotation
        instance.delete()
        quotation.recalculate_totals()


class ProformaViewSet(DocumentLifecycleMixin, BaseModelViewSet):
    document_type = "proforma"
    queryset = Proforma.objects.select_related(
        "quotation", "customer", "company", "document", "selected_template", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = ProformaSerializer


class ProformaLineViewSet(BaseModelViewSet):
    queryset = ProformaLine.objects.select_related(
        "proforma", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = ProformaLineSerializer

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        obj = serializer.save(created_by=user, updated_by=user)
        obj.proforma.recalculate_totals()

    def perform_update(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        obj = serializer.save(updated_by=user)
        obj.proforma.recalculate_totals()

    def perform_destroy(self, instance):
        proforma = instance.proforma
        instance.delete()
        proforma.recalculate_totals()


class InvoiceViewSet(DocumentLifecycleMixin, BaseModelViewSet):
    document_type = "invoice"
    queryset = Invoice.objects.select_related(
        "proforma", "company", "document", "selected_template", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = InvoiceSerializer


class InvoiceLineViewSet(BaseModelViewSet):
    queryset = InvoiceLine.objects.select_related(
        "invoice", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = InvoiceLineSerializer

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        obj = serializer.save(created_by=user, updated_by=user)
        obj.invoice.recalculate_totals()

    def perform_update(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        obj = serializer.save(updated_by=user)
        obj.invoice.recalculate_totals()

    def perform_destroy(self, instance):
        invoice = instance.invoice
        instance.delete()
        invoice.recalculate_totals()


class ReceiptViewSet(DocumentLifecycleMixin, BaseModelViewSet):
    document_type = "receipt"
    queryset = Receipt.objects.select_related(
        "invoice", "company", "document", "selected_template", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = ReceiptSerializer


class DeliveryNoteViewSet(DocumentLifecycleMixin, BaseModelViewSet):
    document_type = "delivery_note"
    queryset = DeliveryNote.objects.select_related(
        "invoice", "company", "document", "selected_template", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = DeliveryNoteSerializer


class DeliveryNoteLineViewSet(BaseModelViewSet):
    queryset = DeliveryNoteLine.objects.select_related(
        "delivery_note", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = DeliveryNoteLineSerializer