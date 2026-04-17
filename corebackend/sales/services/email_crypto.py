from cryptography.fernet import Fernet
from django.conf import settings


def _get_fernet() -> Fernet:
    key = settings.EMAIL_SECRET_ENCRYPTION_KEY
    if not key:
        raise ValueError("EMAIL_SECRET_ENCRYPTION_KEY is not configured.")
    return Fernet(key.encode())


def encrypt_secret(value: str) -> str:
    if not value:
        return ""
    return _get_fernet().encrypt(value.encode()).decode()


def decrypt_secret(value: str) -> str:
    if not value:
        return ""
    return _get_fernet().decrypt(value.encode()).decode()