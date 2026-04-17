from .views import BaseModelViewSet
from .models import Customer, Product
from .serializers import CustomerSerializer, ProductSerializer
from django.db import models

class CustomerViewSet(BaseModelViewSet):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.none()  # Placeholder, actual queryset is defined in get_queryset()

    def get_queryset(self):
        user = self.request.user
        queryset = Customer.objects.select_related("company").all()

        if not user.is_superuser:
            queryset = queryset.filter(
                company__memberships__user=user,
                company__memberships__is_active=True,
            )

        company_id = self.request.query_params.get("company")
        if company_id:
            queryset = queryset.filter(company_id=company_id)

        search = (self.request.query_params.get("search") or "").strip()
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search)
                | models.Q(email__icontains=search)
                | models.Q(phone_number__icontains=search)
                | models.Q(address__icontains=search)
            )

        return queryset.distinct().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class ProductViewSet(BaseModelViewSet):
    serializer_class = ProductSerializer
    queryset = Product.objects.none()  # Placeholder, actual queryset is defined in get_queryset()

    def get_queryset(self):
        user = self.request.user
        queryset = Product.objects.select_related("company").all()

        if not user.is_superuser:
            queryset = queryset.filter(
                company__memberships__user=user,
                company__memberships__is_active=True,
            )

        company_id = self.request.query_params.get("company")
        if company_id:
            queryset = queryset.filter(company_id=company_id)

        search = (self.request.query_params.get("search") or "").strip()
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search)
                | models.Q(sku__icontains=search)
                | models.Q(description__icontains=search)
            )

        return queryset.distinct().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)