import random
import string
from django.forms import ValidationError
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Account


class UserEmailConfigSerializer(serializers.ModelSerializer):
    host = serializers.CharField(required=True, max_length=50)
    port = serializers.IntegerField(required=True)
    password = serializers.CharField(required=True, write_only=True, max_length=15)
    email = serializers.EmailField()
    default_name = serializers.CharField(max_length=50)
    
    class Meta:
        model = Account
        fields = ['email_provider', 'host', 'port', 'password', 'email', 'default_name']    
    

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name')

# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    fullname = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('id', 'fullname', 'email', 'password', "password_confirm")
        extra_kwargs = {'password': {'write_only': True}, "password_confirm":  {'write_only': True},}
    
    def create(self, validated_data):
        passive_user = User.objects.filter(email=validated_data['email'], is_active=False).first()
        if passive_user:
            passive_user.set_password(validated_data['password'])
            passive_user.email = validated_data["email"]
            passive_user.save()
            return passive_user
        user = User.objects.create_user(
            username=self.generate_username(validated_data['email']), 
            email=validated_data['email'], 
            password=validated_data['password'],
            first_name=validated_data["fullname"],
            is_active=False,
        )
        return user
    
    
    def get_fullname(self, obj):
        return obj.first_name
    
    def validate_email(self, value):
        if User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("This email address is already in use")
        return value
    
    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        return value

    
    def validate_password_confirm(self, value):
        if self.initial_data['password'] != value:
            raise serializers.ValidationError("Passwords do not match")
        return value 
    
    def generate_username(self, email):
         # Extracting first name and last name from email (you can change this logic)
        parts = email.split('@')[0].split('.')
        first_name = parts[0]
        last_name = parts[-1]

        # Generating a random string for uniqueness
        random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=6))

        # Concatenating first name, last name, and random string
        username = f"{first_name.lower()}{last_name.lower()}{random_string}"
        return username

# Login Serializer
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials")
    
    

# Password Reset Serializer
class PasswordResetSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('password', "password_confirm")
        extra_kwargs = {'password': {'write_only': True}, "password_confirm":  {'write_only': True},}

    
    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        return value

    
    def validate_password_confirm(self, value):
        if self.initial_data['password'] != value:
            raise serializers.ValidationError("Passwords do not match")
        return value 
    

