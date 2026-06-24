from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from django.db.models import Prefetch, Q
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Item, ItemPrice, ItemUnit
from .serializers import ItemSearchSerializer, ItemSerializer


VALIDATION_ERROR_RESPONSE = OpenApiResponse(
    description="Validation failed. Response keys identify invalid request fields.",
)

CREATE_ITEM_EXAMPLE = OpenApiExample(
    "Create an item with units and prices",
    request_only=True,
    value={
        "code": "ITM-3001",
        "name": "Business Laptop",
        "secondary_name": "14-inch Laptop",
        "generic_name": "Laptop Computer",
        "description": "Business laptop with 16 GB RAM.",
        "behaviour": "purchase",
        "group_code": "COMPUTERS",
        "status": "active",
        "tax_status": "taxable",
        "shelf_code": "A-10",
        "manufacturer": "TechWorks",
        "units": [
            {
                "unit": "Pcs",
                "co_factor": "1.000000",
                "barcode": "8905000000017",
                "prices": [
                    {
                        "price_list_type": "Retail",
                        "sale_price": "1250.0000",
                        "minimum_selling_price": "1150.0000",
                    },
                    {
                        "price_list_type": "Wholesale",
                        "sale_price": "1180.0000",
                        "minimum_selling_price": "1100.0000",
                    },
                ],
            }
        ],
    },
)

LIST_ITEMS_EXAMPLE = OpenApiExample(
    "Item list response",
    response_only=True,
    value=[
        {
            "id": 1,
            "code": "ITM-3001",
            "name": "Business Laptop",
            "secondary_name": "14-inch Laptop",
            "generic_name": "Laptop Computer",
            "description": "Business laptop with 16 GB RAM.",
            "behaviour": "purchase",
            "group_code": "COMPUTERS",
            "status": "active",
            "tax_status": "taxable",
            "shelf_code": "A-10",
            "manufacturer": "TechWorks",
            "image": None,
            "units": [
                {
                    "id": 1,
                    "unit": "Pcs",
                    "co_factor": "1.000000",
                    "barcode": "8905000000017",
                    "prices": [
                        {
                            "id": 1,
                            "item_unit": 1,
                            "price_list_type": "Retail",
                            "sale_price": "1250.0000",
                            "minimum_selling_price": "1150.0000",
                        }
                    ],
                }
            ],
        }
    ],
)

PATCH_ITEM_EXAMPLE = OpenApiExample(
    "Update nested rows and delete explicitly",
    request_only=True,
    value={
        "name": "Business Laptop Pro",
        "units": [
            {
                "id": 1,
                "unit": "Pcs",
                "co_factor": "1.000000",
                "barcode": "8905000000017",
                "prices": [
                    {
                        "id": 1,
                        "price_list_type": "Retail",
                        "sale_price": "1290.0000",
                        "minimum_selling_price": "1175.0000",
                    },
                    {
                        "price_list_type": "Wholesale",
                        "sale_price": "1200.0000",
                        "minimum_selling_price": "1125.0000",
                    },
                ],
                "deleted_price_ids": [2],
            },
            {
                "unit": "Box",
                "co_factor": "5.000000",
                "barcode": "8905000000024",
                "prices": [
                    {
                        "price_list_type": "Retail",
                        "sale_price": "6250.0000",
                        "minimum_selling_price": "5750.0000",
                    }
                ],
            },
        ],
        "deleted_unit_ids": [3],
    },
)


@extend_schema_view(
    list=extend_schema(tags=["Items"], examples=[LIST_ITEMS_EXAMPLE]),
    retrieve=extend_schema(tags=["Items"]),
    create=extend_schema(
        tags=["Items"],
        examples=[CREATE_ITEM_EXAMPLE],
        responses={201: ItemSerializer, 400: VALIDATION_ERROR_RESPONSE},
    ),
    update=extend_schema(
        tags=["Items"],
        responses={200: ItemSerializer, 400: VALIDATION_ERROR_RESPONSE},
    ),
    partial_update=extend_schema(
        tags=["Items"],
        examples=[PATCH_ITEM_EXAMPLE],
        responses={200: ItemSerializer, 400: VALIDATION_ERROR_RESPONSE},
    ),
)
class ItemViewSet(viewsets.ModelViewSet):
    """CRUD API for the complete Item aggregate."""

    queryset = Item.objects.prefetch_related("units__prices")
    serializer_class = ItemSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("code", "name", "secondary_name", "generic_name")
    ordering_fields = ("code", "created_at", "updated_at")
    ordering = ("code",)

    http_method_names = ("get", "post", "put", "patch", "head", "options")

    @action(detail=False, methods=("get",), url_path="search")
    def search(self, request):
        search_term = request.query_params.get("search", "").strip()
        queryset = (
            ItemUnit.objects.filter(
                item__status=Item.Status.ACTIVE,
                prices__price_list_type__iexact="Retail",
            )
            .select_related("item")
            .prefetch_related(
                Prefetch(
                    "prices",
                    queryset=ItemPrice.objects.filter(
                        price_list_type__iexact="Retail"
                    ),
                    to_attr="retail_prices",
                )
            )
            .order_by("item__code", "unit")
            .distinct()
        )

        if search_term:
            queryset = queryset.filter(
                Q(item__code__icontains=search_term)
                | Q(item__name__icontains=search_term)
                | Q(item__secondary_name__icontains=search_term)
                | Q(item__generic_name__icontains=search_term)
            )

        serializer = ItemSearchSerializer(queryset[:20], many=True)
        return Response(serializer.data)

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
