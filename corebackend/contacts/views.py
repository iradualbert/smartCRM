from .models import Contact
from .serializers import ContactSerializer
from rest_framework import viewsets

# Contact Viewset

class ContactViewSet(viewsets.ModelViewSet):
    permission_classes = [
        
    ]
    serializer_class = ContactSerializer
    queryset = Contact.objects.all()