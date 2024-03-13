from django.contrib import admin
from .models import Mail, MailAttachment, MailTemplate, EmailUsage


# Register your models here.
admin.site.register(Mail)
admin.site.register(MailAttachment)
admin.site.register(MailTemplate)
admin.site.register(EmailUsage)