from django.urls import path

from .views import (
    get_list_of_products,
    create_product,
    update_or_delete_product,
    get_list_of_products_from_cart,
    add_or_delete_product_from_cart,
    get_list_of_products_from_order,
    payment_status,
    stripe_webhook,
    get_detail_product,
    get_recent_products,
    create_review,
    manage_reviews,
)

urlpatterns = [
    path("products", get_list_of_products),
    path("product", create_product),
    path("product/<int:product_id>", get_detail_product),
    path("product/<int:pk>", update_or_delete_product),
    path("cart", get_list_of_products_from_cart),
    path("cart/<int:pk>", add_or_delete_product_from_cart),
    path("order", get_list_of_products_from_order),
    path("payment-status/<str:session_id>", payment_status),
    path("stripe/webhook", stripe_webhook),
    path("review", create_review),
    path("review:<int:review_id>", manage_reviews),
    path("recent", get_recent_products),
]
