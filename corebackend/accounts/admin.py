from django.contrib import admin
from .models import Account, VerificationCode, Plan

admin.site.register(Account)
admin.site.register(VerificationCode)
admin.site.register(Plan)