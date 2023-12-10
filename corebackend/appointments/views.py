from rest_framework import viewsets, permissions
from .serializers import SlotBookingSerializer
from .models import SlotBooking

# SlotBooking Viewset

def get_available_slots():
    pass 


class SlotBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [
        
    ]
    serializer_class = SlotBookingSerializer
    queryset = SlotBooking.objects.all()
    
def confirm():
    pass 

def cancel():
    pass 

def approve():
    pass

def change_booking():
    pass 