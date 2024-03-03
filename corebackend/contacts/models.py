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
    def add_contact(self, **data):
        contact = Contact.objects.create(user=self.user, **data)
        return contact
        
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'user'], name='unique_category_name_per_user'),
           
        ]


class Contact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contacts")
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    company = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField()
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
    
    def get_emails_sent(self):
        emails = Mail.objects.filter(to__contains=self.email)
        return emails
    
        

class SubscribeLink(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.ForeignKey(ContactCategory, on_delete=models.CASCADE)
    should_verify = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def subscribe(self, first_name, last_name, email):
        contact = Contact( 
            first_name=first_name,
            last_name=last_name,
            email=email,
            user=self.category.user
        )
        contact.categories.add(self.category)
        contact.save()
        return contact
        
    def unsubscribe(self, email):
        self.category.remove_contact(email)
    
    def to_json(self):
        return {
            "title": self.title,
            "description": self.description,
        }     