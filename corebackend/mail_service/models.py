from email.utils import formataddr
import os
from django.db import models
from django.utils import timezone
import smtplib, ssl
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
from accounts.models import Account
from django.template.loader import render_to_string
from django.core.mail import EmailMessage



send_with_smartCRM = "<p><a href='beinpark.com'>Sent With Beinpark<a/></p>"

class BulkMail(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bulk_mails")
    template = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    

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
    bulk_mail = models.ForeignKey(BulkMail, on_delete=models.SET_NULL, null=True, related_name="mails")
    

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
        account = Account.objects.get(user=self.user)
        return account.mail_settings
        
    def build(self):
        message = MIMEMultipart()
        message_body= MIMEText(self.body,'html')            
        message.attach(message_body)
        message["To"] = self.to
        message["From"] =formataddr((self.user.first_name, self.user.email))
        message["Cc"] = self.cc
        message["Subject"] = self.subject
        attachments = self.bulk_mail.attachments.all() if self.bulk_mail else self.attachments.all()
        for attach in attachments:
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
    
    def send_with_smtp(self):
        credentials = self.get_user_credentials()
        sender_email = credentials.get("email")
        if not sender_email:
            self.failed = True
            self.failure_reason = "No email configuration was found for this account. Set email configuration and try again"
            self.save()
            return 
        password = credentials.get("password")
        host = credentials.get("host")
        port = credentials.get("port")
        signature = credentials.get("signature", "")
        message = MIMEMultipart()
        message["Subject"] = self.subject
        message["From"] = formataddr((credentials.get("default_name"), sender_email))
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
        
        
        with smtplib.SMTP_SSL(host, 465, context=context) as server:
            try:
                server.login(sender_email, password)
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
                self.failure_reason = "Failed to authenticate. Check your email configuration"
                self.save()
                
            except Exception as e:
                self.failed = True
                self.failure_reason = e
                self.save()


def attachment_upload_path(instance, filename):
    if instance.mail:
        return f'attachments/{instance.mail.id}/{filename}'
    else:
        return f'attachments/bulk-mails/{instance.bulk_mail.id}/{filename}'


class MailAttachment(models.Model):
    bulk_mail = models.ForeignKey(BulkMail, on_delete=models.CASCADE, related_name="attachments", null=True)
    mail = models.ForeignKey(Mail, on_delete=models.CASCADE, related_name="attachments", null=True)
    attachment_file = models.FileField(
        upload_to=attachment_upload_path, 
        )
    
    def __str__(self):
        return self.attachment_file.name
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(bulk_mail__isnull=False) | models.Q(mail__isnull=False),
                name="either_mail_or_bulk_email_is_required",
                #msg="Both mail and bulk_mail fields can not be empty. At least one must be provided"
            )
        ]
    
class MailTemplate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mail_templates")
    name = models.CharField(max_length=200)
    to = models.TextField(blank=True)
    cc = models.TextField(blank=True)
    subject = models.CharField(max_length=700, null=True, blank=True)
    body = models.TextField(blank=True)
    parameters = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self) -> str:
        return self.name
    

class EmailUsage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    emails_sent = models.IntegerField(default=0)
    contacts_created = models.IntegerField(default=0)
    is_limit_warning_email_sent = models.BooleanField(default=False)
    is_limit_reached_email_sent = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('user', 'date')
        
    
    @classmethod
    def record_email_sent(cls, user, date):
        obj, created = cls.objects.get_or_create(user=user, date=date)
        if not created:
            if obj.user.account.plan.max_emails_per_day <= obj.emails_sent:
                return obj, True
           
        obj.emails_sent += 1
        obj.save()
        return obj, False
            
            
    def send_limit_warning_email(self, limit):
        current_usage = (self.emails_sent / limit)
        email_subject = f"Beinpark - About to reach the daily limit."
        message = render_to_string('reset-password.html', {
            "user": self.user,
            'total_remaining': limit - current_usage,
        })
        email_message = EmailMessage(email_subject, message, from_email="Beinpark", to=[self.user.email])
        email_message.send()
        self.is_limit_warning_email_sent = True
        self.save()
        
           
    def send_limit_reached_email(self):
        email_subject = f"Beinpark - Daily limit reached."
        message = render_to_string('limit_reached.html', {
            "user": self.user,
            'max_emails_per_day': self.emails_sent,
        })
        email_message = EmailMessage(email_subject, message,from_email="Beinpark", to=[self.user.email])
        email_message.send() 
        self.is_limit_reached_email_sent = True
        self.save()          
    
    