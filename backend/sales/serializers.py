from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from items.models import Item, ItemUnit

from .models import Customer, SalesQuotation, SalesQuotationLine


MONEY_QUANTUM = Decimal("0.0001")
DEFAULT_VAT_PERCENTAGE = Decimal(
    str(getattr(settings, "SALES_DEFAULT_VAT_PERCENTAGE", "15.0000"))
)


def generate_quotation_number(quotation_date) -> str:
    random_suffix = uuid4().hex[:12].upper()
    return f"SQ-{quotation_date:%Y%m%d}-{random_suffix}"


def _money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)


def calculate_line_totals(
    quantity: Decimal,
    rate: Decimal,
    discount_percentage: Decimal,
    vat_percentage: Decimal,
) -> dict[str, Decimal]:
    gross_amount = _money(quantity * rate)
    discount_amount = _money(
        gross_amount * discount_percentage / Decimal("100")
    )
    net_amount = _money(gross_amount - discount_amount)
    vat_amount = _money(net_amount * vat_percentage / Decimal("100"))
    return {
        "gross_amount": gross_amount,
        "discount_amount": discount_amount,
        "net_amount": net_amount,
        "vat_amount": vat_amount,
        "net_after_vat": _money(net_amount + vat_amount),
    }


def prepare_line_data(payload: dict) -> tuple[dict, Decimal]:
    item_unit = payload["item_unit"]
    if item_unit.item.status != Item.Status.ACTIVE:
        raise serializers.ValidationError(
            {"lines": f"Item {item_unit.item.code} is inactive."}
        )

    price = item_unit.prices.filter(
        price_list_type__iexact="Retail"
    ).first()
    if price is None:
        raise serializers.ValidationError(
            {
                "lines": (
                    f"Retail pricing is not configured for "
                    f"{item_unit.item.code} ({item_unit.unit})."
                )
            }
        )

    rate = payload.get("rate", price.sale_price)
    if rate < price.minimum_selling_price:
        raise serializers.ValidationError(
            {
                "lines": (
                    f"Rate for {item_unit.item.code} ({item_unit.unit}) "
                    f"cannot be below {price.minimum_selling_price}."
                )
            }
        )

    quantity = payload["quantity"]
    discount_percentage = payload.get(
        "discount_percentage",
        Decimal("0"),
    )
    vat_percentage = (
        DEFAULT_VAT_PERCENTAGE
        if item_unit.item.tax_status == Item.TaxStatus.TAXABLE
        else Decimal("0")
    )
    totals = calculate_line_totals(
        quantity,
        rate,
        discount_percentage,
        vat_percentage,
    )
    gross_amount = totals.pop("gross_amount")
    return {
        "item_unit": item_unit,
        "item_code": item_unit.item.code,
        "item_name": item_unit.item.name,
        "description": payload.get(
            "description",
            item_unit.item.description,
        ),
        "unit": item_unit.unit,
        "quantity": quantity,
        "rate": rate,
        "discount_percentage": discount_percentage,
        "vat_percentage": vat_percentage,
        **totals,
    }, gross_amount


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
        if not attrs.get("lines"):
            raise serializers.ValidationError(
                {"lines": "A quotation requires at least one line."}
            )

        currency = attrs.get("currency", SalesQuotation.Currency.SAR)
        if (
            currency != SalesQuotation.Currency.SAR
            and "exchange_rate" not in attrs
        ):
            raise serializers.ValidationError(
                {
                    "exchange_rate": (
                        "An exchange rate is required for non-SAR quotations."
                    )
                }
            )
        return attrs

    @staticmethod
    def _document_totals(prepared_lines):
        gross = Decimal("0")
        discount = Decimal("0")
        net = Decimal("0")
        vat = Decimal("0")
        total = Decimal("0")

        for values, line_gross in prepared_lines:
            gross += line_gross
            discount += values["discount_amount"]
            net += values["net_amount"]
            vat += values["vat_amount"]
            total += values["net_after_vat"]

        return {
            "gross_amount": _money(gross),
            "discount_amount": _money(discount),
            "net_amount": _money(net),
            "vat_amount": _money(vat),
            "net_after_vat": _money(total),
        }

    @transaction.atomic
    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        prepared_lines = [
            prepare_line_data(line_data) for line_data in lines_data
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
                **self._document_totals(prepared_lines),
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

