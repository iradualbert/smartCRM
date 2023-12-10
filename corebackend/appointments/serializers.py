# serializers.py

from rest_framework import serializers
from .models import SlotBooking

class SlotBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SlotBooking
        fields = '__all__'
