from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Customer(TimeStampedModel):
    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="customers",
    )
    name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True)
    phone_raw = models.CharField(max_length=50, blank=True)
    phone_e164 = models.CharField(max_length=30, blank=True, null=True)
    alternate_phone_e164 = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    tax_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_customers",
    )

    class Meta:
        db_table = "sales_customer"
        ordering = ["name", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "phone_e164"],
                condition=Q(phone_e164__isnull=False),
                name="uniq_customer_phone_per_org",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "phone_e164"]),
            models.Index(fields=["organization", "name"]),
            models.Index(fields=["organization", "company_name"]),
        ]

    def __str__(self) -> str:
        return self.company_name or self.name


class Product(TimeStampedModel):
    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="products",
    )
    sku = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=50, default="pcs")
    default_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "sales_product"
        ordering = ["name", "id"]
        indexes = [
            models.Index(fields=["organization", "name"]),
            models.Index(fields=["organization", "sku"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.sku})" if self.sku else self.name


class Template(TimeStampedModel):
    class DocumentType(models.TextChoices):
        QUOTATION = "quotation", "Quotation"
        PROFORMA = "proforma", "Proforma"
        INVOICE = "invoice", "Invoice"
        DELIVERY_NOTE = "delivery_note", "Delivery Note"
        RECEIPT = "receipt", "Receipt"

    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="templates",
    )
    name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    file = models.FileField(upload_to="sales/templates/")
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "sales_template"
        ordering = ["name", "id"]
        indexes = [
            models.Index(fields=["organization", "document_type"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} - {self.get_document_type_display()}"


class DocumentSequence(TimeStampedModel):
    class ResetPeriod(models.TextChoices):
        NEVER = "never", "Never"
        YEARLY = "yearly", "Yearly"
        MONTHLY = "monthly", "Monthly"

    class DocumentType(models.TextChoices):
        QUOTATION = "quotation", "Quotation"
        PROFORMA = "proforma", "Proforma"
        INVOICE = "invoice", "Invoice"
        DELIVERY_NOTE = "delivery_note", "Delivery Note"
        RECEIPT = "receipt", "Receipt"

    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="document_sequences",
    )
    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    prefix = models.CharField(max_length=20, default="")
    next_number = models.PositiveBigIntegerField(default=1)
    reset_period = models.CharField(
        max_length=20,
        choices=ResetPeriod.choices,
        default=ResetPeriod.YEARLY,
    )

    class Meta:
        db_table = "sales_document_sequence"
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "document_type"],
                name="uniq_document_sequence_per_org_type",
            )
        ]

    def __str__(self) -> str:
        return f"{self.organization_id} - {self.document_type}"


class Document(TimeStampedModel):
    class DocumentType(models.TextChoices):
        QUOTATION = "quotation", "Quotation"
        PROFORMA = "proforma", "Proforma"
        INVOICE = "invoice", "Invoice"
        DELIVERY_NOTE = "delivery_note", "Delivery Note"
        RECEIPT = "receipt", "Receipt"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        APPROVED = "approved", "Approved"
        EXPIRED = "expired", "Expired"
        PARTIALLY_PAID = "partially_paid", "Partially Paid"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"
        DISPATCHED = "dispatched", "Dispatched"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"
        ISSUED = "issued", "Issued"
        VOID = "void", "Void"

    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="documents",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="documents",
    )
    template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )

    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    document_number = models.CharField(max_length=100)
    reference_number = models.CharField(max_length=100, blank=True)

    issue_date = models.DateField(default=timezone.localdate)
    expiry_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)

    currency_code = models.CharField(max_length=10, default="USD")
    exchange_rate = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        default=Decimal("1.0000"),
        validators=[MinValueValidator(Decimal("0.0001"))],
    )

    subtotal = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    discount_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    tax_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    total_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    amount_paid = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    balance_due = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    notes = models.TextField(blank=True)
    terms_and_conditions = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_documents",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_documents",
    )

    class Meta:
        db_table = "sales_document"
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "document_number"],
                name="uniq_document_number_per_org",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "document_type"]),
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["organization", "issue_date"]),
            models.Index(fields=["customer", "document_type"]),
        ]

    def __str__(self) -> str:
        return f"{self.document_number} ({self.document_type})"

    def recalculate_totals(self, save: bool = True) -> None:
        lines = list(self.lines.all())
        subtotal = sum((line.quantity * line.unit_price for line in lines), Decimal("0.00"))
        discount = sum((line.discount_amount for line in lines), Decimal("0.00"))
        tax = sum((line.tax_amount for line in lines), Decimal("0.00"))
        total = sum((line.line_total for line in lines), Decimal("0.00"))

        self.subtotal = subtotal
        self.discount_amount = discount
        self.tax_amount = tax
        self.total_amount = total
        self.balance_due = total - self.amount_paid

        if save:
            self.save(
                update_fields=[
                    "subtotal",
                    "discount_amount",
                    "tax_amount",
                    "total_amount",
                    "balance_due",
                    "updated_at",
                ]
            )


