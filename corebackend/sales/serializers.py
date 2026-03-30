from rest_framework import serializers

from .models import (
    Company,
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


class CompanySerializer(UserStampMixin, CurrencyListValidationMixin, serializers.ModelSerializer):
    currency_symbol = serializers.ReadOnlyField()

    class Meta:
        model = Company
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by", "currency_symbol")

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
    class Meta:
        model = QuotationLine
        fields = "__all__"
        read_only_fields = ("line_total", "created_at", "updated_at", "created_by", "updated_by")

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

    class Meta:
        model = Quotation
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


class ProformaSerializer(UserStampMixin, serializers.ModelSerializer):
    lines = ProformaLineSerializer(many=True, read_only=True)

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

    class Meta:
        model = Invoice
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