from django.contrib.auth.models import User
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view
from .serializers import MailSerializer, MailTemplateSerializer
from .models import Mail, MailTemplate



# Mail Viewset

class MailViewSet(viewsets.ModelViewSet):
    permission_classes = [
        
    ]
    serializer_class = MailSerializer
    queryset = Mail.objects.all()
    

class MailTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = MailTemplateSerializer
    queryset = MailTemplate.objects.all()
    
    def perform_create(self, serializer):
        user = User.objects.all()[0]
        serializer.save(user=user)