from rest_framework import serializers
from .models import Contact, ContactCategory


class ContactCategorySerializer(serializers.ModelSerializer):
    total_contacts = serializers.SerializerMethodField()
    
    def get_total_contacts(self, obj):
        return obj.contacts.all().count()
    
    class Meta:
        model = ContactCategory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'user']
        
    

class ContactSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()
    
    def get_categories(self, obj):
        return [x.tojson() for x in obj.categories.all()]
    
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def verify_categories(self, validated_data):
        user = self.context['request'].user
        categories_data = validated_data.pop('categories', [])
        for category in categories_data:
            if category.user != user:
                raise Exception("Invalid Category")
        
    def create(self, validated_data):
        self.verify_categories(validated_data)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        self.verify_categories(validated_data)
        return super().update(instance, validated_data)