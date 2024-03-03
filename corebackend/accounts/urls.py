from django.urls import path, include
from .views_auth import RegisterAPI, LoginAPI, UserAPI
from knox import views as knox_views
from .views_auth import (
    update_google_account,
    get_google_api_authorization_url,
    auth2callback,
    view_email_provider,
    activate_account,
    activate_account_code,
    degenerate_code
)
from .api import dashboard_data, mail_signature

urlpatterns = [
    path('api/auth', include('knox.urls')),
    path('api/auth/register/', RegisterAPI.as_view()),
    path('api/auth/login/', LoginAPI.as_view()),
    path('api/auth/user', UserAPI.as_view()),
    path('api/auth/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path('api/accounts/google', update_google_account),
    path('api/accounts/get_google_api_authorization_url', get_google_api_authorization_url),
    path("api/accounts/auth2callback", auth2callback),
    path("api/accounts/email_provider", view_email_provider),
    path("api/accounts/dashboard_data", dashboard_data),
    path("api/accounts/mail_signature", mail_signature),
    
    path('api/accounts/activate/<uidb64>/<token>/', activate_account, name='activate'),
    path('api/accounts/activate/code/', activate_account_code, name="activate-code"),
    path('api/accounts/activate/resend/', degenerate_code),
]