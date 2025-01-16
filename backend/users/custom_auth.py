# users/custom_auth.py
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()

class PhoneOrEmailBackend(ModelBackend):
    """
    Auth via phone OR email as the username field.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        # 'username' here is actually phoneOrEmail from the front end
        # 1) Check if it looks like an email:
        if "@" in username:
            # Attempt to find user by email
            try:
                user = User.objects.get(email=username)
            except User.DoesNotExist:
                return None
        else:
            # 2) Attempt to find user by phone
            try:
                user = User.objects.get(phone=username)
            except User.DoesNotExist:
                return None

        # 3) Check password
        if user.check_password(password):
            return user
        return None
