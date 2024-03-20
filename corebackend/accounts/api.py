from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from mail_service.models import EmailUsage
from django.core.exceptions import ObjectDoesNotExist

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
    today = timezone.now().date()
    response["max_emails_per_day"] = user.account.plan.max_emails_per_day
    try:
        email_usage = EmailUsage.objects.get(user=user, date=today)
        response["emails_sent_today"] = email_usage.emails_sent
    except ObjectDoesNotExist:
        response["emails_sent_today"] = 0
    return response

@api_view(['GET', 'POST', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def mail_signature(request):
    account = request.user.account
    if request.method in ["POST" "PUT"]:
        account.mail_signature = request.data.get('signature')
        account.save()
        return Response({"mail_signature": account.mail_signature}, status=201)
    
    elif request.method == "GET":
        return Response({"mail_signature": account.mail_signature})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_data(request):
    user = request.user
    return Response(get_user_dashboard_data(user))


