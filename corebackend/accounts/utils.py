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
    email_subject = f"beinPark - {verification_code} is your Activation Code"
    message = render_to_string('activate_account.html', {
        'user': user,
        'domain': current_site.domain,
        'verification_code': verification_code,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
    })
    confirmation_email = EmailMessage(email_subject, message, to=[user.email])
    confirmation_email.content_subtype = "html"
    confirmation_email.send()