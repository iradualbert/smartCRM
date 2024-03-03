from django.contrib import admin
from .models import Account, VerificationCode

admin.site.register(Account)
admin.site.register(VerificationCode)