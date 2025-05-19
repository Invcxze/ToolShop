from django.contrib import admin
from .models import Manufacturer, Category, Product, Cart, Order, Review, RecentProduct


@admin.register(Manufacturer)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price", "category", "manufacturer")
    list_filter = ("category", "manufacturer")
    search_fields = ("name", "description")
    readonly_fields = ("photo_preview",)

    def photo_preview(self, obj):
        if obj.photo:
            return f'<img src="{obj.photo.url}" style="max-height: 100px;" />'
        return "-"
    photo_preview.allow_tags = True
    photo_preview.short_description = "Фото"


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user")
    search_fields = ("user__username", "user__email")
    filter_horizontal = ("products",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "order_price", "status")
    list_filter = ("status",)
    search_fields = ("user__username", "user__email")
    filter_horizontal = ("products",)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "user", "grade")
    search_fields = ("product__name", "user__username", "text")
    list_filter = ("grade",)


@admin.register(RecentProduct)
class RecentProductAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "user")
    search_fields = ("product__name", "user__username")