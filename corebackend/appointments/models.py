from django.db import models

class SlotBooking(models.Model):
    booked_by = models.CharField(max_length=255)
    booked_by_email = models.EmailField()
    booked_by_phone = models.CharField(max_length=20)
    cc = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    topic = models.CharField(max_length=500, null=True, blank=True)
    description = models.TextField(blank=True)
    is_confirmed = models.BooleanField(default=False)  # confirmed through an email
    is_accepted = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)
    meeting_id = models.CharField(max_length=255)
    meeting_link = models.TextField(blank=False, null=True)
    duration = models.DurationField()
    location = models.CharField(max_length=255)
    date = models.DateField()
    start_at = models.TimeField() 
    end_at = models.TimeField()  

    class Meta:
        ordering = ['-created_at']
        
class BookingInvite(models.Model):
    rules = []
    duration_options = []
    type_ = "group", "one-to-one"
    important = "yes-override-don't follow rules very import client"
