INSTALLED_APPS = [
    'djangoapp.apps.DjangoappConfig',  # your app
    'django.contrib.admin',            # ✅ this is missing
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]


SECRET_KEY = (
    'django-insecure-ccow$tz_=9%dxu4(0%^(z%nx32#s@(zt9$ih@)5l54yny)wm-0'
)

DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    'shumariashah-8000.theiadockernext-1-labs-prod-theiak8s-4-'
    'tor01.proxy.cognitiveclass.ai',
]

CSRF_TRUSTED_ORIGINS = [
    'https://shumariashah-8000.theiadockernext-1-labs-prod-theiak8s-4-'
    'tor01.proxy.cognitiveclass.ai',
]

ROOT_URLCONF = 'djangoproj.urls'  # ✅ This is critical!
