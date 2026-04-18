from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class PlanDefinition:
    code: str
    name: str
    price_try: Decimal
    price_usd: Decimal
    is_default: bool
    is_public: bool
    max_organizations: int
    max_users: int
    max_documents_per_month: int | None
    max_emails_per_month: int | None
    max_storage_mb: int | None
    allow_custom_templates: bool
    allow_pdf_generation: bool
    allow_email_sending: bool
    allow_ai_quote_extraction: bool
    allow_catalog_management: bool
    allow_branding_removal: bool
    display_order: int
    is_contact_only: bool = False


PLAN_DEFINITIONS = [
    PlanDefinition(
        code="free",
        name="Free Plan",
        price_try=Decimal("0.00"),
        price_usd=Decimal("0.00"),
        is_default=True,
        is_public=True,
        max_organizations=1,
        max_users=1,
        max_documents_per_month=20,
        max_emails_per_month=5,
        max_storage_mb=100,
        allow_custom_templates=False,
        allow_pdf_generation=True,
        allow_email_sending=False,
        allow_ai_quote_extraction=False,
        allow_catalog_management=False,
        allow_branding_removal=False,
        display_order=10,
    ),
    PlanDefinition(
        code="starter",
        name="Business Plan",
        price_try=Decimal("200.00"),
        price_usd=Decimal("6.00"),
        is_default=False,
        is_public=True,
        max_organizations=1,
        max_users=3,
        max_documents_per_month=200,
        max_emails_per_month=200,
        max_storage_mb=1000,
        allow_custom_templates=False,
        allow_pdf_generation=True,
        allow_email_sending=True,
        allow_ai_quote_extraction=False,
        allow_catalog_management=False,
        allow_branding_removal=False,
        display_order=20,
    ),
    PlanDefinition(
        code="business_plus",
        name="Business Plus",
        price_try=Decimal("800.00"),
        price_usd=Decimal("25.00"),
        is_default=False,
        is_public=False,
        max_organizations=3,
        max_users=10,
        max_documents_per_month=2000,
        max_emails_per_month=1000,
        max_storage_mb=10000,
        allow_custom_templates=True,
        allow_pdf_generation=True,
        allow_email_sending=True,
        allow_ai_quote_extraction=True,
        allow_catalog_management=True,
        allow_branding_removal=True,
        display_order=30,
    ),
    PlanDefinition(
    code="enterprise",
    name="Enterprise",
    price_try=Decimal("0.00"),
    price_usd=Decimal("0.00"),
    is_default=False,
    is_public=True,
    max_organizations=5,
    max_users=20,
    max_documents_per_month=None,
    max_emails_per_month=None,
    max_storage_mb=None,
    allow_custom_templates=True,
    allow_pdf_generation=True,
    allow_email_sending=True,
    allow_ai_quote_extraction=True,
    allow_catalog_management=True,
    allow_branding_removal=True,
    display_order=40,
    is_contact_only=True
)
]