from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Product, Cart, Order
from .serializers.carts import CartSerializer
from .serializers.orders import OrderSerializer
from .serializers.products import ProductSerializer


@api_view(['GET'])
def get_list_of_products(request):
    products = Product.objects.all()
    return Response({"data": ProductSerializer(products, many=True).data})

@api_view(['POST'])
def create_product(request):
    if not request.user.is_active:
        return Response({"error": {"code": 403, "message": "Login Failed"}}, status=403)
    if not request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden for you"}}, status=403)
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"data": {"id": serializer.data["id"], "message": "Product added"}}, status=201)
    return Response({"error": {'code': 422, "message": "Validation error", "errors": serializer.errors}}, status=422)


@api_view(['PATCH', 'DELETE'])
def update_or_delete_product(request, **kwargs):
    if not request.user.is_active:
        return Response({"error": {"code": 403, "message": "Login Failed"}}, status=403)
    if not request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden for you"}}, status=403)
    try:
        product = Product.objects.get(pk=kwargs['pk'])
    except:
        return Response({"error": {"code": 404, "message": "Not found"}}, status=404)
    if request.method == "DELETE":
        product.delete()
        return Response({"data": {"message": "Product removed"}})
    if request.method == "PATCH":
        serializer = ProductSerializer(data=request.data, instance=product, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data})
        return Response({"error": {'code': 422, "message": "Validation error", "errors": serializer.errors}},
                        status=422)



@api_view(['GET'])
def get_list_of_products_from_cart(request):
    if not request.user.is_active:
        return Response({"error": {"code": 403, "message": "Login failed"}}, status=403)
    if request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden for you"}}, status=403)
    cart, c = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    data = []
    count = 0
    for item in serializer.data['products']:
        count += 1
        data.append({
            "id": count,
            "product_id": item['id'],
            "name": item['name'],
            "description": item['description'],
            "price": item['price']
        })
    return Response({"data": data})



@api_view(['POST', 'DELETE'])
def add_or_delete_product_from_cart(request, **kwargs):
    if not request.user.is_active:
        return Response({"error": {"code": 403, "message": "Login failed"}}, status=403)
    if request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden for you"}}, status=403)
    try:
        product = Product.objects.get(pk=kwargs['pk'])
    except:
        return Response({"error": {"code": 404, "message": "Not found"}}, status=404)
    cart, c = Cart.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        cart.products.add(product)
        return Response({"data": {"message": "product added to cart"}})
    if request.method == 'DELETE':
        cart.products.remove(product)
        return Response({"data": {"message": "item removed from cart"}})

@api_view(['POST', 'GET'])
def get_list_of_products_from_order(request):
    if not request.user.is_active:
        return Response({"error": {"code": 403, "message": "Login failed"}}, status=403)
    if request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden for you"}}, status=403)
    if request.method == 'GET':
        order = Order.objects.filter(user=request.user)
        return Response({"data": OrderSerializer(order, many=True).data}, status=200)
    if request.method == 'POST':
        try:
            cart = Cart.objects.get(user=request.user)
        except:
            return Response({"error": {"code": 404, "message": "Cart is empty"}}, status=404)
        order = Order()
        order.user = request.user
        price = 0
        for product in cart.products.all():
            price += product.price
        order.order_price = price
        order.save()
        for product in cart.products.all():
            order.products.add(product)
        order.save()
        cart.delete()
        return Response({"data": {"order_id": order.id, "message": "Order is processed"}})
