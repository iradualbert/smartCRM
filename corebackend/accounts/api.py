from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response

def get_user_dashboard_data(user: User):
    sent_mails = user.mails.filter(is_sent=True).count()
    failed_emails = user.mails.filter(failed=True).count()
    scheduled_emails = user.mails.filter(is_sent=False, failed=False).count()
    mail_templates = user.mail_templates.all().count()
    total_contacts = user.contacts.all().count()
    response = {
        "sent_emails": sent_mails,
        "scheduled_emails": scheduled_emails,
        "failed_emails": failed_emails,
        "mail_templates": mail_templates,
        "total_contacts": total_contacts,
        "newsletter_subs": 0,  
    } 
    return response

@api_view(['GET'])
def dashboard_data(request):
    user = request.user
    return Response(get_user_dashboard_data(user))

