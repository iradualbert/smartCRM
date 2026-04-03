from decimal import Decimal

from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from sales.models import Customer, Quotation, QuotationLine

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
from .serializers import (
    CatalogueCategorySerializer,
    CatalogueItemSerializer,
    CatalogueSerializer,
    ProductDocumentSerializer,
    ProductMediaSerializer,
    ProductSpecificationSerializer,
    PublicCatalogueSerializer,
    PublicQuoteRequestCreateSerializer,
    QuoteRequestConvertSerializer,
    QuoteRequestItemSerializer,
    QuoteRequestSerializer,
)
from .utils import generate_quote_number


class CatalogueViewSet(viewsets.ModelViewSet):
    queryset = Catalogue.objects.select_related("company").prefetch_related("categories", "items__product")
    serializer_class = CatalogueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        company_id = self.request.query_params.get("company")
        status_value = self.request.query_params.get("status")

        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if status_value:
            queryset = queryset.filter(status=status_value)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def publish(self, request, pk=None):
        catalogue = self.get_object()
        catalogue.status = Catalogue.Status.PUBLISHED
        catalogue.save(update_fields=["status", "updated_at"])
        return Response({"status": "published"})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def archive(self, request, pk=None):
        catalogue = self.get_object()
        catalogue.status = Catalogue.Status.ARCHIVED
        catalogue.save(update_fields=["status", "updated_at"])
        return Response({"status": "archived"})

    @action(detail=False, methods=["get"], permission_classes=[AllowAny], url_path=r"public/(?P<token>[^/.]+)")
    def public_detail(self, request, token=None):
        try:
            catalogue = (
                Catalogue.objects.select_related("company")
                .prefetch_related(
                    "categories",
                    "items__category",
                    "items__product__catalogue_media",
                    "items__product__catalogue_documents",
                    "items__product__catalogue_specifications",
                )
                .get(
                    public_token=token,
                    status=Catalogue.Status.PUBLISHED,
                    is_public=True,
                )
            )
        except Catalogue.DoesNotExist:
            return Response({"detail": "Catalogue not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicCatalogueSerializer(catalogue, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny], url_path=r"embed/(?P<token>[^/.]+)")
    def embed_detail(self, request, token=None):
        try:
            catalogue = (
                Catalogue.objects.select_related("company")
                .prefetch_related(
                    "categories",
                    "items__category",
                    "items__product__catalogue_media",
                    "items__product__catalogue_documents",
                    "items__product__catalogue_specifications",
                )
                .get(
                    public_token=token,
                    status=Catalogue.Status.PUBLISHED,
                    is_public=True,
                    allow_embed=True,
                )
            )
        except Catalogue.DoesNotExist:
            return Response({"detail": "Embeddable catalogue not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicCatalogueSerializer(catalogue, context={"request": request})
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path=r"public/(?P<token>[^/.]+)/request-quote",
    )
    def request_quote(self, request, token=None):
        try:
            catalogue = Catalogue.objects.prefetch_related("items__product").get(
                public_token=token,
                status=Catalogue.Status.PUBLISHED,
                is_public=True,
            )
        except Catalogue.DoesNotExist:
            return Response({"detail": "Catalogue not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicQuoteRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        allowed_product_ids = set(
            catalogue.items.filter(is_visible=True, show_in_public=True).values_list("product_id", flat=True)
        )

        with transaction.atomic():
            quote_request = QuoteRequest.objects.create(
                company=catalogue.company,
                catalogue=catalogue,
                customer_name=data["customer_name"],
                company_name=data.get("company_name") or None,
                customer_email=data.get("customer_email") or None,
                customer_phone=data.get("customer_phone") or None,
                country=data.get("country") or None,
                notes=data.get("notes") or None,
                source="catalogue",
            )

            for item in data["items"]:
                product = item.get("product")
                if product and product.id not in allowed_product_ids:
                    return Response(
                        {"detail": f"Product {product.id} is not part of this catalogue."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                QuoteRequestItem.objects.create(
                    quote_request=quote_request,
                    product=product,
                    description=item.get("description") or (product.name if product else ""),
                    quantity=item["quantity"],
                )

        return Response(
            {"id": quote_request.id, "status": quote_request.status},
            status=status.HTTP_201_CREATED,
        )


class CatalogueCategoryViewSet(viewsets.ModelViewSet):
    queryset = CatalogueCategory.objects.select_related("catalogue")
    serializer_class = CatalogueCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        catalogue_id = self.request.query_params.get("catalogue")
        if catalogue_id:
            queryset = queryset.filter(catalogue_id=catalogue_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class CatalogueItemViewSet(viewsets.ModelViewSet):
    queryset = CatalogueItem.objects.select_related("catalogue", "category", "product")
    serializer_class = CatalogueItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        catalogue_id = self.request.query_params.get("catalogue")
        if catalogue_id:
            queryset = queryset.filter(catalogue_id=catalogue_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class ProductMediaViewSet(viewsets.ModelViewSet):
    queryset = ProductMedia.objects.select_related("product")
    serializer_class = ProductMediaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get("product")
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class ProductDocumentViewSet(viewsets.ModelViewSet):
    queryset = ProductDocument.objects.select_related("product")
    serializer_class = ProductDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get("product")
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class ProductSpecificationViewSet(viewsets.ModelViewSet):
    queryset = ProductSpecification.objects.select_related("product")
    serializer_class = ProductSpecificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get("product")
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class QuoteRequestViewSet(viewsets.ModelViewSet):
    queryset = (
        QuoteRequest.objects.select_related("company", "catalogue", "customer", "quotation")
        .prefetch_related("items__product")
    )
    serializer_class = QuoteRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        company_id = self.request.query_params.get("company")
        status_value = self.request.query_params.get("status")

        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if status_value:
            queryset = queryset.filter(status=status_value)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def mark_reviewed(self, request, pk=None):
        obj = self.get_object()
        obj.status = QuoteRequest.Status.REVIEWED
        obj.updated_by = request.user
        obj.save(update_fields=["status", "updated_by", "updated_at"])
        return Response({"status": obj.status})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def convert_to_quotation(self, request, pk=None):
        quote_request = self.get_object()
        serializer = QuoteRequestConvertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if quote_request.quotation_id:
            return Response(
                {"detail": "This quote request has already been converted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            customer = data.get("customer_id") or quote_request.customer
            if not customer:
                customer = Customer.objects.create(
                    company=quote_request.company,
                    name=quote_request.customer_name,
                    email=quote_request.customer_email or None,
                    phone_number=quote_request.customer_phone or None,
                    address=quote_request.country or None,
                    created_by=request.user,
                    updated_by=request.user,
                )

            quotation = Quotation.objects.create(
                company=quote_request.company,
                customer=customer,
                name=data.get("quotation_name") or f"Quotation for {quote_request.customer_name}",
                description=quote_request.notes,
                quote_number=generate_quote_number(quote_request.company),
                status=Quotation.Status.DRAFT,
                currency=quote_request.company.default_currency,
                created_by=request.user,
                updated_by=request.user,
            )

            for item in quote_request.items.all():
                unit_price = Decimal("0.00")
                if item.product and item.product.default_price is not None:
                    unit_price = item.product.default_price

                QuotationLine.objects.create(
                    quotation=quotation,
                    product=item.product,
                    description=item.description or (item.product.name if item.product else ""),
                    quantity=item.quantity,
                    unit_price=unit_price,
                    created_by=request.user,
                    updated_by=request.user,
                )

            quotation.recalculate_totals()

            quote_request.customer = customer
            quote_request.quotation = quotation
            quote_request.status = QuoteRequest.Status.CONVERTED
            quote_request.updated_by = request.user
            quote_request.save(
                update_fields=["customer", "quotation", "status", "updated_by", "updated_at"]
            )

        return Response(
            {
                "quotation_id": quotation.id,
                "quote_number": quotation.quote_number,
                "status": quote_request.status,
            }
        )


class QuoteRequestItemViewSet(viewsets.ModelViewSet):
    queryset = QuoteRequestItem.objects.select_related("quote_request", "product")
    serializer_class = QuoteRequestItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        quote_request_id = self.request.query_params.get("quote_request")
        if quote_request_id:
            queryset = queryset.filter(quote_request_id=quote_request_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)