import json
from django.contrib.auth.models import User
from django.shortcuts import redirect
from rest_framework.decorators import api_view
from rest_framework import generics, permissions
from rest_framework.response import Response
from knox.models import AuthToken
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .models import Account
from django.utils import timezone
import google.oauth2.credentials
import google_auth_oauthlib.flow
from googleapiclient.discovery import build


CLIENT_SECRETS_FILE = "client_secret.json"
redirect_uri = "http://localhost:8000/api/accounts/auth2callback"

def credentials_to_dict(credentials):
  return {'token': credentials.token,
          'refresh_token': credentials.refresh_token,
          'token_uri': credentials.token_uri,
          'client_id': credentials.client_id,
          'client_secret': credentials.client_secret,
          'scopes': credentials.scopes}

@api_view(['GET'])
def get_google_api_authorization_url(request):
    scopes = request.GET.get("scopes")
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
      CLIENT_SECRETS_FILE, scopes=scopes)
    
    flow.redirect_uri = redirect_uri

    authorization_url, state = flow.authorization_url(
        access_type='offline',
      include_granted_scopes='true')
    
    request.session["state"] = state
    
    return redirect(authorization_url)
    

def auth2callback(request):
    state = request.session["state"]
    SCOPES = request.GET.get("scopes")
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
      CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
    flow.redirect_uri = redirect_uri
    full_url = request.build_absolute_uri()
    import os 
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    flow.fetch_token(authorization_response=full_url)
    credentials = flow.credentials
    #credentials = credentials_to_dict(credentials)
    #send_test_email(credentials)
    return redirect("http://localhost:5173/settings/intergration")
  

def send_test_email(credentials):
  import base64
  from email.message import EmailMessage
  from googleapiclient.errors import HttpError
  subject = "Connected Gmail to Smart CRM"
  body = "Thank you for connecting your gmail to smart-crm"
  """Create and send an email message
  Print the returned  message id
  Returns: Message object, including message id

  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  #creds, _ = google.auth.default()

  try:
    service = build("gmail", "v1", credentials=credentials)
    message = EmailMessage()

    message.set_content(body)

    message["To"] = "albertiradu19@gmail.com"
    message["From"] = "albertiradu19@gmail.com"
    message["Subject"] = subject

    # encoded message
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    create_message = {"raw": encoded_message}
    # pylint: disable=E1101
    send_message = (
        service.users()
        .messages()
        .send(userId="me", body=create_message)
        .execute()
    )
    print(f'Message Id: {send_message["id"]}')
  except HttpError as error:
    print(f"An error occurred: {error}")
    send_message = None
  return send_message



@api_view(["POST"])
def update_google_account(request):
  user = User.objects.get(id=1)
  account = Account.objects.get(user=user)
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

  def post(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response({
      "user": UserSerializer(user, context=self.get_serializer_context()).data,
      "token": AuthToken.objects.create(user)[1]
    })

# Login API
class LoginAPI(generics.GenericAPIView):
  serializer_class = LoginSerializer

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
class UserAPI(generics.RetrieveAPIView):
  permission_classes = [
    permissions.IsAuthenticated,
  ]
  serializer_class = UserSerializer

  def get_object(self):
    return self.request.user