from django.db import models
from django.utils import timezone
from pathlib import Path

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response



from .models import CompanyMembership
from .models_email import DocumentEmail, EmailSendingConfig
from .serializers_email import DocumentEmailSerializer
from .serializers import EmailSendingConfigSerializer
from .services.email_smtp import send_logged_email_with_config, test_smtp_config


class EmailSendingConfigViewSet(viewsets.ModelViewSet):
    serializer_class = EmailSendingConfigSerializer
    permission_classes = [IsAuthenticated]
    queryset = EmailSendingConfig.objects.none()

    def get_queryset(self):
        user = self.request.user
        queryset = EmailSendingConfig.objects.filter(
            models.Q(user=user)
            | models.Q(company__memberships__user=user, company__memberships__is_active=True)
            | models.Q(company__created_by=user)
        ).distinct()

        company_id = self.request.query_params.get("company")
        owner_type = self.request.query_params.get("owner_type")
        active = self.request.query_params.get("is_active")

        if company_id:
            queryset = queryset.filter(company_id=company_id)

        if owner_type:
            queryset = queryset.filter(owner_type=owner_type)

        if active is not None:
            normalized = str(active).strip().lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_active=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_active=False)

        return queryset.order_by("owner_type", "name", "from_email")

    def _can_manage_company_config(self, user, company):
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

    def perform_create(self, serializer):
        owner_type = serializer.validated_data.get("owner_type")
        company = serializer.validated_data.get("company")
        user = serializer.validated_data.get("user")

        if owner_type == EmailSendingConfig.OwnerType.USER:
            if user and user != self.request.user and not self.request.user.is_superuser:
                raise PermissionError("You cannot create a personal sending config for another user.")

            serializer.save(
                user=self.request.user,
                created_by=self.request.user,
                updated_by=self.request.user,
            )
            return

        if owner_type == EmailSendingConfig.OwnerType.COMPANY:
            if not company:
                raise PermissionError("Company is required for company-owned configs.")

            if not self._can_manage_company_config(self.request.user, company):
                raise PermissionError("You do not have permission to manage this company's sending configs.")

            serializer.save(
                created_by=self.request.user,
                updated_by=self.request.user,
            )
            return

        raise PermissionError("Invalid owner_type.")

    def perform_update(self, serializer):
        instance = self.get_object()

        if instance.owner_type == EmailSendingConfig.OwnerType.USER:
            if instance.user != self.request.user and not self.request.user.is_superuser:
                raise PermissionError("You do not have permission to update this personal sending config.")
        elif instance.owner_type == EmailSendingConfig.OwnerType.COMPANY:
            if not self._can_manage_company_config(self.request.user, instance.company):
                raise PermissionError("You do not have permission to update this company sending config.")

        serializer.save(updated_by=self.request.user)

    def perform_destroy(self, instance):
        if instance.owner_type == EmailSendingConfig.OwnerType.USER:
            if instance.user != self.request.user and not self.request.user.is_superuser:
                raise PermissionError("You do not have permission to delete this personal sending config.")
        elif instance.owner_type == EmailSendingConfig.OwnerType.COMPANY:
            if not self._can_manage_company_config(self.request.user, instance.company):
                raise PermissionError("You do not have permission to delete this company sending config.")

        instance.delete()

    @action(detail=True, methods=["post"])
    def test_connection(self, request, pk=None):
        config = self.get_object()

        try:
            test_smtp_config(config)
            config.last_tested_at = timezone.now()
            config.last_test_status = "success"
            config.last_test_error = ""
            config.updated_by = request.user
            config.save(
                update_fields=[
                    "last_tested_at",
                    "last_test_status",
                    "last_test_error",
                    "updated_by",
                    "updated_at",
                ]
            )
            return Response({"detail": "SMTP connection successful."}, status=status.HTTP_200_OK)
        except Exception as exc:
            config.last_tested_at = timezone.now()
            config.last_test_status = "failed"
            config.last_test_error = str(exc)
            config.updated_by = request.user
            config.save(
                update_fields=[
                    "last_tested_at",
                    "last_test_status",
                    "last_test_error",
                    "updated_by",
                    "updated_at",
                ]
            )
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class DocumentEmailViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DocumentEmailSerializer
    permission_classes = [IsAuthenticated]
    queryset = DocumentEmail.objects.none()

    def get_queryset(self):
        user = self.request.user

        queryset = (
            DocumentEmail.objects.filter(
                models.Q(sent_by=user)
                | models.Q(company__memberships__user=user, company__memberships__is_active=True)
                | models.Q(company__created_by=user)
            )
            .select_related(
                "company",
                "sending_config",
                "sent_by",
                "attachment_document",
                "source_content_type",
            )
            .distinct()
        )

        company_id = self.request.query_params.get("company")
        status_value = self.request.query_params.get("status")
        source_model = self.request.query_params.get("source_model")
        sending_config_id = self.request.query_params.get("sending_config")

        if company_id:
            queryset = queryset.filter(company_id=company_id)

        if status_value:
            queryset = queryset.filter(status=status_value)

        if source_model:
            queryset = queryset.filter(source_model=source_model)

        if sending_config_id:
            queryset = queryset.filter(sending_config_id=sending_config_id)

        return queryset.order_by("-queued_at", "-created_at")

    def _can_manage_company_email(self, user, company):
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return CompanyMembership.objects.filter(
            company=company,
            user=user,
            is_active=True,
        ).exists()

    @action(detail=True, methods=["post"])
    def retry(self, request, pk=None):
        email_log = self.get_object()

        if not self._can_manage_company_email(request.user, email_log.company):
            return Response(
                {"detail": "You do not have permission to retry this email."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if email_log.status == DocumentEmail.Status.SENT:
            return Response(
                {"detail": "This email has already been sent."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attachments = []
        if email_log.include_attachment and email_log.attachment_document and getattr(email_log.attachment_document, "file", None):
            file_field = email_log.attachment_document.file
            if getattr(file_field, "path", None):
                attachments.append(Path(file_field.path))

        try:
            email_log.failed_at = None
            email_log.failure_reason = ""
            email_log.status = DocumentEmail.Status.PENDING
            email_log.updated_by = request.user
            email_log.save(
                update_fields=[
                    "failed_at",
                    "failure_reason",
                    "status",
                    "updated_by",
                    "updated_at",
                ]
            )

            send_logged_email_with_config(
                email_log=email_log,
                attachments=attachments,
            )

            serializer = self.get_serializer(email_log)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as exc:
            serializer = self.get_serializer(email_log)
            return Response(
                {
                    "detail": str(exc),
                    "email": serializer.data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )