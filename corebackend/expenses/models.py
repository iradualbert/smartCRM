from django.db import models
from ..sales.models import TimeStampedModel, Company


class Supplier(TimeStampedModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="suppliers")
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    tax_number = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name
    

class PurchaseDocument(TimeStampedModel):
    class DocumentType(models.TextChoices):
        QUOTATION = "quotation", "Quotation"
        INVOICE = "invoice", "Invoice"
        RECEIPT = "receipt", "Receipt"
        DELIVERY_NOTE = "delivery_note", "Delivery Note"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        VERIFIED = "verified", "Verified"
        APPROVED = "approved", "Approved"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="purchase_documents")
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name="documents")
    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    file = models.FileField(upload_to="purchase_documents/")
    extracted_raw_text = models.TextField(blank=True, null=True)
    extracted_data = models.JSONField(default=dict, blank=True)
    extraction_status = models.CharField(max_length=30, default="pending")
    is_verified = models.BooleanField(default=False)

    document_number = models.CharField(max_length=255, blank=True, null=True)
    issue_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)

    currency = models.CharField(max_length=10, choices=SUPPORTED_CURRENCY_CHOICES, blank=True, null=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    send_reminder = models.BooleanField(default=False)
    reminder_days_before = models.PositiveIntegerField(default=3)
    last_reminder_sent_at = models.DateTimeField(blank=True, null=True)

    notes = models.TextField(blank=True, null=True)
    
    

class PurchaseLine(TimeStampedModel):
    purchase_document = models.ForeignKey(PurchaseDocument, on_delete=models.CASCADE, related_name="lines")
    description = models.TextField(blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.line_total = (self.quantity or 0) * (self.unit_price or 0)
        super().save(*args, **kwargs)