import json
import re
from django.db.models import Q
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from .serializers import MailSerializer, MailTemplateSerializer
from .models import Mail, MailTemplate, MailAttachment, BulkMail
from common.helpers import IsOwnerPermission, build_mail_from_template


class BulkMailViewSet(viewsets.ViewSet):
    
    def update(self, request):
        bulk_mail = BulkMail.objects.get(id=request.id, user=request.user)
        data = request.data
        default_values = json.loads(data.get('paramDefaultValues'))
        failed = {}
        total_saved = 0
        for index, row in enumerate(json.loads(data.get('mailRows'))):
            row_mail = build_mail_from_template(json.dumps(bulk_mail.template), row, default_values)
            row_mail_serializer = MailSerializer(data={**row_mail, "bulk_mail": bulk_mail})
            if not row_mail_serializer.is_valid():
                failed[index] = row_mail_serializer.errors
            else:
                total_saved += 1   
            return Response({"bulk_mail_id": bulk_mail.id, "total_saved": total_saved, "errors": failed}, status=201)
        
    def create(self, request):
        user = request.user
        bulk_mail = BulkMail(user=user)
        data = request.data
        template = data.get("template")
        total_saved = 0
        mail_serializer = MailSerializer(data=json.loads(template))
        if mail_serializer.is_valid(raise_exception=True):
            bulk_mail.template = json.loads(template)
            bulk_mail.save()
            for attachFile in request.FILES.getlist("attachment"):
                mail_attachment = MailAttachment(
                    bulk_mail=bulk_mail,
                    attachment_file=attachFile
                )
                mail_attachment.save()
            default_values = json.loads(data.get('paramDefaultValues'))
            failed = {}
            for index, row in enumerate(json.loads(data.get('mailRows'))):
                row_mail = build_mail_from_template(template, row, default_values)
                row_mail_serializer = MailSerializer(data={**row_mail, "bulk_mail": bulk_mail})
                if not row_mail_serializer.is_valid():
                    failed[index] = row_mail_serializer.errors
                else:
                    total_saved += 1
                    #row_mail_serializer.save()
            return Response({"bulk_mail_id": bulk_mail.id, "total_saved": total_saved, "errors": failed}, status=201)


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
            
            for attachFile in request.FILES.getlist("attachment"):
                mail_attachment = MailAttachment(
                    mail=mail,
                    attachment_file=attachFile
                )
                mail_attachment.save()
            # if(request.data.get('schedule_datetime')):
            #     pass 
            # elif mail.user.account.has_gmail_scope():
            #     mail.send_with_google_oauth()
        return Response(mail_serializer.data)
    

class MailTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = MailTemplateSerializer
    permission_classes = [IsOwnerPermission, ]
    
    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user=user)
        
    def get_queryset(self):
        return MailTemplate.objects.filter(user=self.request.user)