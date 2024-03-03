from rest_framework import routers
from .views import ContactViewSet, ContactCategoryViewSet, subscribe_link
from django.urls import path

router = routers.DefaultRouter()

router.register('contacts', ContactViewSet, 'contacts')
router.register('contact-categories', ContactCategoryViewSet, 'contact-categories')

urlpatterns = [
    path("subscriptions/<id>", subscribe_link)
]