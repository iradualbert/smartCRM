import os
from django.db import models
from django.utils import timezone
import smtplib, ssl, email
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from django.core.validators import MaxValueValidator
from django.contrib.auth.models import User
import base64
from googleapiclient.errors import HttpError
import google
from googleapiclient.discovery import build


send_with_smartCRM = "<p><a href='smartcrm.com'>Sent With smartCRM<a/></p>"

class Mail(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name="mails")
    to = models.TextField()
    cc = models.TextField(blank=True, null=True)
    bcc = models.TextField(blank=True, null=True)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    schedule_datetime = models.DateTimeField(blank=True, null=True)
    is_sent = models.BooleanField(default=False)
    sent_datetime = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    failed = models.BooleanField(default=False)
    failure_reason = models.TextField(blank=True)
    message_id = models.CharField(max_length=100, null=True, blank=True)
    

    def __str__(self):
        return self.subject
    
    class Meta:
        ordering = ["-created_at"]
        
    def set_has_sent(self, message_id=None):
        self.is_sent = True
        self.sent_datetime = timezone.now()
        self.failed = False
        self.failure_reason = ''
        self.message_id = message_id
        self.save()
        
        
    def set_has_failed(self, e):
        self.failed = True
        self.failure_reason = e
        self.save()
        
    def get_user_credentials(self):
        return {
            "signature": "",
            "email": "",
            "password": ''
        }
        
    def build(self):
        message = MIMEMultipart()
        message_body= MIMEText(self.body,'html')            
        message.attach(message_body)
        message["To"] = self.to
        message["From"] =self.user.email
        message["Cc"] = self.cc
        message["Subject"] = self.subject
        for attach in self.attachments.all():
            _file = attach.attachment_file
            filepath = _file.path
            
            with open(filepath, "rb") as attachment:
                # Add file as application/octet-stream
                # Email client can usually download this automatically as attachment
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename= {os.path.basename(filepath)}",
                    )
                message.attach(part)   
        return message
        
    def send_with_google_oauth(self):
        credentials =google.oauth2.credentials.Credentials(**self.user.account.google_account)
        #credentials =google.auth.external_account_authorized_user.Credentials(**self.user.account.google_account)
        send_message = None
        try:
            service = build("gmail", "v1", credentials=credentials)
            message = self.build()
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            create_message = {"raw": encoded_message}
            send_message = (
                service.users()
                .messages()
                .send(userId="me", body=create_message)
                .execute()
            )
            print(f'Message Id: {send_message["id"]}')
            self.set_has_sent(send_message["id"])
        except HttpError as error:
            print(f"An error occurred: {error}")
            send_message = None
            self.set_has_failed(error)
        except google.auth.exceptions.RefreshError as error:
            self.set_has_failed(error)
        return send_message
    
    def send(self):
        credentials = self.get_user_credentials()
        sender_email = credentials["email"]
        password = credentials["password"]
        signature = credentials["signature"]
        message = MIMEMultipart()
        message["Subject"] = self.subject
        message["From"] = sender_email
        message["To"] = self.to
        message["Cc"] = self.cc
        message["Bcc"] = self.bcc
        
        part1 = MIMEText(self.body, "html")
        part2 = MIMEText(signature, "html")
        message.attach(part1)
        message.attach(part2)
        
        for attach in self.attachments.all():
            
            _file = attach.attachment_file
            filepath = _file.path
            
            with open(filepath, "rb") as attachment:
                # Add file as application/octet-stream
                # Email client can usually download this automatically as attachment
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename= {os.path.basename(filepath)}",
                    )
                message.attach(part)     

        context = ssl.create_default_context()
        
        
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            try:
                server.login(sender_email, credentials["password"])
                server.sendmail(
                    sender_email, self.to, message.as_string()
                    )
                self.is_sent = True
                self.sent_datetime = timezone.now()
                self.failed = False
                self.failure_reason = ''
                self.save()
            
            except smtplib.SMTPAuthenticationError as e:
                self.failed = True
                self.failure_reason = e
                self.save()


def attachment_upload_path(instance, filename):
    return f'attachments/{instance.mail.id}/{filename}'


class MailAttachment(models.Model):
    mail = models.ForeignKey(Mail, on_delete=models.CASCADE, related_name="attachments")
    attachment_file = models.FileField(
        upload_to=attachment_upload_path, 
        validators=[
            MaxValueValidator(limit_value=20 * 1024 * 1024)  # 20 MB
        ]
        )
    
    def __str__(self):
        return self.attachment_file.name
    
class MailTemplate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mail_templates")
    name = models.CharField(max_length=200)
    subject = models.CharField(max_length=700, null=True, blank=True)
    body = models.TextField(blank=True)
    parameters = models.JSONField()
    
    def __str__(self) -> str:
        return self.name