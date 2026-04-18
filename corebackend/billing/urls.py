from django.urls import path

from .views import (
    BillingOverviewView,
    BillingUsageView,
    CreateCheckoutView,
    PaymentCallbackView,
    PublicPlanListView,
)

urlpatterns = [
    path("plans/", PublicPlanListView.as_view(), name="billing-plans"),
    path("overview/", BillingOverviewView.as_view(), name="billing-overview"),
    path("usage/", BillingUsageView.as_view(), name="billing-usage"),
    path("checkout/", CreateCheckoutView.as_view(), name="billing-checkout"),
    path("callback/", PaymentCallbackView.as_view(), name="billing-callback"),
]