from django.utils.encoding import force_bytes
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import  urlsafe_base64_encode
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from .models import VerificationCode
from .tokens import account_activation_token

def send_confirmation_email(user, request):
    verification_code = VerificationCode.objects.create(user=user)
    verification_code = verification_code.code
    current_site = get_current_site(request)
    email_subject = f"Beinpark - Email Verification Code"
    message = render_to_string('activate_account.html', {
        'user': user,
        'domain': current_site.domain,
        'verification_code': verification_code,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
    })
    confirmation_email = EmailMessage(email_subject, message, to=[user.email])
    # confirmation_email.content_subtype = "html"
    confirmation_email.send()
    
    
def send_mail_verification_code(request, user, new_email):
    verification_code = VerificationCode.objects.create(user=user, new_email=new_email)
    verification_code = verification_code.code
    current_site = get_current_site(request)
    email_subject = f"Beinpark - Email Verification Code"
    message = render_to_string('verify_email.html', {
        'user': user,
        'domain': current_site.domain,
        'verification_code': verification_code
    })
    verification_email = EmailMessage(email_subject, message, to=[new_email])
    # confirmation_email.content_subtype = "html"
    verification_email.send()
    
    
def send_password_reset_email(user, request):
    current_site = get_current_site(request)
    email_subject = f"Beinpark - Password Reset"
    
    message = render_to_string('reset-password.html', {
        "user": user,
        "domain": current_site.domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user)
    })
    
    password_reset_email = EmailMessage(email_subject, message, to=[user.email])
    # password_reset_email.content_subtype = "html"
    password_reset_email.send()