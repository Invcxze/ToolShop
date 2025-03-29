from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.status import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT,
    HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND, HTTP_422_UNPROCESSABLE_ENTITY
)
from .models import Product, Cart, Order
from .serializers.carts import CartSerializer
from .serializers.orders import OrderSerializer
from .serializers.products import ProductSerializer


@api_view(["GET"])
def get_list_of_products(request: Request) -> Response:
    products = Product.objects.all()
    return Response({"data": ProductSerializer(products, many=True).data}, status=HTTP_200_OK)


@api_view(["POST"])
def create_product(request: Request) -> Response:
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden"}}, status=HTTP_403_FORBIDDEN)

    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.save()
        return Response({"data": {"id": product.id, "message": "Product added"}}, status=HTTP_201_CREATED)

    return Response({"error": {"code": 422, "message": "Validation error", "errors": serializer.errors}}, status=HTTP_422_UNPROCESSABLE_ENTITY)


@api_view(["PATCH", "DELETE"])
def update_or_delete_product(request: Request, pk: int) -> Response:
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden"}}, status=HTTP_403_FORBIDDEN)

    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({"error": {"code": 404, "message": "Not found"}}, status=HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        product.delete()
        return Response({"data": {"message": "Product removed"}}, status=HTTP_204_NO_CONTENT)

    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"data": serializer.data}, status=HTTP_200_OK)

    return Response({"error": {"code": 422, "message": "Validation error", "errors": serializer.errors}}, status=HTTP_422_UNPROCESSABLE_ENTITY)


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

    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({"error": {"code": 404, "message": "Not found"}}, status=HTTP_404_NOT_FOUND)

    cart, _ = Cart.objects.get_or_create(user=request.user)

    if request.method == "POST":
        cart.products.add(product)
        return Response({"data": {"message": "Product added to cart"}}, status=HTTP_200_OK)

    cart.products.remove(product)
    return Response({"data": {"message": "Item removed from cart"}}, status=HTTP_200_OK)


@api_view(["GET", "POST"])
def get_list_of_products_from_order(request: Request) -> Response:
    if not request.user.is_authenticated or request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden"}}, status=HTTP_403_FORBIDDEN)

    if request.method == "GET":
        orders = Order.objects.filter(user=request.user)
        return Response({"data": OrderSerializer(orders, many=True).data}, status=HTTP_200_OK)

    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        return Response({"error": {"code": 404, "message": "Cart is empty"}}, status=HTTP_404_NOT_FOUND)

    order = Order.objects.create(user=request.user, order_price=sum(p.price for p in cart.products.all()))
    order.products.set(cart.products.all())
    cart.delete()

    return Response({"data": {"order_id": order.id, "message": "Order is processed"}}, status=HTTP_201_CREATED)
