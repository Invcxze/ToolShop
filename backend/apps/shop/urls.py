from django.urls import path

from .views import (
    get_list_of_products,
    create_product,
    update_or_delete_product,
    get_list_of_products_from_cart,
    add_or_delete_product_from_cart,
    get_list_of_products_from_order,
)

urlpatterns = [
    path("products", get_list_of_products),
    path("product", create_product),
    path("product/<int:pk>", update_or_delete_product),
    path("cart", get_list_of_products_from_cart),
    path("cart/<int:pk>", add_or_delete_product_from_cart),
    path("order", get_list_of_products_from_order),
]