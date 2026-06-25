from django.db.models import Prefetch
from rest_framework import filters, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Customer,
    PrintTemplateSetting,
    SalesOrder,
    SalesOrderLine,
    SalesQuotation,
    SalesQuotationLine,
)
from .serializers import (
    CustomerSerializer,
    PrintTemplateSettingSerializer,
    SalesOrderSerializer,
    SalesQuotationSerializer,
)


class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Customer.objects.filter(is_active=True)
    serializer_class = CustomerSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("code", "name")
    ordering_fields = ("code", "name")
    ordering = ("code",)
    http_method_names = ("get", "head", "options")


class PrintTemplateSettingAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        setting = PrintTemplateSetting.get_solo()
        serializer = PrintTemplateSettingSerializer(
            setting,
            context={"request": request},
        )
        return Response(serializer.data)

    def patch(self, request):
        setting = PrintTemplateSetting.get_solo()
        serializer = PrintTemplateSettingSerializer(
            setting,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SalesQuotationViewSet(viewsets.ModelViewSet):
    serializer_class = SalesQuotationSerializer
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


class SalesOrderViewSet(viewsets.ModelViewSet):
    serializer_class = SalesOrderSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("sales_order_no", "customer_code", "customer_name")
    ordering_fields = ("issue_date", "sales_order_no", "created_at")
    ordering = ("-issue_date", "-id")
    http_method_names = ("get", "post", "patch", "delete", "head", "options")

    queryset = SalesOrder.objects.select_related(
        "customer",
        "quotation",
    ).prefetch_related(
        Prefetch(
            "lines",
            queryset=SalesOrderLine.objects.select_related("item_unit__item"),
        )
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get("status")
        currency = self.request.query_params.get("currency")
        if status:
            if status not in SalesOrder.Status.values:
                raise ValidationError(
                    {"status": f"Valid values are: {', '.join(SalesOrder.Status.values)}."}
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
        if instance.status != SalesOrder.Status.DRAFT:
            raise ValidationError(
                {"status": "Only draft sales orders can be deleted."}
            )
        instance.delete()
