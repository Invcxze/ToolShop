from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator

from .products import ProductSerializer
from ..models import Review, Product


class UserSerializer(serializers.Serializer):
    fio = serializers.CharField()


class ReviewSerializer(serializers.ModelSerializer):
    grade = serializers.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ("id", "product", "text", "grade", "user")
        read_only_fields = ("id", "user")

    def create(self, validated_data):
        request = self.context["request"]
        return Review.objects.create(user=request.user, **validated_data)


class ProductDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    category = serializers.CharField(source="category.name", read_only=True)
    manufacturer = serializers.CharField(source="manufacturer.name", read_only=True)
    photo = serializers.FileField()
    reviews = serializers.SerializerMethodField()

    def get_reviews(self, obj):
        reviews = Review.objects.filter(product=obj)
        return ReviewSerializer(reviews, many=True).data


class RecentProductSerializer(serializers.Serializer):
    user = UserSerializer(required=False)
    product = ProductSerializer(required=False)
