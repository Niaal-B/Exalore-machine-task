from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.db.models.functions import Lower


class Item(models.Model):
    """A product or service maintained in the ERP item catalogue."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    class TaxStatus(models.TextChoices):
        TAXABLE = "taxable", "Taxable"
        NON_TAXABLE = "non_taxable", "Non-taxable"

    class Behaviour(models.TextChoices):
        STOCK = "stock", "Stock Item"
        PURCHASE = "purchase", "Purchase Item"
        NON_STOCK = "non_stock", "Non Stock Item"
        SERVICE = "service", "Service"
        ASSEMBLY = "assembly", "Assembly"

    code = models.CharField(
        "item code",
        max_length=50,
        unique=True,
        help_text="Unique business identifier for the item.",
    )
    name = models.CharField("name 1", max_length=255)
    secondary_name = models.CharField("name 2", max_length=255, blank=True)
    generic_name = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    behaviour = models.CharField(
        max_length=20,
        choices=Behaviour.choices,
        default=Behaviour.STOCK,
        help_text="Defines how the ERP handles the item.",
    )
    group_code = models.CharField(max_length=50, blank=True, db_index=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )
    tax_status = models.CharField(
        "taxable status",
        max_length=20,
        choices=TaxStatus.choices,
        default=TaxStatus.TAXABLE,
    )
    shelf_code = models.CharField(max_length=50, blank=True)
    manufacturer = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="items/images/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("code",)
        verbose_name = "item"
        verbose_name_plural = "items"

    def __str__(self) -> str:
        return f"{self.code} - {self.name}"


class ItemUnit(models.Model):
    """An item-specific unit of measure and its stock conversion factor."""

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="units",
        verbose_name="item",
        help_text="Item to which this unit configuration belongs.",
    )
    unit = models.CharField(
        "unit",
        max_length=50,
        help_text="Unit name or code, for example Pcs or Box.",
    )
    co_factor = models.DecimalField(
        "conversion factor",
        max_digits=18,
        decimal_places=6,
        validators=[MinValueValidator(Decimal("0.000001"))],
        help_text="Number of stock units represented by one of this unit.",
    )
    barcode = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
        help_text="Optional unique barcode for this item unit.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("item_id", "unit")
        verbose_name = "item unit"
        verbose_name_plural = "item units"
        constraints = (
            models.UniqueConstraint(
                Lower("unit"),
                "item",
                name="unique_case_insensitive_unit_per_item",
            ),
            models.CheckConstraint(
                condition=models.Q(co_factor__gt=0),
                name="item_unit_co_factor_gt_zero",
            ),
        )

    def __str__(self) -> str:
        return f"{self.item.code} - {self.unit}"


class ItemPrice(models.Model):
    """A unit-specific selling price within an item price-list type."""

    item_unit = models.ForeignKey(
        ItemUnit,
        on_delete=models.CASCADE,
        related_name="prices",
        verbose_name="item unit",
        help_text="Configured item unit to which this price applies.",
    )
    price_list_type = models.CharField(
        "price list type",
        max_length=50,
        help_text="Pricing category, for example Retail or Wholesale.",
    )
    sale_price = models.DecimalField(
        "sale price",
        max_digits=18,
        decimal_places=4,
        validators=[MinValueValidator(Decimal("0"))],
        help_text="Default selling price for this item unit.",
    )
    minimum_selling_price = models.DecimalField(
        "minimum selling price",
        max_digits=18,
        decimal_places=4,
        validators=[MinValueValidator(Decimal("0"))],
        help_text="Lowest permitted selling price for this item unit.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("item_unit_id", "price_list_type")
        verbose_name = "item price"
        verbose_name_plural = "item prices"
        constraints = (
            models.UniqueConstraint(
                Lower("price_list_type"),
                "item_unit",
                name="unique_item_unit_price_list_type",
            ),
            models.CheckConstraint(
                condition=models.Q(sale_price__gte=0),
                name="item_price_sale_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(minimum_selling_price__gte=0),
                name="item_price_min_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(minimum_selling_price__lte=models.F("sale_price")),
                name="item_price_min_lte_sale",
            ),
        )

    def __str__(self) -> str:
        return f"{self.item_unit.item.code} - {self.price_list_type} - {self.item_unit.unit}"
