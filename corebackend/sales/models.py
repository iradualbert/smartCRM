from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models

from decimal import Decimal, ROUND_HALF_UP


SUPPORTED_CURRENCY_CHOICES = [
    ("USD", "US Dollar"),
    ("EUR", "Euro"),
    ("GBP", "British Pound"),
    ("TRY", "Turkish Lira"),
    ("KES", "Kenyan Shilling"),
    ("UGX", "Ugandan Shilling"),
    ("TZS", "Tanzanian Shilling"),
]

CURRENCY_SYMBOL_MAP = {
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "TRY": "₺",
    "KES": "KSh",
    "UGX": "USh",
    "TZS": "TSh",
}


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        related_name="%(class)s_created",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    updated_by = models.ForeignKey(
        User,
        related_name="%(class)s_updated",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    class Meta:
        abstract = True


class Company(TimeStampedModel):
    name = models.CharField(max_length=255)
    legal_name = models.CharField(max_length=255, blank=True, null=True)
    tax_number = models.CharField(max_length=100, blank=True, null=True)

    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)

    supported_currencies = models.JSONField(
        default=list,
        blank=True,
        help_text="List of allowed currency codes, e.g. ['USD', 'EUR']",
    )
    default_currency = models.CharField(
        max_length=10,
        choices=SUPPORTED_CURRENCY_CHOICES,
        default="USD",
    )

    invoice_prefix = models.CharField(max_length=20, default="INV")
    quotation_prefix = models.CharField(max_length=20, default="QUO")
    proforma_prefix = models.CharField(max_length=20, default="PRO")
    receipt_prefix = models.CharField(max_length=20, default="REC")
    delivery_note_prefix = models.CharField(max_length=20, default="DN")
    storage_used_bytes = models.BigIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    def clean(self):
        valid_codes = {code for code, _ in SUPPORTED_CURRENCY_CHOICES}

        if not isinstance(self.supported_currencies, list):
            raise ValidationError({"supported_currencies": "Must be a list."})

        invalid = [code for code in self.supported_currencies if code not in valid_codes]
        if invalid:
            raise ValidationError(
                {"supported_currencies": f"Unsupported currency codes: {', '.join(invalid)}"}
            )

        if self.default_currency not in valid_codes:
            raise ValidationError({"default_currency": "Invalid default currency."})

        if self.supported_currencies and self.default_currency not in self.supported_currencies:
            raise ValidationError(
                {"default_currency": "default_currency must be included in supported_currencies."}
            )

    def save(self, *args, **kwargs):
        if not self.supported_currencies:
            self.supported_currencies = [self.default_currency]
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def currency_symbol(self):
        return CURRENCY_SYMBOL_MAP.get(self.default_currency, "$")

    def __str__(self):
        return self.name





class CompanyMembership(TimeStampedModel):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        ADMIN = "admin", "Admin"
        STAFF = "staff", "Staff"
        VIEWER = "viewer", "Viewer"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="company_memberships",
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="memberships",
    )

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STAFF)
    is_active = models.BooleanField(default=True)

    # 👇 company-specific user info
    display_name = models.CharField(max_length=255, blank=True, null=True)
    job_title = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    work_email = models.EmailField(blank=True, null=True)
    work_phone = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        unique_together = ("user", "company")
        ordering = ["company", "user__email"]

    def __str__(self):
        return f"{self.display_name or self.user.email} @ {self.company.name}"


