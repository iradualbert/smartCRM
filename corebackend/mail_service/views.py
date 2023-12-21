from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from .serializers import MailSerializer, MailTemplateSerializer
from .models import Mail, MailTemplate, MailAttachment




# Mail Viewset

class MailViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = MailSerializer
    
    def get_queryset(self):
        user = self.request.user
        query = self.request.GET.get("query")
        
        if query:
            return Mail.objects.filter(Q(to__icontains=query)|Q(subject__icontains=query), user=user)
        return Mail.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        user = self.request.user
        mail_serializer = MailSerializer(data=request.data)
        
        if mail_serializer.is_valid(raise_exception=True):
            mail = mail_serializer.save(user=user)
            
            for attach in request.FILES.getlist("attachment"):
                mail_attachment = MailAttachment(
                    mail=mail,
                    attachment_file=attach
                )
                mail_attachment.save()
            # if(request.data.get('schedule_datetime')):
            #     pass 
            # elif mail.user.account.has_gmail_scope():
            #     mail.send_with_google_oauth()
        return Response(mail_serializer.data)
    

class MailTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = MailTemplateSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user=user)
        
    def get_queryset(self):
        return MailTemplate.objects.filter(user=self.request.user)