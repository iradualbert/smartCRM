from django.contrib import admin
from .models import Mail, MailAttachment, MailTemplate, EmailUsage, BulkMail


# Register your models here.
admin.site.register(BulkMail)
admin.site.register(Mail)
admin.site.register(MailAttachment)
admin.site.register(MailTemplate)
admin.site.register(EmailUsage)