from django.contrib import admin, messages
from django.utils.html import format_html
from django.utils.text import Truncator

from .services.email_smtp import send_logged_email

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
from .services.document_generation import generate_document_for_instance
from .models_email import EmailSendingConfig, DocumentEmail


class QuotationLineInline(admin.TabularInline):
    model = QuotationLine
    extra = 1


class ProformaLineInline(admin.TabularInline):
    model = ProformaLine
    extra = 1


class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 1


class DeliveryNoteLineInline(admin.TabularInline):
    model = DeliveryNoteLine
    extra = 1


class CompanyMembershipInline(admin.TabularInline):
    model = CompanyMembership
    extra = 0
    autocomplete_fields = ("user",)
    fields = (
        "user",
        "display_name",
        "job_title",
        "department",
        "work_email",
        "work_phone",
        "role",
        "is_active",
    )


class PDFAdminMixin:
    actions = ["generate_pdf_action", "regenerate_pdf_action"]
    document_type = None

    @admin.action(description="Generate PDF for selected items")
    def generate_pdf_action(self, request, queryset):
        success_count = 0
        failed = []

        for obj in queryset:
            try:
                _, generated = generate_document_for_instance(
                    instance=obj,
                    document_type=self.document_type,
                    user=request.user,
                    force=False,
                )
                if generated:
                    success_count += 1
                else:
                    success_count += 1
            except Exception as exc:
                failed.append(f"{obj}: {exc}")

        if success_count:
            self.message_user(
                request,
                f"Processed {success_count} item(s). Existing PDFs were reused where available.",
                level=messages.SUCCESS,
            )

        for error in failed[:10]:
            self.message_user(request, error, level=messages.ERROR)

    @admin.action(description="Regenerate PDF for selected items")
    def regenerate_pdf_action(self, request, queryset):
        success_count = 0
        failed = []

        for obj in queryset:
            try:
                generate_document_for_instance(
                    instance=obj,
                    document_type=self.document_type,
                    user=request.user,
                    force=True,
                )
                success_count += 1
            except Exception as exc:
                failed.append(f"{obj}: {exc}")

        if success_count:
            self.message_user(
                request,
                f"Regenerated PDF for {success_count} item(s).",
                level=messages.SUCCESS,
            )

        for error in failed[:10]:
            self.message_user(request, error, level=messages.ERROR)

    def pdf_link(self, obj):
        if obj.document and obj.document.file:
            try:
                return format_html('<a href="{}" target="_blank">Open PDF</a>', obj.document.file.url)
            except Exception:
                return "PDF saved"
        return "No PDF"

    pdf_link.short_description = "PDF"


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "default_currency", "is_active", "created_at", "created_by")
    search_fields = ("name", "legal_name", "email", "tax_number")
    list_filter = ("default_currency", "is_active")
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")
    inlines = [CompanyMembershipInline]


@admin.register(CompanyMembership)
class CompanyMembershipAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company",
        "user",
        "display_name",
        "job_title",
        "role",
        "is_active",
        "created_at",
    )
    search_fields = (
        "company__name",
        "user__email",
        "user__username",
        "display_name",
        "job_title",
        "department",
        "work_email",
        "work_phone",
    )
    list_filter = ("role", "is_active", "company")
    autocomplete_fields = ("company", "user")
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "template", "is_current", "generated_at", "created_by")
    search_fields = ("name", "description")
    list_filter = ("template", "is_current")
    autocomplete_fields = ("template",)
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by", "generated_at")


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = (
        "id", "name", "document_type", "company", "is_default", "is_active", "created_at", "created_by"
    )
    search_fields = ("name", "description", "company__name")
    list_filter = ("document_type", "is_default", "is_active", "company")
    autocomplete_fields = ("company",)
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "company", "email", "phone_number", "created_at")
    search_fields = ("name", "email", "phone_number", "company__name")
    list_filter = ("company",)
    autocomplete_fields = ("company",)
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "company", "sku", "default_price", "created_at")
    search_fields = ("name", "sku", "description", "company__name")
    list_filter = ("company",)
    autocomplete_fields = ("company",)
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")


@admin.register(Quotation)
class QuotationAdmin(PDFAdminMixin, admin.ModelAdmin):
    document_type = "quotation"
    list_display = (
        "id", "quote_number", "status", "name", "company", "customer", "currency",
        "selected_template", "subtotal", "total", "pdf_needs_regeneration", "pdf_link", "created_at"
    )
    search_fields = ("quote_number", "name", "customer__name", "company__name")
    list_filter = ("status", "company", "currency", "pdf_needs_regeneration")
    autocomplete_fields = ("company", "customer", "document", "selected_template")
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by", "pdf_generated_at", "pdf_link")
    inlines = [QuotationLineInline]


@admin.register(Proforma)
class ProformaAdmin(PDFAdminMixin, admin.ModelAdmin):
    document_type = "proforma"
    list_display = (
        "id", "proforma_number", "status", "company", "customer", "currency",
        "selected_template", "subtotal", "total", "pdf_needs_regeneration", "pdf_link", "created_at"
    )
    search_fields = ("proforma_number", "customer__name", "company__name")
    list_filter = ("status", "company", "currency", "pdf_needs_regeneration")
    autocomplete_fields = ("company", "quotation", "customer", "document", "selected_template")
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by", "pdf_generated_at", "pdf_link")
    inlines = [ProformaLineInline]


