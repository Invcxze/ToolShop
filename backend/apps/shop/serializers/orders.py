from rest_framework import serializers

from .products import ProductSerializer


class OrderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    products = ProductSerializer(many=True, read_only=True)
    status = serializers.CharField()
