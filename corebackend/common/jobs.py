from django.db.models import Q
from django.utils import timezone
from mail_service.models import Mail
from accounts.models import Plan, Account

def bill_users():
    print("billing users")

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


def start_jobs():
    scheduler = BackgroundScheduler()
    scheduler.add_job(send_scheduled_emails, 'interval', seconds=30)
    scheduler.add_job(bill_users, 'interval', hours=10)
    scheduler.start()