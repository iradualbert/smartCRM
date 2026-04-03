import os

from django.contrib.auth.models import User
from django.http import FileResponse, Http404
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

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

    @action(detail=True, methods=["patch"], url_path=r"members/(?P<membership_id>[^/.]+)", permission_classes=[IsAuthenticated])
    def update_member(self, request, pk=None, membership_id=None):
        company = self.get_object()

        if not self._user_can_manage_company_members(request.user, company):
            return Response(
                {"detail": "You do not have permission to manage company members."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            membership = company.memberships.select_related("user").get(pk=membership_id)
        except CompanyMembership.DoesNotExist:
            return Response({"detail": "Membership not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CompanyMembershipSerializer(
            membership,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)

        return Response(serializer.data, status=status.HTTP_200_OK)

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

        membership.is_active = False
        membership.updated_by = request.user
        membership.save(update_fields=["is_active", "updated_by", "updated_at"])

        return Response({"detail": "Member deactivated successfully."}, status=status.HTTP_200_OK)


class DocumentViewSet(BaseModelViewSet):
    queryset = Document.objects.select_related("template").all().order_by("-created_at")
    serializer_class = DocumentSerializer


class TemplateViewSet(BaseModelViewSet):
    queryset =  Template.objects.select_related("company").all().order_by("-created_at")
    serializer_class = TemplateSerializer

    @action(detail=True, methods=["post"])
    def inspect(self, request, pk=None):
        template = self.get_object()
        result = inspect_template_file(template)
        return Response(result)
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