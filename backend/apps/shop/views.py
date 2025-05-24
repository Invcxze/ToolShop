from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_403_FORBIDDEN
import stripe
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from .filters import ProductFilter
from .models import Product, Cart, Order, Review, RecentProduct
from .serializers.carts import CartSerializer
from .serializers.orders import OrderSerializer
from .serializers.product import ReviewSerializer, RecentProductSerializer, ProductDetailSerializer
from .serializers.products import ProductSerializer
from rest_framework.generics import get_object_or_404


stripe.api_key = settings.STRIPE_TEST_SECRET_KEY


@api_view(["GET"])
def get_list_of_products(request):
    product_filter = ProductFilter(request.GET, queryset=Product.objects.all())
    products = product_filter.qs
    serializer = ProductSerializer(products, many=True)
    return Response({"data": serializer.data}, status=HTTP_200_OK)


@api_view(["GET"])
def get_detail_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    serializer = ProductDetailSerializer(product)
    print(request.user.is_authenticated, "sss")
    if request.user.is_active:
        RecentProduct.objects.get_or_create(product=product, user=request.user)

    return Response({"data": serializer.data}, status=HTTP_200_OK)


@api_view(["POST"])
def create_review(request):
    serializer = ReviewSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    review = serializer.save()
    return Response(ReviewSerializer(review).data, status=HTTP_201_CREATED)


@api_view(["DELETE", "PATCH"])
def manage_reviews(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    if request.method == "PATCH":
        serializer = ReviewSerializer(data=request.data, partial=True, instance=review)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response(ReviewSerializer(review).data, status=HTTP_200_OK)
    if request.method == "DELETE":
        review.delete()
        return Response(status=HTTP_204_NO_CONTENT)


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
    order_price = sum(p.price for p in cart.products.all())
    order = Order.objects.create(user=request.user, order_price=order_price)
    order.products.set(cart.products.all())

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"Заказ #{order.id}",
                        },
                        "unit_amount": int(order_price * 100),
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url="http://146.255.188.248:5173/orders",
            cancel_url="http://146.255.188.248:5173/cart",
            metadata={"order_id": order.id},
            customer_email=request.user.email,
        )
    except Exception as e:
        return Response({"error": {"code": 500, "message": str(e)}}, status=500)

    cart.delete()

    return Response(
        {
            "data": {
                "order_id": order.id,
                "checkout_session_id": checkout_session.id,
                "checkout_url": checkout_session.url,
                "message": "Заказ создан и платеж инициирован",
            }
        },
        status=HTTP_201_CREATED,
    )


@api_view(["GET"])
def payment_status(request: Request, session_id: str) -> Response:
    if not request.user.is_authenticated or request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden"}}, status=HTTP_403_FORBIDDEN)

    try:
        session = stripe.checkout.Session.retrieve(session_id, expand=["payment_status"])
        order_id = session.metadata.get("order_id")
        order = get_object_or_404(Order, id=order_id, user=request.user)

        if session.payment_status == "paid" and order.status != "paid":
            order.status = "paid"
            order.save(update_fields=["status"])

        return Response({"status": order.status}, status=HTTP_200_OK)

    except Exception as e:
        return Response({"error": {"code": 500, "message": str(e)}}, status=500)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.headers.get("Stripe-Signature")
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload=payload, sig_header=sig_header, secret=webhook_secret)
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = session.get("metadata", {}).get("order_id")
        if order_id:
            try:
                Order.objects.filter(id=order_id).update(status="paid")
            except Exception:
                pass

    return HttpResponse(status=200)


@api_view(["GET"])
def get_recent_products(request):
    if not request.user.is_authenticated or request.user.is_staff:
        return Response({"error": {"code": 403, "message": "Forbidden"}}, status=HTTP_403_FORBIDDEN)
    recent_produtcs = RecentProduct.objects.filter(user=request.user)
    return Response(RecentProductSerializer(recent_produtcs, many=True).data, status=HTTP_200_OK)
