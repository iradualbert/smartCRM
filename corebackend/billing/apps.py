from django.apps import AppConfig

class BillingConfig(AppConfig):
    name = "billing"

    def ready(self):
        from django.db.utils import OperationalError, ProgrammingError
        from billing.services.plans import PLAN_DEFINITIONS
        from billing.models import Plan

        try:
            for p in PLAN_DEFINITIONS:
                Plan.objects.update_or_create(
                    code=p.code,
                    defaults={
                        "name": p.name,
                        "price_try": p.price_try,
                        "price_usd": p.price_usd,
                        "is_active": True,
                        "is_default": p.is_default,
                        "is_public": p.is_public,
                        "max_users": p.max_users,
                        "max_documents_per_month": p.max_documents_per_month,
                        "max_emails_per_month": p.max_emails_per_month,
                        "max_storage_mb": p.max_storage_mb,
                        "allow_email_sending": p.allow_email_sending,
                        "allow_ai_quote_extraction": p.allow_ai_quote_extraction,
                        "allow_catalog_management": p.allow_catalog_management,
                        "is_contact_only": p.is_contact_only,
                    },
                )
        except (OperationalError, ProgrammingError):
            pass