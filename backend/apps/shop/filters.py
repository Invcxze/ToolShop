import django_filters
from .models import Product, Category, Manufacturer


class ProductFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains", label="Search by name")
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr="gte", label="Minimum price")
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr="lte", label="Maximum price")
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.all(), label="Filter by category")
    manufacturer = django_filters.ModelChoiceFilter(queryset=Manufacturer.objects.all(), label="Filter by manufacturer")

    sort_by = django_filters.OrderingFilter(
        fields=(
            ("name", "name"),
            ("price", "price"),
        ),
        label="Sort by",
    )

    class Meta:
        model = Product
        fields = ["name", "price_min", "price_max", "category", "manufacturer"]
