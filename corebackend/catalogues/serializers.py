from decimal import Decimal

from rest_framework import serializers

from sales.models import Customer, Product, Quotation, QuotationLine

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


class UserStampMixin:
    def _set_user_fields(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            if not self.instance:
                validated_data["created_by"] = request.user
            validated_data["updated_by"] = request.user
        return validated_data


class CatalogueCategorySerializer(UserStampMixin, serializers.ModelSerializer):
    class Meta:
        model = CatalogueCategory
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class CatalogueSerializer(UserStampMixin, serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    categories = CatalogueCategorySerializer(many=True, read_only=True)
    hero_image_url = serializers.SerializerMethodField()
    catalogue_pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Catalogue
        fields = "__all__"
        read_only_fields = (
            "public_token",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "company_name",
            "categories",
            "hero_image_url",
            "catalogue_pdf_url",
        )

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image:
            url = obj.hero_image.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_catalogue_pdf_url(self, obj):
        request = self.context.get("request")
        if obj.catalogue_pdf:
            url = obj.catalogue_pdf.url
            return request.build_absolute_uri(url) if request else url
        return None

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class CatalogueItemSerializer(UserStampMixin, serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    display_name = serializers.ReadOnlyField()
    display_description = serializers.ReadOnlyField()
    display_price = serializers.ReadOnlyField()

    class Meta:
        model = CatalogueItem
        fields = "__all__"
        read_only_fields = (
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "product_name",
            "product_sku",
            "display_name",
            "display_description",
            "display_price",
        )

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class ProductMediaSerializer(UserStampMixin, serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductMedia
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by", "file_url")

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return obj.external_url

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class ProductDocumentSerializer(UserStampMixin, serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductDocument
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by", "file_url")

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return None

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class ProductSpecificationSerializer(UserStampMixin, serializers.ModelSerializer):
    display_value = serializers.SerializerMethodField()

    class Meta:
        model = ProductSpecification
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by", "display_value")

    def get_display_value(self, obj):
        return f"{obj.value} {obj.unit}".strip() if obj.unit else obj.value

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class QuoteRequestItemSerializer(UserStampMixin, serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = QuoteRequestItem
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "created_by", "updated_by", "product_name")

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


class QuoteRequestSerializer(UserStampMixin, serializers.ModelSerializer):
    items = QuoteRequestItemSerializer(many=True, read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)
    catalogue_name = serializers.CharField(source="catalogue.name", read_only=True)

    class Meta:
        model = QuoteRequest
        fields = "__all__"
        read_only_fields = (
            "submitted_at",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "company_name",
            "catalogue_name",
        )

    def create(self, validated_data):
        return super().create(self._set_user_fields(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._set_user_fields(validated_data))


# Public-facing serializers

class PublicProductMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductMedia
        fields = ("id", "media_type", "url", "alt_text", "sort_order", "is_primary")

    def get_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return obj.external_url


class PublicProductDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductDocument
        fields = ("id", "title", "document_type", "file_url", "sort_order")

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return None


class PublicProductSpecificationSerializer(serializers.ModelSerializer):
    display_value = serializers.SerializerMethodField()

    class Meta:
        model = ProductSpecification
        fields = ("id", "name", "value", "unit", "display_value", "sort_order", "is_highlight")

    def get_display_value(self, obj):
        return f"{obj.value} {obj.unit}".strip() if obj.unit else obj.value


class PublicCatalogueItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    sku = serializers.CharField(source="product.sku", read_only=True)
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    long_description = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    primary_image_url = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    specifications = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()

    class Meta:
        model = CatalogueItem
        fields = (
            "id",
            "product_id",
            "name",
            "sku",
            "short_description",
            "long_description",
            "price",
            "badge_text",
            "stock_label",
            "primary_image_url",
            "images",
            "documents",
            "specifications",
            "category",
        )

    def get_name(self, obj):
        return obj.display_name

    def get_short_description(self, obj):
        text = obj.display_description or ""
        return text[:160]

    def get_long_description(self, obj):
        return obj.display_description or ""

    def get_price(self, obj):
        catalogue = obj.catalogue
        if not catalogue.show_prices:
            return None
        value = obj.display_price
        return str(value) if value is not None else None

    def get_primary_image_url(self, obj):
        request = self.context.get("request")
        primary = obj.product.catalogue_media.filter(is_primary=True).first()
        first_item = primary or obj.product.catalogue_media.first()
        if not first_item:
            return None
        if first_item.image:
            url = first_item.image.url
            return request.build_absolute_uri(url) if request else url
        return first_item.external_url

    def get_images(self, obj):
        qs = obj.product.catalogue_media.all()
        return PublicProductMediaSerializer(qs, many=True, context=self.context).data

    def get_documents(self, obj):
        qs = obj.product.catalogue_documents.all()
        return PublicProductDocumentSerializer(qs, many=True, context=self.context).data

    def get_specifications(self, obj):
        qs = obj.product.catalogue_specifications.all()
        return PublicProductSpecificationSerializer(qs, many=True).data

    def get_category(self, obj):
        if not obj.category:
            return None
        return {
            "id": obj.category.id,
            "name": obj.category.name,
            "slug": obj.category.slug,
        }


class PublicCatalogueCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogueCategory
        fields = ("id", "name", "slug", "sort_order")


class PublicCatalogueSerializer(serializers.ModelSerializer):
    company = serializers.SerializerMethodField()
    categories = PublicCatalogueCategorySerializer(many=True, read_only=True)
    hero_image_url = serializers.SerializerMethodField()
    catalogue_pdf_url = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()

    class Meta:
        model = Catalogue
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "public_token",
            "show_prices",
            "hero_image_url",
            "catalogue_pdf_url",
            "company",
            "categories",
            "items",
        )

    def get_company(self, obj):
        request = self.context.get("request")
        logo_url = None
        if obj.company.logo:
            url = obj.company.logo.url
            logo_url = request.build_absolute_uri(url) if request else url
        return {
            "id": obj.company.id,
            "name": obj.company.name,
            "logo_url": logo_url,
        }

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image:
            url = obj.hero_image.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_catalogue_pdf_url(self, obj):
        request = self.context.get("request")
        if obj.catalogue_pdf:
            url = obj.catalogue_pdf.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_items(self, obj):
        qs = (
            obj.items.filter(is_visible=True, show_in_public=True)
            .select_related("product", "category")
            .prefetch_related(
                "product__catalogue_media",
                "product__catalogue_documents",
                "product__catalogue_specifications",
            )
        )
        return PublicCatalogueItemSerializer(qs, many=True, context=self.context).data


class PublicQuoteRequestItemInputSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)


class PublicQuoteRequestCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=255)
    company_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    customer_phone = serializers.CharField(required=False, allow_blank=True, max_length=50)
    country = serializers.CharField(required=False, allow_blank=True, max_length=120)
    notes = serializers.CharField(required=False, allow_blank=True)
    items = PublicQuoteRequestItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value


class QuoteRequestConvertSerializer(serializers.Serializer):
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        required=False,
        allow_null=True,
    )
    quotation_name = serializers.CharField(required=False, allow_blank=True, max_length=255)