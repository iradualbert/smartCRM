from django.utils.text import slugify

from sales.models import Company, Quotation


def generate_catalogue_slug(name: str) -> str:
    return slugify(name) or "catalogue"


def generate_category_slug(name: str) -> str:
    return slugify(name) or "category"


def generate_quote_number(company: Company) -> str:
    prefix = company.quotation_prefix or "QUO"
    count = Quotation.objects.filter(company=company).count() + 1
    return f"{prefix}-{count:04d}"