@admin.register(Invoice)
class InvoiceAdmin(PDFAdminMixin, admin.ModelAdmin):
    document_type = "invoice"
    list_display = (
        "id", "invoice_number", "status", "company", "proforma", "currency",
        "selected_template", "subtotal", "total", "pdf_needs_regeneration", "pdf_link", "created_at"
    )
    search_fields = ("invoice_number", "proforma__proforma_number", "proforma__customer__name", "company__name")
    list_filter = ("status", "company", "currency", "pdf_needs_regeneration")
    autocomplete_fields = ("company", "proforma", "document", "selected_template")
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by", "pdf_generated_at", "pdf_link")
    inlines = [InvoiceLineInline]


@admin.register(Receipt)
class ReceiptAdmin(PDFAdminMixin, admin.ModelAdmin):
    document_type = "receipt"
    list_display = (
        "id", "receipt_number", "status", "company", "invoice", "currency",
        "selected_template", "amount_paid", "pdf_needs_regeneration", "pdf_link", "created_at"
    )
    search_fields = ("receipt_number", "invoice__invoice_number", "company__name")
    list_filter = ("status", "company", "currency", "pdf_needs_regeneration")
    autocomplete_fields = ("company", "invoice", "document", "selected_template")
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by", "pdf_generated_at", "pdf_link")


@admin.register(DeliveryNote)
class DeliveryNoteAdmin(PDFAdminMixin, admin.ModelAdmin):
    document_type = "delivery_note"
    list_display = (
        "id", "delivery_note_number", "status", "company", "invoice", "currency",
        "selected_template", "delivery_date", "pdf_needs_regeneration", "pdf_link", "created_at"
    )
    search_fields = ("delivery_note_number", "invoice__invoice_number", "company__name")
    list_filter = ("status", "company", "currency", "pdf_needs_regeneration")
    autocomplete_fields = ("company", "invoice", "document", "selected_template")
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by", "pdf_generated_at", "pdf_link")
    inlines = [DeliveryNoteLineInline]
    
    



@admin.register(DocumentEmail)
class DocumentEmailAdmin(admin.ModelAdmin):
    
    list_display = (
        "id",
        # "customer",
        "company",
        "source_model",
        "source_identifier",
        "short_subject",
        "recipient_preview",
        "status_badge",
        "sent_at",
        "failed_at",
        "retry_count",
    )

    list_filter = (
        "status",
        "source_model",
        "company",
        "sending_config",
        "include_attachment",
        "created_at",
        "sent_at",
    )

    search_fields = (
        "subject",
        "to_emails",
        "source_identifier",
        "failure_reason",
    )

    readonly_fields = (
        "id",
        # "company",
    "sending_config",
        "source_model",
        "source_identifier",
        "from_email",
        "from_name",
        "to_emails",
        "cc_emails",
        "bcc_emails",
        "subject",
        "body_html",
        "body_text",
        "status",
        "failure_reason",
        "retry_count",
        "sent_at",
        "failed_at",
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)

    actions = ["retry_failed_emails"]

    # -------------------
    # Display helpers
    # -------------------

    def short_subject(self, obj):
        return Truncator(obj.subject).chars(50)

    short_subject.short_description = "Subject"

    def recipient_preview(self, obj):
        if obj.to_emails:
            return ", ".join(obj.to_emails[:2])
        return "—"

    recipient_preview.short_description = "To"

    def status_badge(self, obj):
        colors = {
            "pending": "#f59e0b",   # amber
            "sent": "#10b981",      # green
            "failed": "#ef4444",    # red
            "cancelled": "#6b7280", # gray
        }

        color = colors.get(obj.status, "#6b7280")

        return format_html(
            '<span style="padding:2px 8px;border-radius:12px;background:{}20;color:{};font-weight:500;">{}</span>',
            color,
            color,
            obj.status,
        )

    status_badge.short_description = "Status"

    # -------------------
    # Actions
    # -------------------

    def retry_failed_emails(self, request, queryset):
        success = 0
        failed = 0

        for email in queryset.filter(status="failed"):
            try:
                send_logged_email(
                    email_log=email,
                    config=email.sending_config,
                )
                success += 1
            except Exception as e:
                failed += 1

        if success:
            self.message_user(
                request,
                f"{success} email(s) retried successfully.",
                level=messages.SUCCESS,
            )

        if failed:
            self.message_user(
                request,
                f"{failed} email(s) failed again.",
                level=messages.ERROR,
            )

    retry_failed_emails.short_description = "Retry failed emails"

@admin.register(EmailSendingConfig)
class EmailSendingConfigAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "from_email",
        "owner_type",
        "company",
        "user",
        "security_type",
        "is_active",
        "is_default",
        "last_test_status",
        "last_tested_at",
        "created_at",
    )
    search_fields = (
        "name",
        "from_email",
        "smtp_username",
        "company__name",
        "user__username",
        "user__email",
    )
    list_filter = (
        "owner_type",
        "security_type",
        "is_active",
        "is_default",
        "company",
    )
    autocomplete_fields = ("company", "user", "created_by", "updated_by")
    readonly_fields = (
        "smtp_password_preview",
        "last_tested_at",
        "last_test_status",
        "last_test_error",
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
    )
    fieldsets = (
        ("Ownership", {
            "fields": ("owner_type", "company", "user")
        }),
        ("Sender", {
            "fields": ("name", "from_name", "from_email")
        }),
        ("SMTP", {
            "fields": (
                "smtp_host",
                "smtp_port",
                "smtp_username",
                "smtp_password_encrypted",
                "smtp_password_preview",
                "security_type",
            )
        }),
        ("Status", {
            "fields": ("is_active", "is_default")
        }),
        ("Testing", {
            "fields": ("last_tested_at", "last_test_status", "last_test_error")
        }),
        ("Audit", {
            "fields": ("created_at", "updated_at", "created_by", "updated_by")
        }),
    )

    def smtp_password_preview(self, obj):
        return "••••••••" if obj.smtp_password_encrypted else "Not set"

    smtp_password_preview.short_description = "Stored password"