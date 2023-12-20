from django.contrib.auth.models import User
from django.db import models
from mail_service.models import Mail

class ContactCategory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contact_categories")
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self) -> str:
        return self.name
    
    def send_email(self, message):
        pass 
    
    def tojson(self):
        return {
            "name": self.name,
            "id": self.id
        }


class Contact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contacts")
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    company = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    cc = models.TextField(blank=True)
    other_fields = models.JSONField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    categories = models.ManyToManyField(ContactCategory, blank=True, related_name="contacts")

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
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['email', 'user'], name='unique_email_per_user'),
            models.UniqueConstraint(fields=['phone_number', 'user'], name='unique_phone_number_per_user'),
        ]
