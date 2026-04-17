import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY", 'django-insecure-mmyv4uu61&_l_825ium-ss640f)g*b=ya%o(am&gz!+i#=7pkg')

ENV = os.environ.get("ENV", "DEV")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', False)
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(" ")

CSRF_TRUSTED_ORIGINS = ['https://www.beinpark.com']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'knox',
    'storages',
    'common',
    'mail_service',
    'appointments',
    'contacts',
    'accounts',
    'sales',
    'catalogues',
    'billing'
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware", 
]

ROOT_URLCONF = 'corebackend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'corebackend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES_sqllite = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

DATABASES_PROD = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DATABASE_NAME'),
        'USER':os.environ.get('DATABASE_USER'),
        'PASSWORD':os.environ.get('DATABASE_PASSWORD'),
        'HOST': os.environ.get('DATABASE_HOST'), 
        'PORT': os.environ.get('DATABASE_PORT', '5432'),
        # "OPTIONS": {'sslmode': 'require'}
        
    }
}

DATABASES_TEST = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DATABASE_NAME', "verceldb"),
        'USER':os.environ.get('DATABASE_USER', "default"),
        'PASSWORD':os.environ.get('DATABASE_PASSWORD', 'hn0AWcQdBf4y'),
        'HOST': os.environ.get('DATABASE_HOST', 'ep-bitter-cherry-a2f30oac-pooler.eu-central-1.aws.neon.tech'), 
        'PORT': os.environ.get('DATABASE_PORT', '5432'),
        # "OPTIONS": {'sslmode': 'require'}
        
    }
}




DATABASES = DATABASES_PROD  if ENV == "PRODUCTION"  else DATABASES_TEST if ENV=="TEST" else DATABASES_sqllite


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = ('accounts.auth.backend_auth.EmailBackend',)

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True




STATIC_URL = 'static/'


STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = "/files/"
MEDIA_ROOT = os.path.join(BASE_DIR, "files")

MAIN_DIR = Path(__file__).resolve().parent.parent.parent

REACT_APP_BUILD_PATH = MAIN_DIR / "crm-frontend/dist"


STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('knox.auth.TokenAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    "PAGE_SIZE": 10,
    "DEFAULT_PAGINATION_CLASS": 'rest_framework.pagination.LimitOffsetPagination',
}

if ENV != "PRODUCTION":
    REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"] = ['rest_framework.permissions.AllowAny', ]
    

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True


# email
EMAIL_USE_TLS = True
EMAIL_HOST = os.environ.get("EMAIL_HOST")
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
EMAIL_PORT = os.environ.get("EMAIL_PORT", 587)


PASSWORD_RESET_TIMEOUT = 60 * 60 * 3

REST_KNOX = {
       'TOKEN_TTL': None,  # will create tokens that never expire
    }


EMAIL_SECRET_ENCRYPTION_KEY = os.environ.get("EMAIL_SECRET_ENCRYPTION_KEY", "ScdRVChEK75oV7MbBkp1jKC_Ho_GUgMNLTmsuqAM3qU=")

AWS_ACCESS_KEY_ID=os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY=os.environ.get("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME=os.environ.get("AWS_STORAGE_BUCKET_NAME")
AWS_S3_SIGNATURE_NAME='s3v4'
AWS_S3_REGION_NAME='us-east-1'
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL =  None
AWS_S3_VERITY = True

if ENV=="PRODUCTION":
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

LOGGING = {}

if not DEBUG:
    # REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = ('rest_framework.renderers.JSONRenderer', )
    
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                },
            },
        'loggers': {
            'django': {
                'level': 'ERROR',
                'handlers': ['console'],
                },
            }
        }