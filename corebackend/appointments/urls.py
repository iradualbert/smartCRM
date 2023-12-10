from django.urls import path, include
from rest_framework import routers
from .views import SlotBookingViewSet

router = routers.DefaultRouter()

router.register('slots', SlotBookingViewSet, 'slots')

urlpatterns = router.urls

# [
#     path('', include(router.urls))
# ]
#router.urls