class Template(TimeStampedModel):
    DOCUMENT_TYPE_CHOICES = [
        ("invoice", "Invoice"),
        ("quotation", "Quotation"),
        ("proforma", "Proforma"),
        ("delivery_note", "Delivery Note"),
        ("receipt", "Receipt"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="templates",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to="templates/")
    document_type = models.CharField(
        max_length=50,
        choices=DOCUMENT_TYPE_CHOICES,
        default="invoice",
    )
    mapping = models.JSONField(default=dict, blank=True)
    supported_currencies = models.JSONField(
        default=list,
        blank=True,
        help_text="Optional list of supported currency codes for this template.",
    )
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)

    def clean(self):
        valid_codes = {code for code, _ in SUPPORTED_CURRENCY_CHOICES}
        if not isinstance(self.supported_currencies, list):
            raise ValidationError({"supported_currencies": "Must be a list."})

        invalid = [code for code in self.supported_currencies if code not in valid_codes]
        if invalid:
            raise ValidationError(
                {"supported_currencies": f"Unsupported currency codes: {', '.join(invalid)}"}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        company_name = self.company.name if self.company else "Global"
        return f"{self.name} ({self.document_type}) - {company_name}"


class Document(TimeStampedModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to="documents/")
    template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="generated_documents",
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    is_current = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class DocumentAbstractModel(TimeStampedModel):
    document = models.ForeignKey(
        Document,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)ss",
    )
    currency = models.CharField(
        max_length=10,
        choices=SUPPORTED_CURRENCY_CHOICES,
        blank=True,
        null=True,
    )
    pdf_generated_at = models.DateTimeField(null=True, blank=True)
    pdf_needs_regeneration = models.BooleanField(default=False)
    
    issue_date = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)

    class TaxMode(models.TextChoices):
        EXCLUSIVE = "exclusive", "Tax added on top"
        INCLUSIVE = "inclusive", "Tax included in prices"

    tax_mode = models.CharField(
        max_length=20,
        choices=TaxMode.choices,
        default=TaxMode.EXCLUSIVE,
    )
    tax_label = models.CharField(max_length=50, default="VAT")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        abstract = True

    def get_effective_currency(self):
        if self.currency:
            return self.currency
        if self.company and self.company.default_currency:
            return self.company.default_currency
        return "USD"

    def get_effective_currency_symbol(self):
        return CURRENCY_SYMBOL_MAP.get(self.get_effective_currency(), "$")


class Customer(TimeStampedModel):
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customers",
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    sku = models.CharField(max_length=100, blank=True, null=True)
    default_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.name



class Quotation(DocumentAbstractModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        EXPIRED = "expired", "Expired"

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="quotations")
    selected_template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotation_instances",
        limit_choices_to={"document_type": "quotation", "is_active": True},
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    quote_number = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return self.name

    def recalculate_totals(self):
        lines = self.lines.all()
        lines_total = sum((line.line_total for line in lines), Decimal("0.00"))
        rate_fraction = (self.tax_rate or Decimal("0.00")) / Decimal("100.00")

        if self.tax_mode == self.TaxMode.INCLUSIVE:
            gross_total = lines_total
            if rate_fraction > 0:
                subtotal = (gross_total / (Decimal("1.00") + rate_fraction)).quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP
                )
            else:
                subtotal = gross_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            tax_total = (gross_total - subtotal).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            total = gross_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            subtotal = lines_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            tax_total = (subtotal * rate_fraction).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            total = (subtotal + tax_total).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )

        self.subtotal = subtotal
        self.tax_total = tax_total
        self.total = total
        self.pdf_needs_regeneration = bool(self.document_id)
        self.save(
            update_fields=[
                "subtotal",
                "tax_total",
                "total",
                "pdf_needs_regeneration",
                "updated_at",
            ]
        )


class Proforma(DocumentAbstractModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"

    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="proformas",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="proformas",
    )
    selected_template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="proforma_instances",
        limit_choices_to={"document_type": "proforma", "is_active": True},
    )
    proforma_number = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Proforma for {self.customer.name if self.customer else 'Unknown Customer'}"

    def recalculate_totals(self):
        lines = self.lines.all()
        subtotal = sum((line.line_total for line in lines), Decimal("0.00"))
        self.subtotal = subtotal
        self.total = subtotal
        self.pdf_needs_regeneration = bool(self.document_id)
        self.save(update_fields=["subtotal", "total", "pdf_needs_regeneration", "updated_at"])


