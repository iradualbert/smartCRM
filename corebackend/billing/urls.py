from django.urls import path

from .views import (
    BillingOverviewView,
    BillingUsageView,
    CreateCheckoutView,
    PaymentCallbackView,
    PublicPlanListView,
)

urlpatterns = [
    path("billing/plans/", PublicPlanListView.as_view(), name="billing-plans"),
    path("billing/overview/", BillingOverviewView.as_view(), name="billing-overview"),
    path("billing/usage/", BillingUsageView.as_view(), name="billing-usage"),
    path("billing/checkout/", CreateCheckoutView.as_view(), name="billing-checkout"),
    path("billing/callback/", PaymentCallbackView.as_view(), name="billing-callback"),
]