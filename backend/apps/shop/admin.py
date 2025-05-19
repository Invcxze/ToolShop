from django.contrib import admin

from .models import Product, Review, RecentProduct

admin.site.register(Product)
admin.site.register(Review)
admin.site.register(RecentProduct)