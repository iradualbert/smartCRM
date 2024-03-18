from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from rest_framework import routers
from mail_service.urls import router as router_mail
from appointments.urls import router as router_appoint
from contacts.urls import router as router_contact

router = routers.DefaultRouter()
router.registry.extend(router_mail.registry)
router.registry.extend(router_appoint.registry)
router.registry.extend(router_contact.registry)


urlpatterns = [
    
    path('admin-beinpark/', admin.site.urls),
    path('api/', include(router.urls)),
    path('', include('accounts.urls')),
    path("api/", include('contacts.urls')),
    path("", include("common.urls")),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)