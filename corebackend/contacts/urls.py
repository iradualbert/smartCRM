from rest_framework import routers
from .views import ContactViewSet, ContactCategoryViewSet

router = routers.DefaultRouter()

router.register('contacts', ContactViewSet, 'contacts')
router.register('contact-categories', ContactCategoryViewSet, 'contact-categories')

urlpatterns = router.urls