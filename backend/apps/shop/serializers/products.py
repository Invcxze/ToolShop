from rest_framework import serializers

from ..models import Product


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True)
    manufacturer = serializers.CharField(source="manufacturer.name", read_only=True)

    class Meta:
        model = Product
        fields = ("id", "name", "description", "price", "category", "manufacturer", "photo")
