import json
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import redirect, get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse
from knox.models import AuthToken
from knox.auth import TokenAuthentication
from .serializers import PasswordResetSerializer, UserEmailConfigSerializer, UserSerializer, RegisterSerializer, LoginSerializer
from .models import Account, VerificationCode
from django.utils import timezone
import google_auth_oauthlib.flow
from googleapiclient.discovery import build
from .utils import send_confirmation_email, send_mail_verification_code, send_password_reset_email
from .tokens import account_activation_token
from django.contrib.sites.shortcuts import get_current_site
from billing.services.utils import ensure_business_trial_subscription
from sales.models import Company, CompanyMembership
import os 


CLIENT_SECRETS_FILE = os.environ.get("CLIENT_SECRETS_FILE", "client_secret.json")
# redirect_uri = "http://localhost:8000/api/accounts/auth2callback"


def _default_company_name(user):
    display_name = (user.first_name or "").strip() or user.email.split("@")[0]
    suffix = "'" if display_name.endswith("s") else "'s"
    return f"{display_name}{suffix} Organization"


@transaction.atomic
def _ensure_signup_onboarding(user):
    Account.objects.get_or_create(user=user)

    membership = (
        CompanyMembership.objects.select_related("company")
        .filter(user=user, is_active=True)
        .order_by("created_at")
        .first()
    )
    if membership:
        ensure_business_trial_subscription(membership.company)
        return membership.company

    company = Company.objects.create(
        name=_default_company_name(user),
        email=user.email or "",
        created_by=user,
        updated_by=user,
    )
    CompanyMembership.objects.create(
        company=company,
        user=user,
        role=CompanyMembership.Role.OWNER,
        is_active=True,
        display_name=user.get_full_name() or user.username,
        work_email=user.email or "",
        created_by=user,
        updated_by=user,
    )
    ensure_business_trial_subscription(company)
    return company


def credentials_to_dict(credentials):
  return {'token': credentials.token,
          'refresh_token': credentials.refresh_token,
          'token_uri': credentials.token_uri,
          'client_id': credentials.client_id,
          'client_secret': credentials.client_secret,
          'scopes': credentials.scopes}


def get_google_api_authorization_url(request):
    user_token = request.GET.get('token')
    scopes = request.GET.get('scopes')
    if(not scopes):
      return JsonResponse({ "error": "The scope was not provided"}, status=400)
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
      CLIENT_SECRETS_FILE, scopes=scopes)
    current_site = get_current_site(request)
    redirect_uri = os.environ.get("SITE_URL", f"http://{current_site.domain}") + "/api/accounts/auth2callback"
    flow.redirect_uri = redirect_uri

    authorization_url, state = flow.authorization_url(
        access_type='offline',
      include_granted_scopes='true')
    
    request.session["state"] = state
    request.session["user_token"] = user_token  
    return redirect(authorization_url)
    

def auth2callback(request):
      state = request.session["state"]
      user_token = request.session["user_token"]
      auth = TokenAuthentication()
      user, _= auth.authenticate_credentials(token=bytes(user_token,  'utf-8'))
      SCOPES = request.GET.get("scope")
      flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
      current_site = get_current_site(request)
      redirect_uri = os.environ.get("SITE_URL", f"http://{current_site.domain}") + "/api/accounts/auth2callback"
      flow.redirect_uri = redirect_uri
      full_url = request.build_absolute_uri()
      os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
      try:
          flow.fetch_token(authorization_response=full_url)
          credentials = flow.credentials
          user.account.google_account = credentials_to_dict(credentials)
          user.account.email_provider="gmail"
          user.account.save()
      except Exception as ex:
          if not (str(ex) == "access_deniedaccess_denied"):
              raise ex
      current_site = get_current_site(request)
      redirect_to = os.environ.get("FRONTEND_URL", f"http://{current_site.domain}") + "/settings/integration"
      return redirect(redirect_to)
  

