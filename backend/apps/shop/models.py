from django.db import models

from apps.users.models import User

from config.storages import MinIOMediaStorage

from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Manufacturer(models.Model):
    name = models.CharField(max_length=255)


class Category(models.Model):
    name = models.CharField(max_length=255)


class Product(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(max_length=1500)
    price = models.PositiveIntegerField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE, null=True, blank=True)
    photo = models.ImageField(upload_to="product_photos/", null=True, blank=True, storage=MinIOMediaStorage())

    def __str__(self):
        return self.name


class Cart(models.Model):
    products = models.ManyToManyField(Product)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class Order(models.Model):
    STATUS_CHOICES = [
        ("unpaid", "Не оплачен"),
        ("paid", "Оплачен"),
    ]
    products = models.ManyToManyField(Product)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_price = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="unpaid")


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()

    grade = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[
            MinValueValidator(Decimal("0.0")),
            MaxValueValidator(Decimal("5.0")),
        ],
        help_text="Оценка от 0.0 до 5.0 с шагом 0.1",
    )

    def __str__(self):
        return f"{self.user}: {self.grade}"


class RecentProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
