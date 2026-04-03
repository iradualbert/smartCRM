from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CatalogueCategoryViewSet,
    CatalogueItemViewSet,
    CatalogueViewSet,
    ProductDocumentViewSet,
    ProductMediaViewSet,
    ProductSpecificationViewSet,
    QuoteRequestItemViewSet,
    QuoteRequestViewSet,
)

router = DefaultRouter()
router.register(r"catalogues", CatalogueViewSet)
router.register(r"catalogue-categories", CatalogueCategoryViewSet)
router.register(r"catalogue-items", CatalogueItemViewSet)
router.register(r"product-media", ProductMediaViewSet)
router.register(r"product-documents", ProductDocumentViewSet)
router.register(r"product-specifications", ProductSpecificationViewSet)
router.register(r"quote-requests", QuoteRequestViewSet)
router.register(r"quote-request-items", QuoteRequestItemViewSet)

urlpatterns = [
    path("", include(router.urls)),
]


# Key public endpoints
# GET /catalogues/public/<token>/
# GET /catalogues/embed/<token>/
# POST /catalogues/public/<token>/request-quote/
# Internal endpoints
# /catalogues/
# /catalogue-categories/
# /catalogue-items/
# /product-media/
# /product-documents/
# /product-specifications/
# /quote-requests/