class Invoice(DocumentAbstractModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        PARTIALLY_PAID = "partially_paid", "Partially Paid"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"
        CANCELLED = "cancelled", "Cancelled"

    proforma = models.ForeignKey(
        Proforma,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    selected_template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoice_instances",
        limit_choices_to={"document_type": "invoice", "is_active": True},
    )
    invoice_number = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        customer_name = (
            self.customer.name
            if self.customer
            else (
                self.proforma.customer.name
                if self.proforma and self.proforma.customer
                else (
                    self.quotation.customer.name
                    if self.quotation and self.quotation.customer
                    else "Unknown Customer"
                )
            )
        )
        return f"Invoice {self.invoice_number} for {customer_name}"

    def recalculate_totals(self):
        lines = self.lines.all()
        lines_total = sum((line.line_total for line in lines), Decimal("0.00"))
        rate_fraction = (self.tax_rate or Decimal("0.00")) / Decimal("100.00")

        if self.tax_mode == self.TaxMode.INCLUSIVE:
            gross_total = lines_total
            if rate_fraction > 0:
                subtotal = gross_total / (Decimal("1.00") + rate_fraction)
            else:
                subtotal = gross_total
            tax_total = gross_total - subtotal
            total = gross_total
        else:
            subtotal = lines_total
            tax_total = subtotal * rate_fraction
            total = subtotal + tax_total

        self.subtotal = subtotal
        self.tax_total = tax_total
        self.total = total
        self.pdf_needs_regeneration = bool(self.document_id)
        self.save(
            update_fields=[
                "subtotal",
                "tax_total",
                "total",
                "pdf_needs_regeneration",
                "updated_at",
            ]
        )

class Receipt(DocumentAbstractModel):
    class Status(models.TextChoices):
        ISSUED = "issued", "Issued"
        CANCELLED = "cancelled", "Cancelled"

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="receipts")
    selected_template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="receipt_instances",
        limit_choices_to={"document_type": "receipt", "is_active": True},
    )
    receipt_number = models.CharField(max_length=255, unique=True)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ISSUED)

    def __str__(self):
        customer = (
            self.invoice.proforma.customer.name
            if self.invoice and self.invoice.proforma and self.invoice.proforma.customer
            else "Unknown Customer"
        )
        return f"Receipt {self.receipt_number} for {customer}"


class DeliveryNote(DocumentAbstractModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        DISPATCHED = "dispatched", "Dispatched"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="delivery_notes")
    selected_template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delivery_note_instances",
        limit_choices_to={"document_type": "delivery_note", "is_active": True},
    )
    delivery_note_number = models.CharField(max_length=255, unique=True)
    delivery_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    def __str__(self):
        customer = (
            self.invoice.proforma.customer.name
            if self.invoice and self.invoice.proforma and self.invoice.proforma.customer
            else "Unknown Customer"
        )
        return f"Delivery Note {self.delivery_note_number} for {customer}"


class BaseLineItem(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.line_total = (self.quantity or Decimal("0")) * (self.unit_price or Decimal("0"))
        super().save(*args, **kwargs)


class QuotationLine(BaseLineItem):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name="lines")

    def __str__(self):
        product_name = self.product.name if self.product else "Custom Item"
        return f"{self.quotation.quote_number} - {product_name}"


class ProformaLine(BaseLineItem):
    proforma = models.ForeignKey(Proforma, on_delete=models.CASCADE, related_name="lines")

    def __str__(self):
        product_name = self.product.name if self.product else "Custom Item"
        return f"{self.proforma.proforma_number} - {product_name}"


class InvoiceLine(BaseLineItem):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")

    def __str__(self):
        product_name = self.product.name if self.product else "Custom Item"
        return f"{self.invoice.invoice_number} - {product_name}"


class DeliveryNoteLine(BaseLineItem):
    delivery_note = models.ForeignKey(DeliveryNote, on_delete=models.CASCADE, related_name="lines")

    def __str__(self):
        product_name = self.product.name if self.product else "Custom Item"
        return f"{self.delivery_note.delivery_note_number} - {product_name}"
    
    
    
class DocumentEvent(models.Model):
    EVENT_TYPES = [
        ("created", "Created"),
        ("updated", "Updated"),
        ("converted", "Converted"),
        ("pdf_generated", "PDF Generated"),
        ("email_sent", "Email Sent"),
        ("status_changed", "Status Changed"),
        ("viewed", "Viewed")
    ]

    document = models.ForeignKey(
        "Document",
        on_delete=models.CASCADE,
        related_name="events"
    )

    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)

    message = models.TextField(blank=True)

    metadata = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]