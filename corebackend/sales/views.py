from django.contrib.auth.models import User
from django.http import FileResponse, Http404
from django.db import transaction
from django.db import models

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from billing.services.utils import (
    can_create_document,
    can_generate_pdf,
    can_send_email,
    increment_documents_created,
    increment_emails_sent,
)
from .services.email_smtp import send_document_email
from .models_email import EmailSendingConfig
from .services.email_template import build_email_draft_for_instance

from .models import (
    Company,
    CompanyMembership,
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
    AddCompanyUserByEmailSerializer,
    CompanyMembershipSerializer,
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
    build_document_filename,
    file_exists,
    generate_document_for_instance,
    get_existing_document_or_raise,
    inspect_template_file,
)
from .services.events import get_events_for_instance, get_events_for_instances, log_event
from .services.company import _build_company_dashboard_context, _next_document_number
from .serializers_dashboard import WorkspaceDashboardSerializer, SalesDashboardSerializer


class BaseModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]


class OrganizationScopeMixin:
    company_lookup = "company"

    def _membership_filter(self):
        return {
            f"{self.company_lookup}__memberships__user": self.request.user,
            f"{self.company_lookup}__memberships__is_active": True,
        }

    def _scope_queryset(self, queryset):
        user = self.request.user
        if user and user.is_superuser:
            return queryset
        return queryset.filter(**self._membership_filter())

    def _scope_by_company_param(self, queryset):
        company_id = self.request.query_params.get("company")
        if company_id:
            queryset = queryset.filter(**{f"{self.company_lookup}__id": company_id})
        return queryset

    def _can_access_company(self, company_id):
        if self.request.user.is_superuser:
            return True
        return CompanyMembership.objects.filter(
            company_id=company_id,
            user=self.request.user,
            is_active=True,
        ).exists()

    def _assert_company_access(self, company_id):
        if not company_id or not self._can_access_company(company_id):
            raise PermissionDenied("You do not have access to this organization.")


class OrganizationScopedLineItemMixin(OrganizationScopeMixin):
    parent_field_name = None

    def _get_parent_from_serializer(self, serializer):
        if not self.parent_field_name:
            raise RuntimeError("parent_field_name must be configured.")

        parent = serializer.validated_data.get(self.parent_field_name)
        if parent is None and serializer.instance is not None:
            parent = getattr(serializer.instance, self.parent_field_name, None)

        if parent is None:
            raise ValidationError({self.parent_field_name: "Parent document is required."})
        return parent

    def _validate_line_item_scope(self, serializer):
        parent = self._get_parent_from_serializer(serializer)
        self._assert_company_access(getattr(parent, "company_id", None))

        product = serializer.validated_data.get("product")
        if product is None and serializer.instance is not None:
            product = getattr(serializer.instance, "product", None)

        if (
            product is not None
            and getattr(product, "company_id", None) is not None
            and getattr(parent, "company_id", None) is not None
            and product.company_id != parent.company_id
        ):
            raise ValidationError({"product": "Selected product belongs to a different organization."})


