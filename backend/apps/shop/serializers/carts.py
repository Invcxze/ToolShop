from rest_framework import serializers

from .products import ProductSerializer


class CartSerializer(serializers.Serializer):
    products = ProductSerializer(many=True, read_only=True)
