from django.db import models
from mail_service.models import Mail

class Contact(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    cc = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.company}"
    
    def send_email(self, subject, body, schedule_datetime=None):
        mail = Mail(
            to=self.email,
            subject = subject,
            body=body
        )
        if schedule_datetime:
            mail.schedule_datetime = schedule_datetime
            mail.schedule()
        else:
            mail.send()