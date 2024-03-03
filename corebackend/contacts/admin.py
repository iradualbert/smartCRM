from django.contrib import admin
from .models import Contact, ContactCategory, SubscribeLink

admin.site.register(Contact)
admin.site.register(ContactCategory)
admin.site.register(SubscribeLink)