@api_view(['GET', 'PUT', 'DELETE', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def view_email_provider(request):
    user = request.user
    if request.method == "GET":
        return Response(user.account.get_email_config())
    
    if request.method == "DELETE":
        user.account.disconnect_email_provider()
        return Response(user.account.get_email_config())
    
        
    if request.method in ["PUT", "POST"]:
        serializer = UserEmailConfigSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = user.account 
        account.email_provider= "smtp"
        account.mail_settings= serializer.validated_data 
        account.save()
        return Response(account.get_email_config())
    




@api_view(["POST"])
def update_google_account(request):
    account = Account.objects.get(user=request.user)
    data = json.loads(request.body)
    account.google_access_token = data.get("access_token")
    account.google_credentials_updated_at = timezone.now()
    account.google_scope = data.get('scope')
    account.google_token_expires_in = data.get('expires_in')
    account.google_token_type = data.get("token_type")
    account.save()
    
    return Response({ "message": "success"}, status=201)



# Register API
class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes=[permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_confirmation_email(user, request)
        
        return Response({
        "user": UserSerializer(user, context=self.get_serializer_context()).data,
        })
    

# Login API
class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        _, token = AuthToken.objects.create(user)
        return Response({
        "user": UserSerializer(user, context=self.get_serializer_context()).data,
        "token": token
        })

# Get User API
class UserAPI(generics.RetrieveUpdateAPIView):
    permission_classes = [
        permissions.IsAuthenticated,
        ]
    serializer_class = UserSerializer
    
    def get(self, request, *args, **kwargs):
        user = request.user
        user_data = UserSerializer(user).data     
        return Response(user_data)
    
    def put(self, request, *args, **kwargs):
        user = request.user
        new_email = request.data.get("email")
        new_name = request.data.get("first_name")
        if not new_name:
            return Response({"first_name": "This field can not be blank"}, status=400)
        verification_code = request.data.get("verification_code")
        password = request.data.get("password")
        
        if new_email and user.email != new_email:
            if not user.check_password(password):
                return Response({"password": "Wrong password"}, status=401)
            if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                return Response({"email": "email already in use"}, 400)
            
            if verification_code:
                if VerificationCode.check_code(code=verification_code, user=user, new_email=new_email):
                    user.email = new_email
                else:
                    return Response({"verification_code": "Invalid code"}, status=400)
            else:
                send_mail_verification_code(request, user, new_email)
                return Response({"status": "verification_email_sent"})
        
        
        user.first_name = new_name
        user.save()
        return Response(UserSerializer(user).data)

    
    


# activate through email
@api_view(["POST", "GET"])
@permission_classes([permissions.AllowAny])
def activate_account(request, uidb64, token):
    uid = force_bytes(urlsafe_base64_decode(uidb64))
    try:
        user = User.objects.get(pk=uid)
        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            _ensure_signup_onboarding(user)
            text = """
            <h1>Your account has been activated!</h1>
            <a href="/login">Log in now</a>
            """
            return HttpResponse(text)
    finally:
        pass
    return JsonResponse({'error': 'invalid activation link'})


# activate through the verification code
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def activate_account_code(request):
    data = json.loads(request.body)
    code = data.get('code')
    if not code:
        return JsonResponse({'non_field_errors': 'Invalid code'}, status=401)
    email = data.get('email')
    try:
        user = User.objects.get(email=email)
    except ObjectDoesNotExist:
        return JsonResponse({"non_field_errors": "Invalid email address"}, status=401)
   
    if VerificationCode.check_code(user, code):
        if not user.is_active:
            user.is_active = True
            user.save()
        _ensure_signup_onboarding(user)
        _, token = AuthToken.objects.create(user)
        return JsonResponse({
            "user": data,
            "token": token,
            "is_active": True
        })
    return JsonResponse({'non_field_errors': 'invalid code'}, status=400)

@api_view(['POST'])
@permission_classes([])
def degenerate_code(request):
    data = json.loads(request.body)
    email = data.get('email')
    if not email:
        return JsonResponse({'error': 'email not provided'}, status=401)
    try:
        user = User.objects.get(email=email, is_active=False)
        if user:
            send_confirmation_email(user, request)
        else:
            return JsonResponse({'error': 'account not found'}, status=401)
    except ObjectDoesNotExist:
        return JsonResponse({'error': f"invalid email address"}, status=401)
    return JsonResponse({"message": "ok"})

# send password reset link
@api_view(['POST'])
@permission_classes([])
def forgot_password(request):
    data = json.loads(request.body)
    email = data.get('email')
    if not email:
        return JsonResponse({'email': 'email not provided'}, status=401)
    try:
        user = User.objects.get(email=email, is_active=True)
        send_password_reset_email(user, request)
    except ObjectDoesNotExist:
        return JsonResponse({'email': 'account not found'}, status=401)
    
    
    
    return JsonResponse({"status": "ok"})


#  reset the user password given the token is valid 
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def reset_password_via_email(request, uidb64, token):
    uid = force_bytes(urlsafe_base64_decode(uidb64))
    try:
        user = User.objects.get(pk=uid, is_active=True)
        if user is not None and account_activation_token.check_token(user, token):
            serializer = PasswordResetSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                user.set_password(serializer.validated_data["password"])
                
                user.save()
                return JsonResponse({
                    'message': f"Password changed successfully"
                    })
    finally:
        pass
    return JsonResponse({'non_field_errors': 'invalid activation link'}, status=401)


@api_view(["POST", "UPDATE"])
def reset_password(request):
    user = request.user
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid(raise_exception=True):
        current_password = request.data.get("current_password", "")
        if not user.check_password(current_password):
            return Response({"current_password": "Current password is incorrect"}, status=400)
        
        user.set_password(serializer.validated_data["password"])
        user.save()
        return JsonResponse({ 'message': f"Password changed successfully"})
