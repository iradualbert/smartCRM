from django.db import models
from django.contrib.auth.models import User

GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send"

class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="account")
    google_account = models.JSONField(null=True)
    mail_signature = models.TextField(blank=True)
    email_provider = ""
    calendar_provider = ""
    meeting_provider = ""
    
    def __str__(self) -> str:
        return self.user.first_name
    
    def has_gmail_scope(self):
        if not self.google_account or self.google_account.get('scopes') is None:
            return False
        return GMAIL_SEND_SCOPE in self.google_account.get('scopes')
    
    def get_connected_email_provider(self):
        if self.has_gmail_scope():
            return "gmail"
        
        return None
    
    def disconnect_email_provider(self):
        if self.has_gmail_scope():
            google_account = self.google_account
            google_account["scopes"] = google_account["scopes"].replace(GMAIL_SEND_SCOPE, '')
            self.google_account = google_account
            self.save()
            return True
        
    