class DocumentLifecycleMixin(OrganizationScopeMixin):
    document_type = None
    document_number_field = None
    document_prefix_attr = None

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = self._scope_queryset(queryset)
        queryset = self._scope_by_company_param(queryset)
        return queryset.distinct()

    def perform_create(self, serializer):
        company = serializer.validated_data.get("company")
        if company:
            self._assert_company_access(company.id)
            allowed, message = can_create_document(company)
            if not allowed:
                raise ValidationError(message)

        if company and self.document_number_field and self.document_prefix_attr:
            serializer.validated_data[self.document_number_field] = _next_document_number(
                company=company,
                field_name=self.document_number_field,
                prefix=getattr(company, self.document_prefix_attr) or "",
                provided_value=serializer.validated_data.get(self.document_number_field),
            )

        instance = serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )
        if company:
            increment_documents_created(company)
        log_event(instance, "created", user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = getattr(instance, "status", None)
        company = serializer.validated_data.get("company") or getattr(instance, "company", None)

        if company:
            self._assert_company_access(company.id)

        if company and self.document_number_field and self.document_number_field in serializer.validated_data:
            serializer.validated_data[self.document_number_field] = _next_document_number(
                company=company,
                field_name=self.document_number_field,
                prefix=getattr(company, self.document_prefix_attr) or "",
                provided_value=serializer.validated_data.get(self.document_number_field),
            )

        updated = serializer.save(updated_by=self.request.user)

        log_event(
            updated,
            "updated",
            metadata={"fields": list(serializer.validated_data.keys())},
            user=self.request.user,
        )

        if "status" in serializer.validated_data and old_status != getattr(updated, "status", None):
            log_event(
                updated,
                "status_changed",
                metadata={"from": old_status, "to": updated.status},
                user=self.request.user,
            )

    def _build_download_filename(self, instance):
        return build_document_filename(instance, document_type=self.document_type)

    def _build_authenticated_pdf_url(self, request, instance):
        company_id = request.query_params.get("company") or getattr(getattr(instance, "company", None), "id", None)
        base_path = request.path.rstrip("/")
        if base_path.endswith("/email_draft"):
            pdf_path = f"{base_path[:-len('/email_draft')]}/pdf/"
        elif base_path.endswith("/generate_pdf"):
            pdf_path = f"{base_path[:-len('/generate_pdf')]}/pdf/"
        elif base_path.endswith("/regenerate_pdf"):
            pdf_path = f"{base_path[:-len('/regenerate_pdf')]}/pdf/"
        else:
            pdf_path = f"{base_path}/pdf/"

        if company_id:
            return request.build_absolute_uri(f"{pdf_path}?company={company_id}")
        return request.build_absolute_uri(pdf_path)

    def _ensure_pdf_for_email(self, instance, user):
        needs_regeneration = bool(getattr(instance, "pdf_needs_regeneration", False))

        if instance.document and file_exists(instance.document.file) and not needs_regeneration:
            return instance.document, False

        document, generated = generate_document_for_instance(
            instance=instance,
            document_type=self.document_type,
            user=user,
            force=needs_regeneration,
        )

        log_event(
            instance,
            "pdf_generated",
            metadata={
                "generated": generated,
                "document_id": document.id,
                "trigger": "email",
                "regenerated": needs_regeneration,
            },
            user=user,
        )
        return document, generated

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated], url_path="activity")
    def activity(self, request, pk=None):
        instance = self.get_object()
        events = get_events_for_instance(instance)

        payload = [
            {
                "id": event.id,
                "event_type": event.event_type,
                "created_at": event.created_at,
                "created_by": (
                    event.created_by.get_full_name() or event.created_by.email
                    if event.created_by
                    else ""
                ),
                "metadata": event.metadata or {},
            }
            for event in events
        ]

        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def pdf(self, request, pk=None):
        instance = self.get_object()
        try:
            document = get_existing_document_or_raise(instance)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)

        if not document.file or not file_exists(document.file):
            raise Http404("PDF file not found.")

        response = FileResponse(
            open(document.file.path, "rb"),
            content_type="application/pdf",
            filename=self._build_download_filename(instance)
            
        )
        
        response["Content-Disposition"] = f'attachment; filename="{self._build_download_filename(instance)}"'
        return response

    @action(detail=True, methods=["post"])
    def generate_pdf(self, request, pk=None):
        instance = self.get_object()
        company = getattr(instance, "company", None)
        if company:
            allowed, message = can_generate_pdf(company)
            if not allowed:
                return Response({"detail": message}, status=status.HTTP_403_FORBIDDEN)
        try:
            document, generated = generate_document_for_instance(
                instance=instance,
                document_type=self.document_type,
                user=request.user,
                force=False,
            )

            log_event(
                instance,
                "pdf_generated",
                metadata={
                    "generated": generated,
                    "document_id": document.id,
                },
                user=request.user,
            )

            response_status = status.HTTP_201_CREATED if generated else status.HTTP_200_OK
            return Response(
                {
                    "detail": "PDF generated." if generated else "Existing PDF reused.",
                    "document_id": document.id,
                    "document_file": self._build_authenticated_pdf_url(request, instance),
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
        company = getattr(instance, "company", None)
        if company:
            allowed, message = can_generate_pdf(company)
            if not allowed:
                return Response({"detail": message}, status=status.HTTP_403_FORBIDDEN)
        try:
            document, _ = generate_document_for_instance(
                instance=instance,
                document_type=self.document_type,
                user=request.user,
                force=True,
            )

            log_event(
                instance,
                "pdf_generated",
                metadata={
                    "regenerated": True,
                    "document_id": document.id,
                },
                user=request.user,
            )

            return Response(
                {
                    "detail": "PDF regenerated.",
                    "document_id": document.id,
                    "document_file": self._build_authenticated_pdf_url(request, instance),
                    "pdf_generated_at": instance.pdf_generated_at,
                    "pdf_needs_regeneration": instance.pdf_needs_regeneration,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def email_draft(self, request, pk=None):
        instance = self.get_object()

        try:
            self._ensure_pdf_for_email(instance, request.user)
            draft = build_email_draft_for_instance(
                instance=instance,
                document_type=self.document_type,
                user=request.user,
            )
            if draft.get("attachment_name"):
                draft["attachment_url"] = self._build_authenticated_pdf_url(request, instance)
            return Response(draft, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="send-email")
    def send_email(self, request, pk=None):
        instance = self.get_object()

        to_value = request.data.get("to")
        cc_value = request.data.get("cc", [])
        bcc_value = request.data.get("bcc", [])
        subject = (request.data.get("subject") or "").strip()
        body_html = request.data.get("body_html") or ""
        sending_config_id = request.data.get("sending_config_id")
        include_attachment = request.data.get("include_attachment", True)

        if not to_value:
            return Response({"detail": "Recipient email is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not subject:
            return Response({"detail": "Subject is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not body_html.strip():
            return Response({"detail": "Email body is required."}, status=status.HTTP_400_BAD_REQUEST)

        def normalize_email_list(value):
            if value is None:
                return []
            if isinstance(value, str):
                return [item.strip() for item in value.split(",") if item.strip()]
            if isinstance(value, list):
                return [str(item).strip() for item in value if str(item).strip()]
            return []

        to_emails = normalize_email_list(to_value)
        cc_emails = normalize_email_list(cc_value)
        bcc_emails = normalize_email_list(bcc_value)

        if not to_emails:
            return Response({"detail": "At least one recipient email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve sending config: explicit > org default > app default (None)
        sending_config = None
        if sending_config_id:
            try:
                sending_config = EmailSendingConfig.objects.get(pk=sending_config_id, is_active=True)
            except EmailSendingConfig.DoesNotExist:
                return Response({"detail": "Selected sending configuration was not found or is inactive."}, status=status.HTTP_404_NOT_FOUND)

            user_can_use = (
                sending_config.user_id == request.user.id
                or (
                    sending_config.company_id
                    and CompanyMembership.objects.filter(
                        company_id=sending_config.company_id,
                        user=request.user,
                        is_active=True,
                    ).exists()
                )
            )
            if not user_can_use:
                return Response({"detail": "You do not have permission to use this sending configuration."}, status=status.HTTP_403_FORBIDDEN)
        else:
            # Fall back to the org's default config (marked is_default) or first active one
            company = getattr(instance, "company", None)
            if company:
                sending_config = (
                    EmailSendingConfig.objects.filter(company=company, is_active=True, is_default=True).first()
                    or EmailSendingConfig.objects.filter(company=company, is_active=True).first()
                )
            # sending_config may still be None → Django default email backend will be used

        doc = getattr(instance, "document", None)
        doc_file = doc.file if doc else None

        company = getattr(instance, "company", None)
        if company:
            allowed, message = can_send_email(company)
            if not allowed:
                return Response({"detail": message}, status=status.HTTP_403_FORBIDDEN)

        try:
            if include_attachment:
                doc, _ = self._ensure_pdf_for_email(instance, request.user)
                doc_file = doc.file if doc else None

            email_log = send_document_email(
                instance=instance,
                config=sending_config,
                subject=subject,
                body_html=body_html,
                to=to_emails,
                cc=cc_emails,
                bcc=bcc_emails,
                include_attachment=bool(include_attachment),
                document_file=doc_file,
                document=doc if include_attachment else None,
                sent_by=request.user,
            )
        except Exception as exc:
            return Response({"detail": f"Failed to send email: {exc}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        previous_status = getattr(instance, "status", None)

        # Auto-update document status to "sent" if currently draft
        if hasattr(instance, "status") and instance.status == "draft":
            instance.status = "sent"
            instance.save(update_fields=["status", "updated_at"])

        if isinstance(instance, Invoice):
            instance.sync_status_from_business_rules()
            if previous_status != instance.status:
                log_event(
                    instance,
                    "status_changed",
                    metadata={"from": previous_status, "to": instance.status},
                    user=request.user,
                )

        log_event(
            instance,
            "email_sent",
            metadata={"to": to_emails, "cc": cc_emails, "include_attachment": bool(include_attachment)},
            user=request.user,
        )
        if company:
            increment_emails_sent(company)

        return Response(
            {
                "detail": "Email sent successfully.",
                "used_sending_config_id": sending_config.id if sending_config else None,
                "used_default_config": sending_config is None,
                "include_attachment": bool(include_attachment),
            },
            status=status.HTTP_200_OK,
        )


class DocumentViewSet(OrganizationScopeMixin, BaseModelViewSet):
    http_method_names = ["get", "head", "options"]
    queryset = Document.objects.select_related("template").all().order_by("-created_at")
    serializer_class = DocumentSerializer

    def get_queryset(self):
        queryset = super().get_queryset().filter(
            models.Q(quotation__isnull=False)
            | models.Q(proforma__isnull=False)
            | models.Q(invoice__isnull=False)
            | models.Q(receipt__isnull=False)
            | models.Q(deliverynote__isnull=False)
        )

        company_id = self.request.query_params.get("company")
        if company_id:
            queryset = queryset.filter(
                models.Q(quotation__company__id=company_id)
                | models.Q(proforma__company__id=company_id)
                | models.Q(invoice__company__id=company_id)
                | models.Q(receipt__company__id=company_id)
                | models.Q(deliverynote__company__id=company_id)
            )

        if not self.request.user.is_superuser:
            queryset = queryset.filter(
                models.Q(quotation__company__memberships__user=self.request.user, quotation__company__memberships__is_active=True)
                | models.Q(proforma__company__memberships__user=self.request.user, proforma__company__memberships__is_active=True)
                | models.Q(invoice__company__memberships__user=self.request.user, invoice__company__memberships__is_active=True)
                | models.Q(receipt__company__memberships__user=self.request.user, receipt__company__memberships__is_active=True)
                | models.Q(deliverynote__company__memberships__user=self.request.user, deliverynote__company__memberships__is_active=True)
            )

        return queryset.distinct().order_by("-created_at")


class TemplateViewSet(OrganizationScopeMixin, BaseModelViewSet):
    company_lookup = "company"
    queryset = Template.objects.select_related("company").all().order_by("-created_at")
    serializer_class = TemplateSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = self._scope_queryset(queryset)
        queryset = self._scope_by_company_param(queryset)
        return queryset.distinct()

    def perform_create(self, serializer):
        company = serializer.validated_data.get("company")
        if company:
            self._assert_company_access(company.id)
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        company = serializer.validated_data.get("company", getattr(serializer.instance, "company", None))
        if company:
            self._assert_company_access(company.id)
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=["post"])
    def inspect(self, request, pk=None):
        template = self.get_object()
        result = inspect_template_file(template)
        return Response(result)


class QuotationViewSet(DocumentLifecycleMixin, BaseModelViewSet):
    company_lookup = "company"
    document_type = "quotation"
    document_number_field = "quote_number"
    document_prefix_attr = "quotation_prefix"
    queryset = Quotation.objects.select_related(
        "customer", "company", "document", "selected_template", "created_by", "updated_by"
    ).prefetch_related("lines", "proformas", "invoices").all().order_by("-created_at")
    serializer_class = QuotationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        status_value = self.request.query_params.get("status")
        customer_id = self.request.query_params.get("customer")
        search = (self.request.query_params.get("search") or "").strip()

        if status_value:
            queryset = queryset.filter(status=status_value)

        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)

        if search:
            queryset = queryset.filter(
                models.Q(quote_number__icontains=search)
                | models.Q(name__icontains=search)
                | models.Q(customer__name__icontains=search)
            )

        return queryset.distinct().order_by("-created_at")

    def perform_create(self, serializer):
        company = serializer.validated_data["company"]
        self._assert_company_access(company.id)
        allowed, message = can_create_document(company)
        if not allowed:
            raise ValidationError(message)

        quote_number = _next_document_number(
            company=company,
            field_name="quote_number",
            prefix=company.quotation_prefix or "QUO",
            provided_value=serializer.validated_data.get("quote_number"),
        )

        instance = serializer.save(
            quote_number=quote_number,
            created_by=self.request.user,
            updated_by=self.request.user,
        )
        increment_documents_created(company)

        log_event(
            instance,
            "created",
            metadata={"quote_number": instance.quote_number},
            user=self.request.user,
        )

    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = instance.status
        company = serializer.validated_data.get("company") or instance.company
        self._assert_company_access(company.id)

        if "quote_number" in serializer.validated_data:
            serializer.validated_data["quote_number"] = _next_document_number(
                company=company,
                field_name="quote_number",
                prefix=company.quotation_prefix or "QUO",
                provided_value=serializer.validated_data.get("quote_number"),
            )

        updated = serializer.save(updated_by=self.request.user)

        log_event(
            updated,
            "updated",
            metadata={"fields": list(serializer.validated_data.keys())},
            user=self.request.user,
        )

        if "status" in serializer.validated_data and old_status != updated.status:
            log_event(
                updated,
                "status_changed",
                metadata={"from": old_status, "to": updated.status},
                user=self.request.user,
            )

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated], url_path="activity")
    def activity(self, request, pk=None):
        quotation = self.get_object()

        related_documents = [quotation]
        related_documents.extend(quotation.proformas.select_related("document").all())
        related_documents.extend(quotation.invoices.select_related("document").all())

        events = get_events_for_instances(related_documents)

        payload = [
            {
                "id": event.id,
                "event_type": event.event_type,
                "created_at": event.created_at,
                "created_by": (
                    event.created_by.get_full_name() or event.created_by.email
                    if event.created_by
                    else ""
                ),
                "metadata": event.metadata or {},
            }
            for event in events
        ]

        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="create-proforma")
    def create_proforma(self, request, pk=None):
        quotation = self.get_object()

        existing = quotation.proformas.order_by("created_at").first()
        if existing:
            return Response(
                {
                    "detail": "Proforma already exists for this quotation.",
                    "proforma_id": existing.id,
                    "proforma_number": existing.proforma_number,
                    "existing": True,
                },
                status=status.HTTP_200_OK,
            )

        if not quotation.company_id:
            return Response(
                {"detail": "Quotation must belong to a company."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        allowed, message = can_create_document(quotation.company)
        if not allowed:
            return Response({"detail": message}, status=status.HTTP_403_FORBIDDEN)

        proforma_number = _next_document_number(
            company=quotation.company,
            field_name="proforma_number",
            prefix=quotation.company.proforma_prefix or "PRO",
        )

        with transaction.atomic():
            proforma = Proforma.objects.create(
                quotation=quotation,
                customer=quotation.customer,
                company=quotation.company,
                currency=quotation.currency,
                selected_template=None,
                proforma_number=proforma_number,
                status=Proforma.Status.DRAFT,
                issue_date=quotation.issue_date,
                valid_until=quotation.valid_until,
                tax_mode=quotation.tax_mode,
                tax_label=quotation.tax_label,
                tax_rate=quotation.tax_rate,
                created_by=request.user,
                updated_by=request.user,
            )

            for line in quotation.lines.all():
                ProformaLine.objects.create(
                    proforma=proforma,
                    product=line.product,
                    description=line.description,
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    created_by=request.user,
                    updated_by=request.user,
                )

            proforma.recalculate_totals()
            increment_documents_created(quotation.company)
            log_event(
                proforma,
                "created",
                metadata={"proforma_number": proforma.proforma_number, "created_from": "quotation"},
                user=request.user,
            )

            log_event(
                quotation,
                "converted",
                metadata={
                    "to": "proforma",
                    "proforma_id": proforma.id,
                    "proforma_number": proforma.proforma_number,
                },
                user=request.user,
            )

        return Response(
            {
                "detail": "Proforma created successfully from quotation.",
                "proforma_id": proforma.id,
                "proforma_number": proforma.proforma_number,
                "existing": False,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="create-invoice")
    def create_invoice(self, request, pk=None):
        quotation = self.get_object()

        existing = quotation.invoices.order_by("created_at").first()
        if existing:
            return Response(
                {
                    "detail": "Invoice already exists for this quotation.",
                    "invoice_id": existing.id,
                    "invoice_number": existing.invoice_number,
                    "existing": True,
                },
                status=status.HTTP_200_OK,
            )

        if not quotation.company_id:
            return Response(
                {"detail": "Quotation must belong to a company."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        allowed, message = can_create_document(quotation.company)
        if not allowed:
            return Response({"detail": message}, status=status.HTTP_403_FORBIDDEN)

        invoice_number = _next_document_number(
            company=quotation.company,
            field_name="invoice_number",
            prefix=quotation.company.invoice_prefix or "INV",
        )
        # print(f"Next invoice number for company {quotation.company_id} is {invoice_number}")
        
        # return Response({"detail": f"Debug: Invoice number generation works. Next number is {invoice_number}"}, status=status.HTTP_200_OK)
        with transaction.atomic():
            invoice = Invoice.objects.create(
                quotation=quotation,
                customer=quotation.customer,
                company=quotation.company,
                currency=quotation.currency,
                selected_template=None,
                invoice_number=invoice_number,
                status=Invoice.Status.DRAFT,
                issue_date=quotation.issue_date,
                valid_until=quotation.valid_until,
                tax_mode=quotation.tax_mode,
                tax_label=quotation.tax_label,
                tax_rate=quotation.tax_rate,
                created_by=request.user,
                updated_by=request.user,
            )

            for line in quotation.lines.all():
                InvoiceLine.objects.create(
                    invoice=invoice,
                    product=line.product,
                    description=line.description,
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    created_by=request.user,
                    updated_by=request.user,
                )

            invoice.recalculate_totals()
            increment_documents_created(quotation.company)
            log_event(
                invoice,
                "created",
                metadata={"invoice_number": invoice.invoice_number, "created_from": "quotation"},
                user=request.user,
            )

            log_event(
                quotation,
                "converted",
                metadata={
                    "to": "invoice",
                    "invoice_id": invoice.id,
                    "invoice_number": invoice.invoice_number,
                },
                user=request.user,
            )

        return Response(
            {
                "detail": "Invoice created successfully from quotation.",
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "existing": False,
            },
            status=status.HTTP_201_CREATED,
        )


class QuotationLineViewSet(OrganizationScopedLineItemMixin, BaseModelViewSet):
    company_lookup = "quotation__company"
    parent_field_name = "quotation"
    queryset = QuotationLine.objects.select_related(
        "quotation", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = QuotationLineSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = self._scope_queryset(queryset)
        queryset = self._scope_by_company_param(queryset)
        return queryset.distinct().order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        self._validate_line_item_scope(serializer)
        obj = serializer.save(created_by=user, updated_by=user)
        obj.quotation.recalculate_totals()
        log_event(obj.quotation, "updated", metadata={"action": "line_created"}, user=user)

    def perform_update(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        self._validate_line_item_scope(serializer)
        obj = serializer.save(updated_by=user)
        obj.quotation.recalculate_totals()
        log_event(obj.quotation, "updated", metadata={"action": "line_updated"}, user=user)

    def perform_destroy(self, instance):
        quotation = instance.quotation
        user = self.request.user if self.request.user.is_authenticated else None
        instance.delete()
        quotation.recalculate_totals()
        log_event(quotation, "updated", metadata={"action": "line_deleted"}, user=user)


class ProformaViewSet(DocumentLifecycleMixin, BaseModelViewSet):
    document_type = "proforma"
    document_number_field = "proforma_number"
    document_prefix_attr = "proforma_prefix"
    queryset = Proforma.objects.select_related(
        "quotation", "customer", "company", "document", "selected_template", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = ProformaSerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="create-invoice")
    def create_invoice(self, request, pk=None):
        proforma = self.get_object()

        existing = Invoice.objects.filter(proforma=proforma).order_by("created_at").first()
        if existing:
            return Response(
                {
                    "detail": "Invoice already exists for this proforma.",
                    "invoice_id": existing.id,
                    "invoice_number": existing.invoice_number,
                    "existing": True,
                },
                status=status.HTTP_200_OK,
            )

        if not proforma.company_id:
            return Response(
                {"detail": "Proforma must belong to a company."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        allowed, message = can_create_document(proforma.company)
        if not allowed:
            return Response({"detail": message}, status=status.HTTP_403_FORBIDDEN)

        invoice_number = _next_document_number(
            company=proforma.company,
            field_name="invoice_number",
            prefix=proforma.company.invoice_prefix or "INV",
        )

        with transaction.atomic():
            invoice = Invoice.objects.create(
                proforma=proforma,
                customer=proforma.customer,
                company=proforma.company,
                currency=proforma.currency,
                selected_template=None,
                invoice_number=invoice_number,
                status=Invoice.Status.DRAFT,
                issue_date=proforma.issue_date,
                valid_until=proforma.valid_until,
                tax_mode=proforma.tax_mode,
                tax_label=proforma.tax_label,
                tax_rate=proforma.tax_rate,
                created_by=request.user,
                updated_by=request.user,
            )

            for line in proforma.lines.all():
                InvoiceLine.objects.create(
                    invoice=invoice,
                    product=line.product,
                    description=line.description,
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    created_by=request.user,
                    updated_by=request.user,
                )

            invoice.recalculate_totals()
            increment_documents_created(proforma.company)
            log_event(
                invoice,
                "created",
                metadata={"invoice_number": invoice.invoice_number, "created_from": "proforma"},
                user=request.user,
            )

            log_event(
                proforma,
                "converted",
                metadata={
                    "to": "invoice",
                    "invoice_id": invoice.id,
                    "invoice_number": invoice.invoice_number,
                },
                user=request.user,
            )

        return Response(
            {
                "detail": "Invoice created successfully from proforma.",
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "existing": False,
            },
            status=status.HTTP_201_CREATED,
        )


class ProformaLineViewSet(OrganizationScopedLineItemMixin, BaseModelViewSet):
    company_lookup = "proforma__company"
    parent_field_name = "proforma"
    queryset = ProformaLine.objects.select_related(
        "proforma", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = ProformaLineSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = self._scope_queryset(queryset)
        queryset = self._scope_by_company_param(queryset)
        return queryset.distinct().order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        self._validate_line_item_scope(serializer)
        obj = serializer.save(created_by=user, updated_by=user)
        obj.proforma.recalculate_totals()

    def perform_update(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        self._validate_line_item_scope(serializer)
        obj = serializer.save(updated_by=user)
        obj.proforma.recalculate_totals()

    def perform_destroy(self, instance):
        proforma = instance.proforma
        instance.delete()
        proforma.recalculate_totals()


class InvoiceViewSet(DocumentLifecycleMixin, BaseModelViewSet):
    document_type = "invoice"
    document_number_field = "invoice_number"
    document_prefix_attr = "invoice_prefix"
    queryset = Invoice.objects.select_related(
        "proforma", "quotation", "customer", "company", "document", "selected_template", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        for invoice in queryset:
            invoice.sync_status_from_business_rules()
        return queryset

    def perform_update(self, serializer):
        super().perform_update(serializer)
        post_update_status = serializer.instance.status
        serializer.instance.sync_status_from_business_rules()
        if post_update_status != serializer.instance.status:
            log_event(
                serializer.instance,
                "status_changed",
                metadata={"from": post_update_status, "to": serializer.instance.status},
                user=self.request.user,
            )


class InvoiceLineViewSet(OrganizationScopedLineItemMixin, BaseModelViewSet):
    company_lookup = "invoice__company"
    parent_field_name = "invoice"
    queryset = InvoiceLine.objects.select_related(
        "invoice", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = InvoiceLineSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = self._scope_queryset(queryset)
        queryset = self._scope_by_company_param(queryset)
        return queryset.distinct().order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        self._validate_line_item_scope(serializer)
        obj = serializer.save(created_by=user, updated_by=user)
        obj.invoice.recalculate_totals()

    def perform_update(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        self._validate_line_item_scope(serializer)
        obj = serializer.save(updated_by=user)
        obj.invoice.recalculate_totals()

    def perform_destroy(self, instance):
        invoice = instance.invoice
        instance.delete()
        invoice.recalculate_totals()


class ReceiptViewSet(DocumentLifecycleMixin, BaseModelViewSet):
    document_type = "receipt"
    document_number_field = "receipt_number"
    document_prefix_attr = "receipt_prefix"
    queryset = Receipt.objects.select_related(
        "invoice", "company", "document", "selected_template", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = ReceiptSerializer

    def perform_create(self, serializer):
        invoice = serializer.validated_data.get("invoice")
        previous_status = invoice.status if invoice else None
        super().perform_create(serializer)
        serializer.instance.invoice.sync_status_from_business_rules()
        if invoice and previous_status != invoice.status:
            log_event(
                invoice,
                "status_changed",
                metadata={"from": previous_status, "to": invoice.status},
                user=self.request.user,
            )

    def perform_update(self, serializer):
        invoice = serializer.instance.invoice
        previous_status = invoice.status if invoice else None
        super().perform_update(serializer)
        serializer.instance.invoice.sync_status_from_business_rules()
        if invoice and previous_status != invoice.status:
            log_event(
                invoice,
                "status_changed",
                metadata={"from": previous_status, "to": invoice.status},
                user=self.request.user,
            )

    def perform_destroy(self, instance):
        invoice = instance.invoice
        previous_status = invoice.status if invoice else None
        instance.delete()
        invoice.sync_status_from_business_rules()
        if invoice and previous_status != invoice.status:
            log_event(
                invoice,
                "status_changed",
                metadata={"from": previous_status, "to": invoice.status},
                user=self.request.user,
            )


class DeliveryNoteViewSet(DocumentLifecycleMixin, BaseModelViewSet):
    document_type = "delivery_note"
    document_number_field = "delivery_note_number"
    document_prefix_attr = "delivery_note_prefix"
    queryset = DeliveryNote.objects.select_related(
        "invoice", "company", "document", "selected_template", "created_by", "updated_by"
    ).prefetch_related("lines").all().order_by("-created_at")
    serializer_class = DeliveryNoteSerializer


class DeliveryNoteLineViewSet(OrganizationScopedLineItemMixin, BaseModelViewSet):
    company_lookup = "delivery_note__company"
    parent_field_name = "delivery_note"
    queryset = DeliveryNoteLine.objects.select_related(
        "delivery_note", "product", "created_by", "updated_by"
    ).all().order_by("-created_at")
    serializer_class = DeliveryNoteLineSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = self._scope_queryset(queryset)
        queryset = self._scope_by_company_param(queryset)
        return queryset.distinct().order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        self._validate_line_item_scope(serializer)
        serializer.save(created_by=user, updated_by=user)

    def perform_update(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        self._validate_line_item_scope(serializer)
        serializer.save(updated_by=user)


class CompanyViewSet(BaseModelViewSet):
    serializer_class = CompanySerializer
    queryset = Company.objects.none()

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Company.objects.all().order_by("-created_at")

        return Company.objects.filter(
            memberships__user=user,
            memberships__is_active=True,
        ).distinct().order_by("-created_at")

    def perform_create(self, serializer):
        with transaction.atomic():
            company = serializer.save(
                created_by=self.request.user,
                updated_by=self.request.user,
            )

            CompanyMembership.objects.get_or_create(
                company=company,
                user=self.request.user,
                defaults={
                    "role": CompanyMembership.Role.OWNER,
                    "is_active": True,
                    "display_name": self.request.user.get_full_name() or self.request.user.username,
                    "work_email": self.request.user.email or "",
                    "created_by": self.request.user,
                    "updated_by": self.request.user,
                },
            )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def _user_can_manage_company_members(self, user, company):
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return CompanyMembership.objects.filter(
            company=company,
            user=user,
            is_active=True,
            role__in=[CompanyMembership.Role.OWNER, CompanyMembership.Role.ADMIN],
        ).exists()

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def members(self, request, pk=None):
        company = self.get_object()
        memberships = company.memberships.select_related("user").all().order_by("display_name", "user__email")
        serializer = CompanyMembershipSerializer(memberships, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def add_user_by_email(self, request, pk=None):
        company = self.get_object()

        if not self._user_can_manage_company_members(request.user, company):
            return Response(
                {"detail": "You do not have permission to manage company members."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AddCompanyUserByEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()
        display_name = serializer.validated_data.get("display_name", "").strip()
        job_title = serializer.validated_data.get("job_title", "").strip()
        department = serializer.validated_data.get("department", "").strip()
        work_email = serializer.validated_data.get("work_email", "").strip() or email
        work_phone = serializer.validated_data.get("work_phone", "").strip()
        role = serializer.validated_data.get("role", CompanyMembership.Role.STAFF)

        with transaction.atomic():
            user = User.objects.filter(email__iexact=email).first()
            user_created = False

            if not user:
                base_username = email.split("@")[0]
                username = base_username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1

                first_name = ""
                last_name = ""
                if display_name:
                    name_parts = display_name.split()
                    first_name = name_parts[0]
                    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                )
                user.set_unusable_password()
                user.save()
                user_created = True

            membership, membership_created = CompanyMembership.objects.get_or_create(
                company=company,
                user=user,
                defaults={
                    "display_name": display_name or user.get_full_name() or user.email,
                    "job_title": job_title,
                    "department": department,
                    "work_email": work_email,
                    "work_phone": work_phone,
                    "role": role,
                    "is_active": True,
                    "created_by": request.user,
                    "updated_by": request.user,
                },
            )

            if not membership_created:
                membership.display_name = display_name or membership.display_name
                membership.job_title = job_title or membership.job_title
                membership.department = department or membership.department
                membership.work_email = work_email or membership.work_email
                membership.work_phone = work_phone or membership.work_phone
                membership.role = role
                membership.is_active = True
                membership.updated_by = request.user
                membership.save(
                    update_fields=[
                        "display_name",
                        "job_title",
                        "department",
                        "work_email",
                        "work_phone",
                        "role",
                        "is_active",
                        "updated_by",
                        "updated_at",
                    ]
                )

        return Response(
            {
                "detail": "User added to company successfully.",
                "user_created": user_created,
                "membership_created": membership_created,
                "membership": CompanyMembershipSerializer(
                    membership,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_201_CREATED if membership_created else status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["put", "patch"],
        url_path=r"members/(?P<membership_id>[^/.]+)",
        permission_classes=[IsAuthenticated],
    )
    def update_member(self, request, pk=None, membership_id=None):
        partial = request.method.lower() == "patch"

        company = self.get_object()

        if not self._user_can_manage_company_members(request.user, company):
            return Response(
                {"detail": "You do not have permission to manage company members."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            membership = company.memberships.select_related("user").get(pk=membership_id)
        except CompanyMembership.DoesNotExist:
            return Response(
                {"detail": "Membership not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CompanyMembershipSerializer(
            membership,
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        membership = serializer.save(updated_by=request.user)

        return Response(
            CompanyMembershipSerializer(membership, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["delete"], url_path=r"members/(?P<membership_id>[^/.]+)", permission_classes=[IsAuthenticated])
    def remove_member(self, request, pk=None, membership_id=None):
        company = self.get_object()

        if not self._user_can_manage_company_members(request.user, company):
            return Response(
                {"detail": "You do not have permission to manage company members."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            membership = company.memberships.get(pk=membership_id)
        except CompanyMembership.DoesNotExist:
            return Response({"detail": "Membership not found."}, status=status.HTTP_404_NOT_FOUND)

        if membership.role == CompanyMembership.Role.OWNER:
            owner_count = company.memberships.filter(
                role=CompanyMembership.Role.OWNER,
                is_active=True,
            ).count()
            if owner_count <= 1:
                return Response(
                    {"detail": "You cannot remove the last active owner."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path=r"members/(?P<membership_id>[^/.]+)/deactivate", permission_classes=[IsAuthenticated])
    def deactivate_member(self, request, pk=None, membership_id=None):
        company = self.get_object()

        if not self._user_can_manage_company_members(request.user, company):
            return Response(
                {"detail": "You do not have permission to manage company members."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            membership = company.memberships.get(pk=membership_id)
        except CompanyMembership.DoesNotExist:
            return Response({"detail": "Membership not found."}, status=status.HTTP_404_NOT_FOUND)

        if membership.role == CompanyMembership.Role.OWNER:
            owner_count = company.memberships.filter(
                role=CompanyMembership.Role.OWNER,
                is_active=True,
            ).count()
            if owner_count <= 1:
                return Response(
                    {"detail": "You cannot deactivate the last active owner."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        membership.is_active = False
        membership.updated_by = request.user
        membership.save(update_fields=["is_active", "updated_by", "updated_at"])

        return Response({"detail": "Member deactivated successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated], url_path="dashboard")
    def dashboard(self, request, pk=None):
        company = self.get_object()
        payload = _build_company_dashboard_context(company)

        data = {
            "company": payload["company"],
            "is_new_workspace": payload["is_new_workspace"],
            "metrics": payload["workspace_metrics"],
            "setup": payload["setup"],
            "usage": payload["usage"],
            "plan_limits": payload["plan_limits"],
            "subscription": payload["subscription"],
            "attention": payload["attention"],
            "activity": payload["activity"],
            "recent_quotations": payload["recent_quotations"],
        }

        serializer = WorkspaceDashboardSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated], url_path="sales-dashboard")
    def sales_dashboard(self, request, pk=None):
        company = self.get_object()
        payload = _build_company_dashboard_context(company)

        data = {
            "company": payload["company"],
            "metrics": payload["sales_metrics"],
            "status_breakdown": payload["status_breakdown"],
            "money": payload["money"],
            "recent_quotations": payload["recent_quotations"],
            "attention": payload["attention"],
        }

        serializer = SalesDashboardSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)
