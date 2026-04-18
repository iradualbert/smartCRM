from decimal import Decimal

import iyzipay
from django.conf import settings


def _options():

    return {
        "api_key": settings.IYZICO_API_KEY,
        "secret_key": settings.IYZICO_SECRET_KEY,
        "base_url": settings.IYZICO_BASE_URL,
    }


def create_checkout_form(*, subscription, company, plan, currency: str, buyer_email: str, buyer_name: str):
    amount = plan.price_try if currency == "TRY" else plan.price_usd
    amount_str = str(Decimal(amount).quantize(Decimal("0.01")))

    request = {
        "locale": "tr",
        "conversationId": str(subscription.id),
        "price": amount_str,
        "paidPrice": amount_str,
        "currency": currency,
        "basketId": str(subscription.id),
        "paymentGroup": "SUBSCRIPTION",
        "callbackUrl": f"{settings.APP_BASE_URL}/api/billing/callback/",
        "enabledInstallments": [1],
        "buyer": {
            "id": str(company.id),
            "name": buyer_name or company.name,
            "surname": "-",
            "email": buyer_email,
            "identityNumber": "11111111111",
            "registrationAddress": "N/A",
            "city": "Istanbul",
            "country": "Turkey",
            "zipCode": "34000",
            "ip": "127.0.0.1",
        },
        "billingAddress": {
            "contactName": buyer_name or company.name,
            "city": "Istanbul",
            "country": "Turkey",
            "address": "N/A",
            "zipCode": "34000",
        },
        "basketItems": [
            {
                "id": str(plan.id),
                "name": f"{plan.name} Plan",
                "category1": "SaaS",
                "itemType": "VIRTUAL",
                "price": amount_str,
            }
        ],
    }

    result = iyzipay.CheckoutFormInitialize().create(request, _options())
    return result


def retrieve_checkout_form(token: str):
    request = {
        "locale": "tr",
        "token": token,
    }
    result = iyzipay.CheckoutForm().retrieve(request, _options())
    return result