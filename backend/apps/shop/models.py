from django.db import models

from apps.users.models import User

from config.storages import MinIOMediaStorage


class Manufacturer(models.Model):
    name = models.CharField(max_length=255)

class Category(models.Model):
    name = models.CharField(max_length=255)

class Product(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(max_length=1500)
    price = models.PositiveIntegerField()
    views = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE, null=True, blank=True)
    photo = models.ImageField(
        upload_to="product_photos/", null=True, blank=True, storage=MinIOMediaStorage()
    )

    def __str__(self):
        return self.name


class Cart(models.Model):
    products = models.ManyToManyField(Product)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class Order(models.Model):
    products = models.ManyToManyField(Product)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_price = models.PositiveIntegerField()
