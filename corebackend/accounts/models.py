from datetime import datetime, timedelta
import random
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send"


def generate_integers():
    n = "".join([str(random.randint(0, 9)) for p in range(0, 6)])
    return n
    
def generate_expire_date():
    expire_date = timezone.now() + timedelta(minutes=10)
    return expire_date


class Plan(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    max_emails_per_day = models.PositiveIntegerField()
    max_emails_per_month = models.PositiveIntegerField()
    max_emails_at_once = models.PositiveIntegerField(default=50)
    is_active = models.BooleanField(default=False)
    price = models.FloatField()
    features = models.TextField()
    
    @classmethod
    def get_default_plan(cls):
        return cls.objects.get_or_create(
            name='Free', max_emails_per_day=100, max_emails_per_month=1000, price=0, is_active=True
            )[0].id
        

class Account(models.Model):
    plan = models.ForeignKey(Plan, on_delete=models.SET_DEFAULT, default=Plan.get_default_plan)
    last_billing_date = models.DateTimeField(null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="account")
    google_account = models.JSONField(null=True, blank=True, default=dict())
    mail_settings = models.JSONField(default=dict())
    mail_signature = models.TextField(blank=True)
    email_provider = models.CharField(max_length=50, null=True, blank=True)
    
    
    
    def __str__(self) -> str:
        return self.user.first_name
    
    def get_email_config(self, with_password=False):
        return_value =  {**self.mail_settings, "email_provider": self.email_provider}
        if not with_password:
            return_value["password"] = ""
        return return_value
    
    
    def has_gmail_scope(self):
        if not self.google_account or self.google_account.get('scopes') is None:
            return False
        return GMAIL_SEND_SCOPE in self.google_account.get('scopes')
    
    def get_connected_email_provider(self):
        if self.has_gmail_scope():
            return "gmail"
        if self.mail_settings:
            return self.mail_settings
    
    def disconnect_email_provider(self):
        if self.has_gmail_scope():
            google_account = self.google_account
            google_account["scopes"] = google_account["scopes"].replace(GMAIL_SEND_SCOPE, '')
            self.google_account = google_account
        self.email_provider = None
        self.save()
        

class VerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(default=generate_integers, max_length=6)
    new_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expire_date = models.DateTimeField(default=generate_expire_date)
    
    def check_code(user, code, new_email=None):
        try:
            v_code = None
            if new_email is None:
                v_code = VerificationCode.objects.get(user=user, code=code)
            else:
                v_code = VerificationCode.objects.get(user=user, code=code, new_email=new_email)
            if v_code and v_code.expire_date > timezone.now():
                return True, v_code
             
        except ObjectDoesNotExist:
            return False