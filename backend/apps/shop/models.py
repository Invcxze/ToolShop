from django.db import models

from apps.users.models import User


class Product(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(max_length=1500)
    price = models.PositiveIntegerField()


class Cart(models.Model):
    products = models.ManyToManyField(Product)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class Order(models.Model):
    products = models.ManyToManyField(Product)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_price = models.PositiveIntegerField()
