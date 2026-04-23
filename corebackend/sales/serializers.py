from rest_framework import serializers
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
    SUPPORTED_CURRENCY_CHOICES,
)
from billing.models import Subscription


class UserStampMixin:
    def _set_user_fields(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            if not self.instance:
                validated_data["created_by"] = request.user
            validated_data["updated_by"] = request.user
        return validated_data


class CurrencyListValidationMixin:
    def validate_supported_currencies(self, value):
        valid_codes = {code for code, _ in SUPPORTED_CURRENCY_CHOICES}
        if not isinstance(value, list):
            raise serializers.ValidationError("supported_currencies must be a list.")
        invalid = [code for code in value if code not in valid_codes]
        if invalid:
            raise serializers.ValidationError(
                f"Unsupported currency codes: {', '.join(invalid)}"
            )
        return value


class AddCompanyUserByEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    display_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    job_title = serializers.CharField(required=False, allow_blank=True, max_length=255)
    department = serializers.CharField(required=False, allow_blank=True, max_length=255)
    work_email = serializers.EmailField(required=False, allow_blank=True)
    work_phone = serializers.CharField(required=False, allow_blank=True, max_length=50)
    role = serializers.ChoiceField(
        choices=CompanyMembership.Role.choices,
        required=False,
        default=CompanyMembership.Role.STAFF,
    )


class CompanyMembershipSerializer(UserStampMixin, serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_first_name = serializers.CharField(source="user.first_name", read_only=True)
    user_last_name = serializers.CharField(source="user.last_name", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = CompanyMembership
        fields = (
            "id",
            "company",
            "company_name",
            "user",
            "user_email",
            "user_first_name",
            "user_last_name",
            "display_name",
            "job_title",
            "department",
            "work_email",
            "work_phone",
            "role",
            "is_active",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )
        read_only_fields = (
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "user_email",
            "user_first_name",
            "user_last_name",
            "company_name",
        )

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


        

class CompanySerializer(UserStampMixin, CurrencyListValidationMixin, serializers.ModelSerializer):
    currency_symbol = serializers.ReadOnlyField()
    member_count = serializers.SerializerMethodField()
    current_membership = serializers.SerializerMethodField()
    plan_name = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = "__all__"
        read_only_fields = (
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "currency_symbol",
            "member_count",
            "current_membership"
           
        )
    
    def get_plan_name(self, obj):
        active_subscription = obj.subscriptions.filter(status=Subscription.Status.ACTIVE).order_by("-current_period_end").first()
        return active_subscription.plan.name if active_subscription else "Free Plan"
        
    def get_member_count(self, obj):
        return obj.memberships.filter(is_active=True).count()

    def get_current_membership(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return None

        membership = obj.memberships.filter(user=user).select_related("user").first()
        if not membership:
            return None

        return CompanyMembershipSerializer(
            membership,
            context=self.context,
        ).data

    def validate(self, attrs):
        supported = attrs.get("supported_currencies", getattr(self.instance, "supported_currencies", []))
        default_currency = attrs.get("default_currency", getattr(self.instance, "default_currency", None))

        if supported and default_currency and default_currency not in supported:
            raise serializers.ValidationError(
                {"default_currency": "default_currency must be included in supported_currencies."}
            )
        return attrs

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class DocumentSerializer(UserStampMixin, serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by", "generated_at")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class TemplateSerializer(UserStampMixin, CurrencyListValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class CustomerSerializer(UserStampMixin, serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class ProductSerializer(UserStampMixin, serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))
    
class QuotationLineSerializer(UserStampMixin, serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = QuotationLine
        fields = (
            "id",
            "quotation",
            "product",
            "product_name",
            "product_sku",
            "description",
            "quantity",
            "unit_price",
            "line_total",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )
        read_only_fields = (
            "line_total",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "product_name",
            "product_sku",
        )

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))



    


class ProformaLineSerializer(UserStampMixin, serializers.ModelSerializer):
    class Meta:
        model = ProformaLine
        fields = "__all__"
        read_only_fields = ("line_total", "created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class InvoiceLineSerializer(UserStampMixin, serializers.ModelSerializer):
    class Meta:
        model = InvoiceLine
        fields = "__all__"
        read_only_fields = ("line_total", "created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class DeliveryNoteLineSerializer(UserStampMixin, serializers.ModelSerializer):
    class Meta:
        model = DeliveryNoteLine
        fields = "__all__"
        read_only_fields = ("line_total", "created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))



class QuotationSerializer(UserStampMixin, serializers.ModelSerializer):
    lines = QuotationLineSerializer(many=True, read_only=True)
    quote_number = serializers.CharField(required=False, allow_blank=True)

    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_email = serializers.EmailField(source="customer.email", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone_number", read_only=True)
    customer_address = serializers.CharField(source="customer.address", read_only=True)

    invoice_detail = serializers.SerializerMethodField()
    proforma_detail = serializers.SerializerMethodField()

    class Meta:
        model = Quotation
        fields = "__all__"
        read_only_fields = (
            "subtotal",
            "tax_total",
            "total",
            "pdf_generated_at",
            "pdf_needs_regeneration",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )

    def get_invoice_detail(self, obj):
        invoice = obj.invoices.order_by("created_at").first()
        if not invoice:
            return None
        return {
            "id": invoice.id,
            "number": invoice.invoice_number,
            "status": invoice.status,
            "total": str(invoice.total),
        }

    def get_proforma_detail(self, obj):
        proforma = obj.proformas.order_by("created_at").first()
        if not proforma:
            return None
        return {
            "id": proforma.id,
            "number": proforma.proforma_number,
            "status": proforma.status,
            "total": str(proforma.total),
        }

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class ProformaSerializer(UserStampMixin, serializers.ModelSerializer):
    lines = ProformaLineSerializer(many=True, read_only=True)

    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_email = serializers.EmailField(source="customer.email", read_only=True)
    customer_address = serializers.CharField(source="customer.address", read_only=True)

    class Meta:
        model = Proforma
        fields = "__all__"
        read_only_fields = (
            "subtotal",
            "total",
            "pdf_generated_at",
            "pdf_needs_regeneration",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class InvoiceSerializer(UserStampMixin, serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)

    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_email = serializers.EmailField(source="customer.email", read_only=True)
    customer_address = serializers.CharField(source="customer.address", read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = (
            "subtotal",
            "tax_total",
            "total",
            "pdf_generated_at",
            "pdf_needs_regeneration",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class ReceiptSerializer(UserStampMixin, serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = "__all__"
        read_only_fields = (
            "pdf_generated_at",
            "pdf_needs_regeneration",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class DeliveryNoteSerializer(UserStampMixin, serializers.ModelSerializer):
    lines = DeliveryNoteLineSerializer(many=True, read_only=True)

    class Meta:
        model = DeliveryNote
        fields = "__all__"
        read_only_fields = (
            "pdf_generated_at",
            "pdf_needs_regeneration",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))
    
    


from .models_email import EmailSendingConfig
from .services.email_crypto import encrypt_secret


class EmailSendingConfigSerializer(serializers.ModelSerializer):
    smtp_password = serializers.CharField(write_only=True, required=False, allow_blank=False)
    masked_password = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = EmailSendingConfig
        fields = (
            "id",
            "company",
            "user",
            "owner_type",
            "name",
            "from_name",
            "from_email",
            "smtp_host",
            "smtp_port",
            "smtp_username",
            "smtp_password",
            "masked_password",
            "security_type",
            "is_active",
            "is_default",
            "last_tested_at",
            "last_test_status",
            "last_test_error",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "last_tested_at",
            "last_test_status",
            "last_test_error",
            "created_at",
            "updated_at",
        )

    def get_masked_password(self, obj):
        return "••••••••" if obj.smtp_password_encrypted else ""

    def create(self, validated_data):
        raw_password = validated_data.pop("smtp_password", None)
        if raw_password:
            validated_data["smtp_password_encrypted"] = encrypt_secret(raw_password)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        raw_password = validated_data.pop("smtp_password", None)
        if raw_password:
            validated_data["smtp_password_encrypted"] = encrypt_secret(raw_password)
        return super().update(instance, validated_data)

    def validate(self, attrs):
        owner_type = attrs.get("owner_type", getattr(self.instance, "owner_type", None))
        company = attrs.get("company", getattr(self.instance, "company", None))
        user = attrs.get("user", getattr(self.instance, "user", None))

        if owner_type == EmailSendingConfig.OwnerType.COMPANY and not company:
            raise serializers.ValidationError({"company": "Company is required."})
        if owner_type == EmailSendingConfig.OwnerType.USER and not user:
            raise serializers.ValidationError({"user": "User is required."})
        if company and user:
            raise serializers.ValidationError("Config cannot belong to both company and user.")

        return attrs