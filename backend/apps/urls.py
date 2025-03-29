from django.urls import path, include

urlpatterns = [
    path("users/", include("apps.users.urls")),
    path("shop/", include("apps.shop.urls"))
]