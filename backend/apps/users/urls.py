from django.urls import path
from .views import log_in_handler, log_out_handler, sign_up_handler

urlpatterns = [
    path("sign/", sign_up_handler, name="sign_up"),
    path("login/", log_in_handler, name="login"),
    path("logout/", log_out_handler, name="logout"),
]
