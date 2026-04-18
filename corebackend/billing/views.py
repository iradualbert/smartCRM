from django.shortcuts import get_object_or_404, redirect
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from sales.models import Company

from .models import Plan, Subscription
from .serializers import BillingOverviewSerializer, BillingUsageSerializer, PlanSerializer
from .services import (
    create_pending_subscription,
    finalize_successful_payment,
    get_current_usage,
    get_effective_subscription,
    mark_payment_failed,
    user_can_manage_billing,
)
from .services_iyzico import create_checkout_form, retrieve_checkout_form


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
        company_id = request.data.get("company")
        plan_code = request.data.get("plan_code")
        currency = (request.data.get("currency") or "TRY").upper()

        if not company_id or not plan_code:
            return Response(
                {"detail": "company and plan_code are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if currency not in {"TRY", "USD"}:
            return Response({"detail": "Unsupported currency."}, status=status.HTTP_400_BAD_REQUEST)

        company = get_object_or_404(Company, pk=company_id)

        if not user_can_manage_billing(request.user, company):
            return Response({"detail": "You do not have permission to manage billing."}, status=status.HTTP_403_FORBIDDEN)

        plan = get_object_or_404(Plan, code=plan_code, is_active=True)

        subscription = create_pending_subscription(
            company=company,
            plan=plan,
            currency=currency,
        )

        result = create_checkout_form(
            subscription=subscription,
            company=company,
            plan=plan,
            currency=currency,
            buyer_email=request.user.email or "billing@example.com",
            buyer_name=request.user.get_full_name() or company.name,
        )

        if result.get("status") != "success":
            mark_payment_failed(subscription=subscription, reason=result.get("errorMessage", "Checkout init failed"))
            return Response(
                {"detail": result.get("errorMessage", "Failed to initialize payment.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subscription.external_checkout_token = result.get("token", "")
        subscription.save(update_fields=["external_checkout_token", "updated_at"])

        return Response(
            {
                "payment_url": result.get("paymentPageUrl"),
                "token": result.get("token", ""),
                "subscription_id": str(subscription.id),
            },
            status=status.HTTP_200_OK,
        )


class PaymentCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token") or request.POST.get("token")
        if not token:
            return Response({"detail": "token is required."}, status=status.HTTP_400_BAD_REQUEST)

        result = retrieve_checkout_form(token)
        subscription = get_object_or_404(Subscription, external_checkout_token=token)

        if result.get("status") == "success" and result.get("paymentStatus") == "SUCCESS":
            finalize_successful_payment(subscription=subscription, external_token=token)
            return Response({"detail": "Payment successful."}, status=status.HTTP_200_OK)

        mark_payment_failed(
            subscription=subscription,
            reason=result.get("errorMessage", "Payment failed."),
        )
        return Response({"detail": result.get("errorMessage", "Payment failed.")}, status=status.HTTP_400_BAD_REQUEST)