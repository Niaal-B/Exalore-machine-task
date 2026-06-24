from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from items.models import ItemUnit

from .document_utils import (
    calculate_document_totals,
    generate_document_number,
    prepare_sales_line,
)
from .models import (
    Customer,
    SalesOrder,
    SalesOrderLine,
    SalesQuotation,
    SalesQuotationLine,
)


def generate_quotation_number(quotation_date) -> str:
    return generate_document_number("SQ", quotation_date)


class SalesQuotationLineSerializer(serializers.ModelSerializer):
    item_unit_id = serializers.PrimaryKeyRelatedField(
        source="item_unit",
        queryset=ItemUnit.objects.select_related("item"),
    )
    quantity = serializers.DecimalField(
        max_digits=18,
        decimal_places=6,
        min_value=Decimal("0.000001"),
    )
    rate = serializers.DecimalField(
        max_digits=18,
        decimal_places=4,
        min_value=Decimal("0"),
        required=False,
    )
    discount_percentage = serializers.DecimalField(
        max_digits=7,
        decimal_places=4,
        min_value=Decimal("0"),
        max_value=Decimal("100"),
        required=False,
    )

    class Meta:
        model = SalesQuotationLine
        fields = (
            "id",
            "line_no",
            "item_unit_id",
            "item_code",
            "item_name",
            "description",
            "unit",
            "quantity",
            "rate",
            "discount_percentage",
            "discount_amount",
            "vat_percentage",
            "vat_amount",
            "net_amount",
            "net_after_vat",
        )
        read_only_fields = (
            "line_no",
            "item_code",
            "item_name",
            "unit",
            "discount_amount",
            "vat_percentage",
            "vat_amount",
            "net_amount",
            "net_after_vat",
        )


