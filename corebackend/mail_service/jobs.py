from django.db.models import Q
from django.utils import timezone
from .models import Mail

def send_scheduled_emails():
    current_time = timezone.now()
    sent_total  = 0
    mails = Mail.objects.filter(
        Q(schedule_datetime__isnull=True) | Q(schedule_datetime__lte=current_time),
        is_sent=False,
        failed=False
    ).order_by("created_at")
    
    for mail in mails:
        mail.send_with_google_oauth()
        sent_total +=1
    if(sent_total > 0 ):
        print(f"{current_time} : {sent_total} Emails Sent")
        
from apscheduler.schedulers.background import BackgroundScheduler

def start_mail_service_job():
	scheduler = BackgroundScheduler()
	scheduler.add_job(send_scheduled_emails, 'interval', seconds=30)
	scheduler.start()