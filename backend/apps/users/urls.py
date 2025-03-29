from django.urls import path

from .views import log_in_handler, log_out_handler, sign_up_handler

urlpatterns = [
    path("sign", sign_up_handler),
    path("login", log_in_handler),
    path("logout", log_out_handler),
]