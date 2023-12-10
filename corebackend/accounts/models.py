from django.db import models
from django.contrib.auth.models import User

class Account(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="account")
    
    email_provider = ""
    calendar_provider = ""
    meeting_provider = ""
    
    # google 
    google_credentials_updated_at = models.DateTimeField(null=True, blank=True)
    google_access_token = models.CharField(max_length=200, null=True, blank=True)
    google_scope = models.TextField(blank=True)
    google_token_type = models.CharField(max_length=50, blank=True, null=True)
    google_token_expires_in = models.IntegerField(blank=True, null=True)
    
    
    def __str__(self) -> str:
        return self.user.username 
    
    def is_gmail_connected(self):
        return "https://www.googleapis.com/auth/gmail.send" in self.scope
     
    def is_google_calendar_connected(self):
        return "https://www.googleapis.com/auth/calendar.events" in self.scope
    