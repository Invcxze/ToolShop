from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'local_db.sqlite3',
    }
}
INSTALLED_APPS += [
    "silk",
	"query_counter",
]

MIDDLEWARE += [
	"query_counter.middleware.DjangoQueryCounterMiddleware",
]

QUERYCOUNT = {
	"THRESHOLDS": {
		"MEDIUM": 50,
		"HIGH": 200,
	},
	"DISPLAY_DUPLICATES": True,
	"RESPONSE_HEADER": "X-Query-Count",
	"LOG_QUERIES": True,
	"LOG_LEVEL": "DEBUG",
}