from django.db.models import Prefetch
from rest_framework import filters, viewsets
from rest_framework.exceptions import ValidationError

from .models import SalesQuotation, SalesQuotationLine
from .serializers import SalesQuotationSerializer


class SalesQuotationViewSet(viewsets.ModelViewSet):
    serializer_class = SalesQuotationSerializer
    permission_classes = []
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("quotation_no", "customer_code", "customer_name")
    ordering_fields = ("quotation_date", "quotation_no", "created_at")
    ordering = ("-quotation_date", "-id")
    http_method_names = ("get", "post", "patch", "delete", "head", "options")

    queryset = SalesQuotation.objects.select_related("customer").prefetch_related(
        Prefetch(
            "lines",
            queryset=SalesQuotationLine.objects.select_related(
                "item_unit__item"
            ),
        )
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get("status")
        currency = self.request.query_params.get("currency")

        if status:
            if status not in SalesQuotation.Status.values:
                raise ValidationError(
                    {
                        "status": (
                            "Valid values are: "
                            f"{', '.join(SalesQuotation.Status.values)}."
                        )
                    }
                )
            queryset = queryset.filter(status=status)

        if currency:
            if currency not in SalesQuotation.Currency.values:
                raise ValidationError(
                    {
                        "currency": (
                            "Valid values are: "
                            f"{', '.join(SalesQuotation.Currency.values)}."
                        )
                    }
                )
            queryset = queryset.filter(currency=currency)

        return queryset

    def perform_destroy(self, instance):
        if instance.status != SalesQuotation.Status.DRAFT:
            raise ValidationError(
                {"status": "Only draft quotations can be deleted."}
            )
        instance.delete()
