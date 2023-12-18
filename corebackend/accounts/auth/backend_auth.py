from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist

class EmailBackend(object):
    def authenticate(self, request, username=None, email=None, password=None, **kwargs):
        user = None
        if username:
            try:
                user = User.objects.get(username=username) # for admin
            except ObjectDoesNotExist:
                pass
        elif email:
            try:
                user = User.objects.get(email=email)
            except ObjectDoesNotExist:
                pass
        if user is None:
            return None

        if getattr(user, 'is_active') and user.check_password(password):
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except ObjectDoesNotExist:
            return None