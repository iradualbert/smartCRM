from django.shortcuts import get_object_or_404, redirect
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from sales.models import Company

from .models import Plan, Subscription
from .serializers import BillingOverviewSerializer, BillingUsageSerializer, PlanSerializer
from .services.utils import (
    get_current_usage,
    get_effective_subscription,
    user_can_manage_billing,
)


class PublicPlanListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        plans = Plan.objects.filter(is_active=True, is_public=True).order_by("display_order", "id")
        return Response(PlanSerializer(plans, many=True).data)


class BillingOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        company_id = request.query_params.get("company")
        if not company_id:
            return Response({"detail": "company is required."}, status=status.HTTP_400_BAD_REQUEST)

        company = get_object_or_404(Company, pk=company_id)

        if not user_can_manage_billing(request.user, company):
            return Response({"detail": "You do not have permission to view billing."}, status=status.HTTP_403_FORBIDDEN)

        subscription = get_effective_subscription(company)
        usage = get_current_usage(company)

        payload = {
            "company_id": str(company.id),
            "subscription": subscription,
            "usage": usage,
            "can_manage_billing": True,
        }
        return Response(BillingOverviewSerializer(payload).data)


class BillingUsageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        company_id = request.query_params.get("company")
        if not company_id:
            return Response({"detail": "company is required."}, status=status.HTTP_400_BAD_REQUEST)

        company = get_object_or_404(Company, pk=company_id)

        if not user_can_manage_billing(request.user, company):
            return Response({"detail": "You do not have permission to view usage."}, status=status.HTTP_403_FORBIDDEN)

        usage = get_current_usage(company)
        return Response(BillingUsageSerializer(usage).data)


class CreateCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response(
            {"detail": "Payments are coming soon. Business access is currently available through the 30-day trial."},
            status=status.HTTP_409_CONFLICT,
        )


class PaymentCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        return Response(
            {"detail": "Payment callbacks are disabled while payments are not yet enabled."},
            status=status.HTTP_410_GONE,
        )
