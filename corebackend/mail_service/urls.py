from django.urls import path, include
from rest_framework import routers
from .views import MailViewSet, MailTemplateViewSet

router = routers.DefaultRouter()

router.register('mails', MailViewSet, 'mails')
router.register('templates', MailTemplateViewSet, 'mailtemplates')

urlpatterns = router.urls

# urlpatterns = [
#     path('', include(router.urls))
    
# ]