class SalesQuotationSerializer(serializers.ModelSerializer):
    customer_id = serializers.PrimaryKeyRelatedField(
        source="customer",
        queryset=Customer.objects.filter(is_active=True),
    )
    lines = SalesQuotationLineSerializer(many=True)
    exchange_rate = serializers.DecimalField(
        max_digits=18,
        decimal_places=8,
        min_value=Decimal("0.00000001"),
        required=False,
    )

    class Meta:
        model = SalesQuotation
        fields = (
            "id",
            "quotation_no",
            "quotation_date",
            "customer_id",
            "customer_code",
            "customer_name",
            "customer_ref_no",
            "sales_executive",
            "attention",
            "pay_terms",
            "delivery_place",
            "currency",
            "exchange_rate",
            "notes",
            "gross_amount",
            "discount_amount",
            "net_amount",
            "vat_amount",
            "net_after_vat",
            "status",
            "lines",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "quotation_no",
            "customer_code",
            "customer_name",
            "gross_amount",
            "discount_amount",
            "net_amount",
            "vat_amount",
            "net_after_vat",
            "status",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        if self.instance is None and not attrs.get("lines"):
            raise serializers.ValidationError(
                {"lines": "A quotation requires at least one line."}
            )
        if self.instance is not None:
            if self.instance.status != SalesQuotation.Status.DRAFT:
                raise serializers.ValidationError(
                    {"status": "Only draft quotations can be edited."}
                )
            if "lines" in attrs and not attrs["lines"]:
                raise serializers.ValidationError(
                    {"lines": "A quotation requires at least one line."}
                )

        currency = attrs.get(
            "currency",
            self.instance.currency if self.instance else SalesQuotation.Currency.SAR,
        )
        exchange_rate = attrs.get(
            "exchange_rate",
            self.instance.exchange_rate if self.instance else None,
        )
        if (
            self.instance is not None
            and "currency" in attrs
            and currency != self.instance.currency
            and "exchange_rate" not in attrs
        ):
            raise serializers.ValidationError(
                {"exchange_rate": "Supply an exchange rate when changing currency."}
            )
        if (
            currency != SalesQuotation.Currency.SAR
            and exchange_rate is None
        ):
            raise serializers.ValidationError(
                {
                    "exchange_rate": (
                        "An exchange rate is required for non-SAR quotations."
                    )
                }
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        prepared_lines = [
            prepare_sales_line(line_data) for line_data in lines_data
        ]

        customer = validated_data["customer"]
        quotation_date = validated_data.get(
            "quotation_date",
            timezone.localdate(),
        )
        validated_data.update(
            {
                "quotation_no": generate_quotation_number(quotation_date),
                "customer_code": customer.code,
                "customer_name": customer.name,
                **calculate_document_totals(prepared_lines),
            }
        )
        quotation = SalesQuotation.objects.create(**validated_data)

        for line_no, (values, _) in enumerate(prepared_lines, start=1):
            SalesQuotationLine.objects.create(
                quotation=quotation,
                line_no=line_no,
                **values,
            )

        return quotation

    @transaction.atomic
    def update(self, instance, validated_data):
        quotation = SalesQuotation.objects.select_for_update().get(pk=instance.pk)
        if quotation.status != SalesQuotation.Status.DRAFT:
            raise serializers.ValidationError(
                {"status": "Only draft quotations can be edited."}
            )

        lines_data = validated_data.pop("lines", None)
        if lines_data is not None:
            prepared_lines = [
                prepare_sales_line(line_data) for line_data in lines_data
            ]
            quotation.lines.all().delete()
            for line_no, (values, _) in enumerate(prepared_lines, start=1):
                SalesQuotationLine.objects.create(
                    quotation=quotation,
                    line_no=line_no,
                    **values,
                )
            validated_data.update(calculate_document_totals(prepared_lines))

        customer = validated_data.get("customer")
        if customer:
            validated_data["customer_code"] = customer.code
            validated_data["customer_name"] = customer.name

        for field, value in validated_data.items():
            setattr(quotation, field, value)
        quotation.save()
        return quotation


class SalesOrderLineSerializer(serializers.ModelSerializer):
    item_unit_id = serializers.PrimaryKeyRelatedField(
        source="item_unit",
        queryset=ItemUnit.objects.select_related("item"),
    )
    quantity = serializers.DecimalField(
        max_digits=18,
        decimal_places=6,
        min_value=Decimal("0.000001"),
    )
    rate = serializers.DecimalField(
        max_digits=18,
        decimal_places=4,
        min_value=Decimal("0"),
        required=False,
    )
    discount_percentage = serializers.DecimalField(
        max_digits=7,
        decimal_places=4,
        min_value=Decimal("0"),
        max_value=Decimal("100"),
        required=False,
    )

    class Meta:
        model = SalesOrderLine
        fields = (
            "id",
            "line_no",
            "item_unit_id",
            "item_code",
            "item_name",
            "description",
            "unit",
            "quantity",
            "rate",
            "discount_percentage",
            "discount_amount",
            "vat_percentage",
            "vat_amount",
            "net_amount",
            "net_after_vat",
        )
        read_only_fields = (
            "line_no",
            "item_code",
            "item_name",
            "unit",
            "discount_amount",
            "vat_percentage",
            "vat_amount",
            "net_amount",
            "net_after_vat",
        )


class SalesOrderSerializer(serializers.ModelSerializer):
    customer_id = serializers.PrimaryKeyRelatedField(
        source="customer",
        queryset=Customer.objects.filter(is_active=True),
    )
    quotation_id = serializers.PrimaryKeyRelatedField(
        source="quotation",
        queryset=SalesQuotation.objects.exclude(
            status=SalesQuotation.Status.CANCELLED
        ),
        required=False,
        allow_null=True,
    )
    lines = SalesOrderLineSerializer(many=True)
    exchange_rate = serializers.DecimalField(
        max_digits=18,
        decimal_places=8,
        min_value=Decimal("0.00000001"),
        required=False,
    )

    class Meta:
        model = SalesOrder
        fields = (
            "id",
            "sales_order_no",
            "sales_order_type",
            "issue_date",
            "valid_date",
            "quotation_id",
            "customer_id",
            "customer_code",
            "customer_name",
            "customer_po",
            "sales_executive",
            "delivery_place",
            "currency",
            "exchange_rate",
            "notes",
            "gross_amount",
            "discount_amount",
            "net_amount",
            "vat_amount",
            "net_after_vat",
            "status",
            "lines",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "sales_order_no",
            "customer_code",
            "customer_name",
            "gross_amount",
            "discount_amount",
            "net_amount",
            "vat_amount",
            "net_after_vat",
            "status",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        if self.instance is None and not attrs.get("lines"):
            raise serializers.ValidationError(
                {"lines": "A sales order requires at least one line."}
            )
        if self.instance is not None:
            if self.instance.status != SalesOrder.Status.DRAFT:
                raise serializers.ValidationError(
                    {"status": "Only draft sales orders can be edited."}
                )
            if "lines" in attrs and not attrs["lines"]:
                raise serializers.ValidationError(
                    {"lines": "A sales order requires at least one line."}
                )

        issue_date = attrs.get(
            "issue_date",
            self.instance.issue_date if self.instance else timezone.localdate(),
        )
        valid_date = attrs.get(
            "valid_date",
            self.instance.valid_date if self.instance else None,
        )
        if valid_date and valid_date < issue_date:
            raise serializers.ValidationError(
                {"valid_date": "Valid date cannot be earlier than issue date."}
            )

        customer = attrs.get(
            "customer",
            self.instance.customer if self.instance else None,
        )
        quotation = attrs.get(
            "quotation",
            self.instance.quotation if self.instance else None,
        )
        if quotation and customer and quotation.customer_id != customer.id:
            raise serializers.ValidationError(
                {"quotation_id": "Quotation and sales order customers must match."}
            )

        currency = attrs.get(
            "currency",
            self.instance.currency if self.instance else SalesQuotation.Currency.SAR,
        )
        exchange_rate = attrs.get(
            "exchange_rate",
            self.instance.exchange_rate if self.instance else None,
        )
        if currency != SalesQuotation.Currency.SAR and exchange_rate is None:
            raise serializers.ValidationError(
                {"exchange_rate": "An exchange rate is required for non-SAR orders."}
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        prepared_lines = [prepare_sales_line(line) for line in lines_data]
        customer = validated_data["customer"]
        issue_date = validated_data.get("issue_date", timezone.localdate())
        validated_data.update(
            {
                "sales_order_no": generate_document_number("SO", issue_date),
                "customer_code": customer.code,
                "customer_name": customer.name,
                **calculate_document_totals(prepared_lines),
            }
        )
        sales_order = SalesOrder.objects.create(**validated_data)
        for line_no, (values, _) in enumerate(prepared_lines, start=1):
            SalesOrderLine.objects.create(
                sales_order=sales_order,
                line_no=line_no,
                **values,
            )
        return sales_order

    @transaction.atomic
    def update(self, instance, validated_data):
        sales_order = SalesOrder.objects.select_for_update().get(pk=instance.pk)
        if sales_order.status != SalesOrder.Status.DRAFT:
            raise serializers.ValidationError(
                {"status": "Only draft sales orders can be edited."}
            )

        lines_data = validated_data.pop("lines", None)
        if lines_data is not None:
            prepared_lines = [prepare_sales_line(line) for line in lines_data]
            sales_order.lines.all().delete()
            for line_no, (values, _) in enumerate(prepared_lines, start=1):
                SalesOrderLine.objects.create(
                    sales_order=sales_order,
                    line_no=line_no,
                    **values,
                )
            validated_data.update(calculate_document_totals(prepared_lines))

        customer = validated_data.get("customer")
        if customer:
            validated_data["customer_code"] = customer.code
            validated_data["customer_name"] = customer.name
        for field, value in validated_data.items():
            setattr(sales_order, field, value)
        sales_order.save()
        return sales_order


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ("id", "code", "name")
        read_only_fields = fields
