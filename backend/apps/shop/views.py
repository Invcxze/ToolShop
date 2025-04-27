from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.status import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT,
    HTTP_403_FORBIDDEN
)

from .filters import ProductFilter
from .models import Product, Cart, Order
from .serializers.carts import CartSerializer
from .serializers.orders import OrderSerializer
from .serializers.products import ProductSerializer
from rest_framework.generics import get_object_or_404

@api_view(["GET"])
def get_list_of_products(request):
    # Применяем фильтры
    product_filter = ProductFilter(request.GET, queryset=Product.objects.all())
    products = product_filter.qs
    serializer = ProductSerializer(products, many=True)
    return Response({"data": serializer.data}, status=HTTP_200_OK)


@api_view(["POST"])
def create_product(request: Request) -> Response:
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden"}}, status=HTTP_403_FORBIDDEN)

    serializer = ProductSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    product = serializer.save()
    return Response({"data": {"id": product.id, "message": "Product added"}}, status=HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
def update_or_delete_product(request: Request, pk: int) -> Response:
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden"}}, status=HTTP_403_FORBIDDEN)

    product = get_object_or_404(Product, pk=pk)
    if request.method == "DELETE":
        product.delete()
        return Response(status=HTTP_204_NO_CONTENT)

    serializer = ProductSerializer(product, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({"data": serializer.data}, status=HTTP_200_OK)

@api_view(["GET"])
def get_list_of_products_from_cart(request: Request) -> Response:
    if not request.user.is_authenticated or request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden"}}, status=HTTP_403_FORBIDDEN)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    serialized_cart = CartSerializer(cart).data
    data = [{"id": idx + 1, **item} for idx, item in enumerate(serialized_cart["products"])]

    return Response({"data": data}, status=HTTP_200_OK)


@api_view(["POST", "DELETE"])
def add_or_delete_product_from_cart(request: Request, pk: int) -> Response:
    if not request.user.is_authenticated or request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden"}}, status=HTTP_403_FORBIDDEN)
    product = get_object_or_404(Product, pk=pk)
    cart, _ = Cart.objects.get_or_create(user=request.user)

    if request.method == "POST":
        cart.products.add(product)
        return Response({"data": {"message": "Product added to cart"}}, status=HTTP_200_OK)

    cart.products.remove(product)
    return Response(status=HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
def get_list_of_products_from_order(request: Request) -> Response:
    if not request.user.is_authenticated or request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden"}}, status=HTTP_403_FORBIDDEN)

    if request.method == "GET":
        orders = Order.objects.filter(user=request.user)
        return Response({"data": OrderSerializer(orders, many=True).data}, status=HTTP_200_OK)
    cart = get_object_or_404(Cart, user=request.user)
    order = Order.objects.create(user=request.user, order_price=sum(p.price for p in cart.products.all()))
    order.products.set(cart.products.all())
    cart.delete()

    return Response({"data": {"order_id": order.id, "message": "Order is processed"}}, status=HTTP_201_CREATED)
