from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4

from django.conf import settings
from rest_framework import serializers

from items.models import Item


MONEY_QUANTUM = Decimal("0.0001")
DEFAULT_VAT_PERCENTAGE = Decimal(
    str(getattr(settings, "SALES_DEFAULT_VAT_PERCENTAGE", "15.0000"))
)


def generate_document_number(prefix: str, document_date) -> str:
    suffix = uuid4().hex[:12].upper()
    return f"{prefix}-{document_date:%Y%m%d}-{suffix}"


def money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)


def calculate_line_totals(
    quantity: Decimal,
    rate: Decimal,
    discount_percentage: Decimal,
    vat_percentage: Decimal,
) -> dict[str, Decimal]:
    gross_amount = money(quantity * rate)
    discount_amount = money(
        gross_amount * discount_percentage / Decimal("100")
    )
    net_amount = money(gross_amount - discount_amount)
    vat_amount = money(net_amount * vat_percentage / Decimal("100"))
    return {
        "gross_amount": gross_amount,
        "discount_amount": discount_amount,
        "net_amount": net_amount,
        "vat_amount": vat_amount,
        "net_after_vat": money(net_amount + vat_amount),
    }


def prepare_sales_line(payload: dict) -> tuple[dict, Decimal]:
    item_unit = payload["item_unit"]
    if item_unit.item.status != Item.Status.ACTIVE:
        raise serializers.ValidationError(
            {"lines": f"Item {item_unit.item.code} is inactive."}
        )

    price = item_unit.prices.filter(price_list_type__iexact="Retail").first()
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
    discount_percentage = payload.get("discount_percentage", Decimal("0"))
    effective_unit_price = money(
        rate * (Decimal("100") - discount_percentage) / Decimal("100")
    )
    if effective_unit_price < price.minimum_selling_price:
        raise serializers.ValidationError(
            {
                "lines": (
                    f"Discount reduces {item_unit.item.code} "
                    f"({item_unit.unit}) to {effective_unit_price}. "
                    f"The minimum selling price is {price.minimum_selling_price}."
                )
            }
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
        "description": payload.get("description", item_unit.item.description),
        "unit": item_unit.unit,
        "quantity": quantity,
        "rate": rate,
        "discount_percentage": discount_percentage,
        "vat_percentage": vat_percentage,
        **totals,
    }, gross_amount


def calculate_document_totals(prepared_lines) -> dict[str, Decimal]:
    totals = {
        "gross_amount": Decimal("0"),
        "discount_amount": Decimal("0"),
        "net_amount": Decimal("0"),
        "vat_amount": Decimal("0"),
        "net_after_vat": Decimal("0"),
    }
    for values, line_gross in prepared_lines:
        totals["gross_amount"] += line_gross
        totals["discount_amount"] += values["discount_amount"]
        totals["net_amount"] += values["net_amount"]
        totals["vat_amount"] += values["vat_amount"]
        totals["net_after_vat"] += values["net_after_vat"]
    return {key: money(value) for key, value in totals.items()}