class DocumentLine(TimeStampedModel):
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="lines",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="document_lines",
    )

    line_order = models.PositiveIntegerField(default=1)
    item_code = models.CharField(max_length=100, blank=True)
    item_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=50, default="pcs")

    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("1.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    line_total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    class Meta:
        db_table = "sales_document_line"
        ordering = ["line_order", "id"]
        indexes = [
            models.Index(fields=["document", "line_order"]),
        ]

    def __str__(self) -> str:
        return f"{self.document.document_number} - {self.item_name}"

    def calculate_amounts(self) -> None:
        gross = self.quantity * self.unit_price
        taxable_base = gross - self.discount_amount
        tax = (taxable_base * self.tax_rate) / Decimal("100.00")
        total = taxable_base + tax

        self.tax_amount = tax.quantize(Decimal("0.01"))
        self.line_total = total.quantize(Decimal("0.01"))

    def save(self, *args, **kwargs):
        self.calculate_amounts()
        super().save(*args, **kwargs)


class DocumentRelationship(TimeStampedModel):
    class RelationshipType(models.TextChoices):
        GENERATED_FROM = "generated_from", "Generated From"
        MERGED_INTO = "merged_into", "Merged Into"
        FULFILLED_BY = "fulfilled_by", "Fulfilled By"
        PAID_BY = "paid_by", "Paid By"

    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="document_relationships",
    )
    parent_document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="child_relationships",
    )
    child_document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="parent_relationships",
    )
    relationship_type = models.CharField(
        max_length=50,
        choices=RelationshipType.choices,
    )
    allocated_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
    )
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "sales_document_relationship"
        constraints = [
            models.UniqueConstraint(
                fields=["parent_document", "child_document", "relationship_type"],
                name="uniq_document_relationship",
            ),
            models.CheckConstraint(
                check=~Q(parent_document=models.F("child_document")),
                name="prevent_self_document_relationship",
            ),
        ]
        indexes = [
            models.Index(fields=["organization", "relationship_type"]),
        ]

    def __str__(self) -> str:
        return f"{self.parent_document_id} -> {self.child_document_id} ({self.relationship_type})"


class DeliveryNoteDetail(TimeStampedModel):
    document = models.OneToOneField(
        Document,
        on_delete=models.CASCADE,
        related_name="delivery_detail",
        limit_choices_to={"document_type": Document.DocumentType.DELIVERY_NOTE},
    )
    delivery_date = models.DateField(null=True, blank=True)
    delivery_address = models.TextField(blank=True)
    receiver_name = models.CharField(max_length=255, blank=True)
    receiver_phone = models.CharField(max_length=50, blank=True)
    driver_name = models.CharField(max_length=255, blank=True)
    driver_phone = models.CharField(max_length=50, blank=True)
    vehicle_number = models.CharField(max_length=100, blank=True)
    dispatch_notes = models.TextField(blank=True)
    proof_of_delivery = models.FileField(
        upload_to="sales/delivery_proofs/",
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "sales_delivery_note_detail"

    def __str__(self) -> str:
        return f"Delivery detail for {self.document.document_number}"


class Payment(TimeStampedModel):
    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="payments",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="payments",
    )
    payment_date = models.DateField(default=timezone.localdate)
    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    currency_code = models.CharField(max_length=10, default="USD")
    exchange_rate = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        default=Decimal("1.0000"),
        validators=[MinValueValidator(Decimal("0.0001"))],
    )
    payment_method = models.CharField(max_length=50, blank=True)
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_payments",
    )

    class Meta:
        db_table = "sales_payment"
        ordering = ["-payment_date", "-id"]
        indexes = [
            models.Index(fields=["organization", "payment_date"]),
            models.Index(fields=["customer", "payment_date"]),
        ]

    def __str__(self) -> str:
        return f"Payment {self.id} - {self.amount} {self.currency_code}"


class PaymentAllocation(TimeStampedModel):
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name="allocations",
    )
    invoice_document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="payment_allocations",
        limit_choices_to={"document_type": Document.DocumentType.INVOICE},
    )
    allocated_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )

    class Meta:
        db_table = "sales_payment_allocation"
        constraints = [
            models.UniqueConstraint(
                fields=["payment", "invoice_document"],
                name="uniq_payment_invoice_allocation",
            )
        ]

    def __str__(self) -> str:
        return f"{self.payment_id} -> {self.invoice_document_id}"


class ReceiptDetail(TimeStampedModel):
    document = models.OneToOneField(
        Document,
        on_delete=models.CASCADE,
        related_name="receipt_detail",
        limit_choices_to={"document_type": Document.DocumentType.RECEIPT},
    )
    payment = models.OneToOneField(
        Payment,
        on_delete=models.CASCADE,
        related_name="receipt_detail",
    )
    receipt_date = models.DateField(default=timezone.localdate)
    received_from = models.CharField(max_length=255, blank=True)
    receipt_notes = models.TextField(blank=True)

    class Meta:
        db_table = "sales_receipt_detail"

    def __str__(self) -> str:
        return f"Receipt detail for {self.document.document_number}"