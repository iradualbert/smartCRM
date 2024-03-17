from django.contrib.auth.models import User
from rest_framework import serializers
from django.utils import timezone
from .models import EmailUsage, Mail, MailTemplate



class MailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mail
        fields = '__all__'
    
    def create(self, validated_data):
        today = timezone.now().date()
        _, is_limit_reached = EmailUsage.record_email_sent(self.context['user'], today)
        if is_limit_reached:
            raise serializers.ValidationError("Daily maximum limit reached. Cannot send more emails today. Consider upgrading")
        return super().create(validated_data)
    
    
        
class MailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MailTemplate
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
        
    