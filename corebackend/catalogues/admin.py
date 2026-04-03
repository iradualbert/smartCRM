from django.contrib import admin

from .models import (
    Catalogue,
    CatalogueCategory,
    CatalogueItem,
    ProductDocument,
    ProductMedia,
    ProductSpecification,
    QuoteRequest,
    QuoteRequestItem,
)


class CatalogueCategoryInline(admin.TabularInline):
    model = CatalogueCategory
    extra = 1
    fields = ("name", "slug", "sort_order")


class CatalogueItemInline(admin.TabularInline):
    model = CatalogueItem
    extra = 1
    autocomplete_fields = ("product", "category")
    fields = (
        "product",
        "category",
        "sort_order",
        "custom_title",
        "custom_price",
        "badge_text",
        "stock_label",
        "is_visible",
        "show_in_public",
    )


class QuoteRequestItemInline(admin.TabularInline):
    model = QuoteRequestItem
    extra = 0
    autocomplete_fields = ("product",)
    fields = ("product", "description", "quantity")


@admin.register(Catalogue)
class CatalogueAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "company",
        "status",
        "show_prices",
        "is_public",
        "allow_embed",
        "created_at",
    )
    search_fields = ("name", "slug", "description", "company__name")
    list_filter = ("status", "is_public", "allow_embed", "show_prices", "company")
    autocomplete_fields = ("company",)
    readonly_fields = ("public_token", "created_at", "updated_at", "created_by", "updated_by")
    inlines = [CatalogueCategoryInline, CatalogueItemInline]


@admin.register(CatalogueCategory)
class CatalogueCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "catalogue", "sort_order", "created_at")
    search_fields = ("name", "slug", "catalogue__name")
    list_filter = ("catalogue",)
    autocomplete_fields = ("catalogue",)
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")


@admin.register(CatalogueItem)
class CatalogueItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "catalogue",
        "product",
        "category",
        "display_price",
        "badge_text",
        "stock_label",
        "is_visible",
        "show_in_public",
        "created_at",
    )
    search_fields = (
        "catalogue__name",
        "product__name",
        "product__sku",
        "custom_title",
        "badge_text",
        "stock_label",
    )
    list_filter = ("catalogue", "category", "is_visible", "show_in_public")
    autocomplete_fields = ("catalogue", "category", "product")
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")


@admin.register(ProductMedia)
class ProductMediaAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "media_type", "is_primary", "sort_order", "created_at")
    search_fields = ("product__name", "alt_text")
    list_filter = ("media_type", "is_primary")
    autocomplete_fields = ("product",)
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")


@admin.register(ProductDocument)
class ProductDocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "title", "document_type", "sort_order", "created_at")
    search_fields = ("product__name", "title")
    list_filter = ("document_type",)
    autocomplete_fields = ("product",)
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")


@admin.register(ProductSpecification)
class ProductSpecificationAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "name", "value", "unit", "is_highlight", "sort_order")
    search_fields = ("product__name", "name", "value")
    list_filter = ("is_highlight",)
    autocomplete_fields = ("product",)
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_name",
        "company_name",
        "customer_email",
        "catalogue",
        "status",
        "quotation",
        "submitted_at",
    )
    search_fields = (
        "customer_name",
        "company_name",
        "customer_email",
        "customer_phone",
        "catalogue__name",
        "company__name",
    )
    list_filter = ("status", "company", "catalogue")
    autocomplete_fields = ("company", "catalogue", "customer", "quotation")
    readonly_fields = ("submitted_at", "created_at", "updated_at", "created_by", "updated_by")
    inlines = [QuoteRequestItemInline]


@admin.register(QuoteRequestItem)
class QuoteRequestItemAdmin(admin.ModelAdmin):
    list_display = ("id", "quote_request", "product", "quantity", "created_at")
    search_fields = ("quote_request__customer_name", "product__name", "description")
    autocomplete_fields = ("quote_request", "product")
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")