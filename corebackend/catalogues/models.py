import uuid

from django.db import models
from django.utils.text import slugify

from sales.models import Company, Customer, Product, Quotation, TimeStampedModel


class Catalogue(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="catalogues",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    description = models.TextField(blank=True, null=True)

    public_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    is_public = models.BooleanField(default=True)
    allow_embed = models.BooleanField(default=True)
    show_prices = models.BooleanField(default=True)

    hero_image = models.ImageField(upload_to="catalogues/heroes/", blank=True, null=True)
    catalogue_pdf = models.FileField(upload_to="catalogues/pdfs/", blank=True, null=True)

    allowed_domains = models.JSONField(default=list, blank=True)
    theme_variant = models.CharField(max_length=50, default="light")

    class Meta:
        unique_together = ("company", "slug")
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) or f"catalogue-{self.pk or 'new'}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.company.name}"


class CatalogueCategory(TimeStampedModel):
    catalogue = models.ForeignKey(
        Catalogue,
        on_delete=models.CASCADE,
        related_name="categories",
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("catalogue", "slug")
        ordering = ["sort_order", "id"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) or f"category-{self.pk or 'new'}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.catalogue.name} - {self.name}"


class CatalogueItem(TimeStampedModel):
    catalogue = models.ForeignKey(
        Catalogue,
        on_delete=models.CASCADE,
        related_name="items",
    )
    category = models.ForeignKey(
        CatalogueCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="catalogue_items",
    )

    sort_order = models.PositiveIntegerField(default=0)

    custom_title = models.CharField(max_length=255, blank=True, null=True)
    custom_description = models.TextField(blank=True, null=True)
    custom_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    badge_text = models.CharField(max_length=80, blank=True, null=True)
    stock_label = models.CharField(max_length=80, blank=True, null=True)

    is_visible = models.BooleanField(default=True)
    show_in_public = models.BooleanField(default=True)

    class Meta:
        unique_together = ("catalogue", "product")
        ordering = ["sort_order", "id"]

    @property
    def display_name(self):
        return self.custom_title or self.product.name

    @property
    def display_description(self):
        return self.custom_description or self.product.description or ""

    @property
    def display_price(self):
        return self.custom_price if self.custom_price is not None else self.product.default_price

    def __str__(self):
        return f"{self.catalogue.name} - {self.display_name}"


class ProductMedia(TimeStampedModel):
    class MediaType(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="catalogue_media",
    )
    media_type = models.CharField(max_length=20, choices=MediaType.choices, default=MediaType.IMAGE)
    image = models.ImageField(upload_to="catalogues/product_media/", blank=True, null=True)
    external_url = models.URLField(blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product.name} - {self.media_type}"


class ProductDocument(TimeStampedModel):
    class DocumentType(models.TextChoices):
        SPEC_SHEET = "spec_sheet", "Spec Sheet"
        BROCHURE = "brochure", "Brochure"
        MANUAL = "manual", "Manual"
        CERTIFICATE = "certificate", "Certificate"

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="catalogue_documents",
    )
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=30, choices=DocumentType.choices, default=DocumentType.SPEC_SHEET)
    file = models.FileField(upload_to="catalogues/product_documents/")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product.name} - {self.title}"


class ProductSpecification(TimeStampedModel):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="catalogue_specifications",
    )
    name = models.CharField(max_length=120)
    value = models.CharField(max_length=255)
    unit = models.CharField(max_length=50, blank=True, null=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_highlight = models.BooleanField(default=False)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class QuoteRequest(TimeStampedModel):
    class Status(models.TextChoices):
        NEW = "new", "New"
        REVIEWED = "reviewed", "Reviewed"
        CONVERTED = "converted", "Converted"
        CLOSED = "closed", "Closed"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="quote_requests",
    )
    catalogue = models.ForeignKey(
        Catalogue,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quote_requests",
    )
    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="catalogue_quote_requests",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="catalogue_quote_requests",
    )

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)

    customer_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    customer_phone = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=120, blank=True, null=True)

    notes = models.TextField(blank=True, null=True)
    source = models.CharField(max_length=50, default="catalogue")
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at", "-created_at"]

    def __str__(self):
        return f"Quote Request #{self.id} - {self.customer_name}"


class QuoteRequestItem(TimeStampedModel):
    quote_request = models.ForeignKey(
        QuoteRequest,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="catalogue_quote_request_items",
    )
    description = models.TextField(blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        label = self.product.name if self.product else (self.description or "Custom item")
        return f"{self.quote_request_id} - {label}"