from rest_framework import serializers

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


class UserStampMixin:
    def _set_user_fields(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            if not self.instance:
                validated_data["created_by"] = request.user
            validated_data["updated_by"] = request.user
        return validated_data


class DocumentSerializer(UserStampMixin, serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class TemplateSerializer(UserStampMixin, serializers.ModelSerializer):
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
        read_only_fields = ("subtotal", "total", "created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class ProformaSerializer(UserStampMixin, serializers.ModelSerializer):
    lines = ProformaLineSerializer(many=True, read_only=True)

    class Meta:
        model = Proforma
        fields = "__all__"
        read_only_fields = ("subtotal", "total", "created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class InvoiceSerializer(UserStampMixin, serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ("subtotal", "total", "created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class ReceiptSerializer(UserStampMixin, serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class DeliveryNoteSerializer(UserStampMixin, serializers.ModelSerializer):
    lines = DeliveryNoteLineSerializer(many=True, read_only=True)

    class Meta:
        model = DeliveryNote
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))