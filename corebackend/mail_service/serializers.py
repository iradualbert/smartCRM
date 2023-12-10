from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Mail, MailTemplate



class MailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mail
        fields = '__all__'
        
        
class MailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MailTemplate
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
        
    