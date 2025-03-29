from rest_framework import serializers

from .products import ProductSerializer
from ..models import Cart


class CartSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True)

    class Meta:
        model = Cart
        fields = ['products']