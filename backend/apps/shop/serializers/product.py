from rest_framework import serializers


class UserSerializer(serializers.Serializer):
    fio = serializers.CharField()


class ReviewSerializer(serializers.Serializer):
    text = serializers.CharField()
    grade = serializers.DecimalField()
    user = UserSerializer(required=False)


class ProductDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    category = serializers.IntegerField()
    manufacturer = serializers.IntegerField()
    photo = serializers.FileField()
    reviews = ReviewSerializer(many=True)
