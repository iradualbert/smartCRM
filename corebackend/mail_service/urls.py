from django.urls import path, include
from rest_framework import routers
from .views import MailViewSet, MailTemplateViewSet, BulkMailViewSet

router = routers.DefaultRouter()

router.register('mails', MailViewSet, 'mails')
router.register('templates', MailTemplateViewSet, 'mailtemplates')
router.register('bulk-mails', BulkMailViewSet, 'bulk-mails')

# urlpatterns = router.urls

urlpatterns = router.urls