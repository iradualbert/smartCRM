from django.contrib import admin

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


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "file", "created_at", "created_by")
    search_fields = ("name", "description")


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "file", "created_at", "created_by")
    search_fields = ("name", "description")


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "phone_number", "created_at")
    search_fields = ("name", "email", "phone_number")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "sku", "default_price", "created_at")
    search_fields = ("name", "sku", "description")


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ("id", "quote_number", "status", "name", "customer", "subtotal", "total", "created_at")
    search_fields = ("quote_number", "name", "customer__name")
    list_filter = ("status",)
    autocomplete_fields = ("customer", "document")
    inlines = [QuotationLineInline]


@admin.register(Proforma)
class ProformaAdmin(admin.ModelAdmin):
    list_display = ("id", "proforma_number", "status", "customer", "subtotal", "total", "created_at")
    search_fields = ("proforma_number", "customer__name")
    list_filter = ("status",)
    autocomplete_fields = ("quotation", "customer", "document")
    inlines = [ProformaLineInline]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "invoice_number", "status", "proforma", "subtotal", "total", "created_at")
    search_fields = ("invoice_number", "proforma__proforma_number", "proforma__customer__name")
    list_filter = ("status",)
    autocomplete_fields = ("proforma", "document")
    inlines = [InvoiceLineInline]


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ("id", "receipt_number", "status", "invoice", "amount_paid", "created_at")
    search_fields = ("receipt_number", "invoice__invoice_number")
    list_filter = ("status",)
    autocomplete_fields = ("invoice", "document")


@admin.register(DeliveryNote)
class DeliveryNoteAdmin(admin.ModelAdmin):
    list_display = ("id", "delivery_note_number", "status", "invoice", "delivery_date", "created_at")
    search_fields = ("delivery_note_number", "invoice__invoice_number")
    list_filter = ("status",)
    autocomplete_fields = ("invoice", "document")
    inlines = [DeliveryNoteLineInline]