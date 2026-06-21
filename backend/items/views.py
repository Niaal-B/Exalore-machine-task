from rest_framework import filters, viewsets
from rest_framework.exceptions import ValidationError

from .models import Item
from .serializers import ItemSerializer


class ItemViewSet(viewsets.ModelViewSet):
    """CRUD API for the complete Item aggregate."""

    queryset = Item.objects.prefetch_related("units__prices")
    serializer_class = ItemSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("code", "name", "secondary_name", "generic_name")
    ordering_fields = ("code", "created_at", "updated_at")
    ordering = ("code",)

    http_method_names = ("get", "post", "put", "patch", "head", "options")

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get("status")
        tax_status = self.request.query_params.get("tax_status")

        if status:
            if status not in Item.Status.values:
                raise ValidationError(
                    {"status": f"Valid values are: {', '.join(Item.Status.values)}."}
                )
            queryset = queryset.filter(status=status)

        if tax_status:
            if tax_status not in Item.TaxStatus.values:
                raise ValidationError(
                    {
                        "tax_status": (
                            "Valid values are: "
                            f"{', '.join(Item.TaxStatus.values)}."
                        )
                    }
                )
            queryset = queryset.filter(tax_status=tax_status)

        return queryset
