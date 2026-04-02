from dataclasses import dataclass


@dataclass(frozen=True)
class PlanSpec:
    max_documents_per_month: int | None
    max_emails_per_month: int | None
    max_storage_mb: int | None
    can_send_email: bool
    can_use_custom_templates: bool
    can_remove_branding: bool


PLAN_SPECS = {
    "free": PlanSpec(
        max_documents_per_month=10,
        max_emails_per_month=5,
        max_storage_mb=100,
        can_send_email=False,
        can_use_custom_templates=False,
        can_remove_branding=False,
    ),
    "monthly": PlanSpec(
        max_documents_per_month=None,
        max_emails_per_month=500,
        max_storage_mb=5000,
        can_send_email=True,
        can_use_custom_templates=True,
        can_remove_branding=True,
    ),
    "yearly": PlanSpec(
        max_documents_per_month=None,
        max_emails_per_month=1000,
        max_storage_mb=10000,
        can_send_email=True,
        can_use_custom_templates=True,
        can_remove_branding=True,
    ),
}