from django.db.models import Q
from django.utils import timezone
from mail_service.models import Mail, EmailUsage
from accounts.models import Plan, Account
from django.db.models import Q


def send_limit_emails():
    today = timezone.now().date()
    obj_list = EmailUsage.objects.filter(date=today, is_limit_reached_email_sent=False)
    for obj in obj_list:
        limit = obj.user.account.plan.max_emails_per_day
        if (obj.emails_sent /limit ) >= 0.9:
            if obj.is_limit_warning_email_sent == False:
                obj.send_limit_warning_email(limit=limit)
                
            if (obj.emails_sent /limit ) >= 1:
                obj.send_limit_reached_email()
    
    

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
    scheduler.add_job(send_limit_emails, 'interval', seconds=10)
    scheduler.start()