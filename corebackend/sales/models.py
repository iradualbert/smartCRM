from decimal import Decimal

from django.db import models
from django.contrib.auth.models import User


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        related_name='%(class)s_created',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    updated_by = models.ForeignKey(
        User,
        related_name='%(class)s_updated',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        abstract = True


class Document(TimeStampedModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='documents/')

    def __str__(self):
        return self.name


class DocumentAbstractModel(TimeStampedModel):
    document = models.ForeignKey(
        Document,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        abstract = True


class Template(TimeStampedModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='templates/')

    def __str__(self):
        return self.name


class Customer(TimeStampedModel):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
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
        subtotal = sum((line.line_total for line in lines), Decimal("0.00"))
        self.subtotal = subtotal
        self.total = subtotal
        self.save(update_fields=["subtotal", "total", "updated_at"])


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
        related_name="proformas"
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="proformas"
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
        self.save(update_fields=["subtotal", "total", "updated_at"])


class Invoice(DocumentAbstractModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        PARTIALLY_PAID = "partially_paid", "Partially Paid"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"
        CANCELLED = "cancelled", "Cancelled"

    proforma = models.ForeignKey(Proforma, on_delete=models.CASCADE, related_name="invoices")
    invoice_number = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        customer = self.proforma.customer.name if self.proforma and self.proforma.customer else "Unknown Customer"
        return f"Invoice {self.invoice_number} for {customer}"

    def recalculate_totals(self):
        lines = self.lines.all()
        subtotal = sum((line.line_total for line in lines), Decimal("0.00"))
        self.subtotal = subtotal
        self.total = subtotal
        self.save(update_fields=["subtotal", "total", "updated_at"])


class Receipt(DocumentAbstractModel):
    class Status(models.TextChoices):
        ISSUED = "issued", "Issued"
        CANCELLED = "cancelled", "Cancelled"

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="receipts")
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