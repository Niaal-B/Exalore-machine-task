from decimal import Decimal

from django.db import models
from django.utils import timezone

from items.models import ItemUnit


class Customer(models.Model):
    """A customer available for selection in sales documents."""

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("code",)
        verbose_name = "customer"
        verbose_name_plural = "customers"

    def __str__(self) -> str:
        return f"{self.code} - {self.name}"


class SalesQuotation(models.Model):
    """A customer quotation and its historically recorded totals."""

    class Currency(models.TextChoices):
        SAR = "SAR", "Saudi Riyal"
        AED = "AED", "UAE Dirham"
        QAR = "QAR", "Qatari Riyal"
        KWD = "KWD", "Kuwaiti Dinar"
        BHD = "BHD", "Bahraini Dinar"
        OMR = "OMR", "Omani Rial"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"

    quotation_no = models.CharField(
        "quotation number",
        max_length=50,
        unique=True,
        help_text="Unique business document number for the quotation.",
    )
    quotation_date = models.DateField(
        default=timezone.localdate,
        db_index=True,
        help_text="Business date on which the quotation was issued.",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="sales_quotations",
        help_text="Customer selected for this quotation.",
    )
    customer_code = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Customer code captured when the quotation was created.",
    )
    customer_name = models.CharField(
        max_length=255,
        help_text="Customer name snapshot retained for historical accuracy.",
    )
    customer_ref_no = models.CharField(
        "customer reference number",
        max_length=100,
        blank=True,
    )
    sales_executive = models.CharField(max_length=255, blank=True)
    attention = models.CharField(max_length=255, blank=True)
    pay_terms = models.CharField(
        "payment terms",
        max_length=255,
        blank=True,
    )
    delivery_place = models.CharField(max_length=255, blank=True)
    currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        default=Currency.SAR,
    )
    exchange_rate = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal("1"),
        help_text="Multiplier used to convert the document currency to base currency.",
    )
    notes = models.TextField(blank=True)
    gross_amount = models.DecimalField(
        max_digits=18,
        decimal_places=4,
        default=Decimal("0"),
    )
    discount_amount = models.DecimalField(
        max_digits=18,
        decimal_places=4,
        default=Decimal("0"),
    )
    net_amount = models.DecimalField(
        max_digits=18,
        decimal_places=4,
        default=Decimal("0"),
    )
    vat_amount = models.DecimalField(
        "VAT amount",
        max_digits=18,
        decimal_places=4,
        default=Decimal("0"),
    )
    net_after_vat = models.DecimalField(
        "net after VAT",
        max_digits=18,
        decimal_places=4,
        default=Decimal("0"),
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-quotation_date", "-id")
        verbose_name = "sales quotation"
        verbose_name_plural = "sales quotations"
        indexes = (
            models.Index(
                fields=("status", "quotation_date"),
                name="sq_status_date_idx",
            ),
        )
        constraints = (
            models.CheckConstraint(
                condition=models.Q(exchange_rate__gt=0),
                name="sq_exchange_rate_gt_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(gross_amount__gte=0),
                name="sq_gross_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(discount_amount__gte=0),
                name="sq_discount_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(discount_amount__lte=models.F("gross_amount")),
                name="sq_discount_lte_gross",
            ),
            models.CheckConstraint(
                condition=models.Q(net_amount__gte=0),
                name="sq_net_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(vat_amount__gte=0),
                name="sq_vat_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(net_after_vat__gte=models.F("net_amount")),
                name="sq_total_gte_net",
            ),
        )

    def __str__(self) -> str:
        return f"{self.quotation_no} - {self.customer_name}"


class SalesQuotationLine(models.Model):
    """A priced quotation line with immutable item-detail snapshots."""

    quotation = models.ForeignKey(
        SalesQuotation,
        on_delete=models.CASCADE,
        related_name="lines",
        help_text="Quotation header to which this line belongs.",
    )
    line_no = models.PositiveIntegerField("line number")
    item_unit = models.ForeignKey(
        ItemUnit,
        on_delete=models.PROTECT,
        related_name="sales_quotation_lines",
        help_text=(
            "Current item-unit reference retained for validation, reporting, "
            "and navigation."
        ),
    )
    item_code = models.CharField(
        max_length=50,
        help_text="Item code snapshot captured when the quotation was created.",
    )
    item_name = models.CharField(
        max_length=255,
        help_text="Item name snapshot captured when the quotation was created.",
    )
    description = models.TextField(blank=True)
    unit = models.CharField(
        max_length=50,
        help_text="Unit snapshot selected for this quotation line.",
    )
    quantity = models.DecimalField(
        max_digits=18,
        decimal_places=6,
    )
    rate = models.DecimalField(
        max_digits=18,
        decimal_places=4,
    )
    discount_percentage = models.DecimalField(
        max_digits=7,
        decimal_places=4,
        default=Decimal("0"),
    )
    discount_amount = models.DecimalField(
        max_digits=18,
        decimal_places=4,
        default=Decimal("0"),
    )
    vat_percentage = models.DecimalField(
        "VAT percentage",
        max_digits=7,
        decimal_places=4,
        default=Decimal("0"),
    )
    vat_amount = models.DecimalField(
        "VAT amount",
        max_digits=18,
        decimal_places=4,
        default=Decimal("0"),
    )
    net_amount = models.DecimalField(
        max_digits=18,
        decimal_places=4,
    )
    net_after_vat = models.DecimalField(
        "net after VAT",
        max_digits=18,
        decimal_places=4,
    )

    class Meta:
        ordering = ("quotation_id", "line_no")
        verbose_name = "sales quotation line"
        verbose_name_plural = "sales quotation lines"
        constraints = (
            models.UniqueConstraint(
                fields=("quotation", "line_no"),
                name="unique_sq_line_number",
            ),
            models.CheckConstraint(
                condition=models.Q(line_no__gt=0),
                name="sq_line_number_gt_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(quantity__gt=0),
                name="sq_line_quantity_gt_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(rate__gte=0),
                name="sq_line_rate_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(
                    discount_percentage__gte=0,
                    discount_percentage__lte=100,
                ),
                name="sq_line_discount_pct_range",
            ),
            models.CheckConstraint(
                condition=models.Q(discount_amount__gte=0),
                name="sq_line_discount_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(
                    vat_percentage__gte=0,
                    vat_percentage__lte=100,
                ),
                name="sq_line_vat_pct_range",
            ),
            models.CheckConstraint(
                condition=models.Q(vat_amount__gte=0),
                name="sq_line_vat_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(net_amount__gte=0),
                name="sq_line_net_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(net_after_vat__gte=models.F("net_amount")),
                name="sq_line_total_gte_net",
            ),
        )

    def __str__(self) -> str:
        return f"{self.quotation.quotation_no} - Line {self.line_no}"


class SalesOrder(models.Model):
    """A customer sales order, optionally created from a quotation."""

    class OrderType(models.TextChoices):
        NORMAL = "normal", "Normal"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"

    sales_order_no = models.CharField(max_length=50, unique=True)
    sales_order_type = models.CharField(
        max_length=20,
        choices=OrderType.choices,
        default=OrderType.NORMAL,
    )
    issue_date = models.DateField(default=timezone.localdate, db_index=True)
    valid_date = models.DateField(null=True, blank=True)
    quotation = models.ForeignKey(
        SalesQuotation,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="sales_orders",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="sales_orders",
    )
    customer_code = models.CharField(max_length=50, db_index=True)
    customer_name = models.CharField(max_length=255)
    customer_po = models.CharField("customer PO", max_length=100, blank=True)
    sales_executive = models.CharField(max_length=255, blank=True)
    delivery_place = models.CharField(max_length=255, blank=True)
    currency = models.CharField(
        max_length=3,
        choices=SalesQuotation.Currency.choices,
        default=SalesQuotation.Currency.SAR,
    )
    exchange_rate = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        default=Decimal("1"),
    )
    notes = models.TextField(blank=True)
    gross_amount = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0")
    )
    discount_amount = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0")
    )
    net_amount = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0")
    )
    vat_amount = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0")
    )
    net_after_vat = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0")
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-issue_date", "-id")
        indexes = (
            models.Index(fields=("status", "issue_date"), name="so_status_date_idx"),
        )
        constraints = (
            models.CheckConstraint(
                condition=models.Q(exchange_rate__gt=0),
                name="so_exchange_rate_gt_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(valid_date__isnull=True)
                | models.Q(valid_date__gte=models.F("issue_date")),
                name="so_valid_date_gte_issue",
            ),
            models.CheckConstraint(
                condition=models.Q(gross_amount__gte=0), name="so_gross_non_negative"
            ),
            models.CheckConstraint(
                condition=models.Q(discount_amount__gte=0),
                name="so_discount_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(discount_amount__lte=models.F("gross_amount")),
                name="so_discount_lte_gross",
            ),
            models.CheckConstraint(
                condition=models.Q(net_amount__gte=0), name="so_net_non_negative"
            ),
            models.CheckConstraint(
                condition=models.Q(vat_amount__gte=0), name="so_vat_non_negative"
            ),
            models.CheckConstraint(
                condition=models.Q(net_after_vat__gte=models.F("net_amount")),
                name="so_total_gte_net",
            ),
        )

    def __str__(self) -> str:
        return f"{self.sales_order_no} - {self.customer_name}"


class SalesOrderLine(models.Model):
    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.CASCADE,
        related_name="lines",
    )
    line_no = models.PositiveIntegerField()
    item_unit = models.ForeignKey(
        ItemUnit,
        on_delete=models.PROTECT,
        related_name="sales_order_lines",
    )
    item_code = models.CharField(max_length=50)
    item_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=18, decimal_places=6)
    rate = models.DecimalField(max_digits=18, decimal_places=4)
    discount_percentage = models.DecimalField(
        max_digits=7, decimal_places=4, default=Decimal("0")
    )
    discount_amount = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0")
    )
    vat_percentage = models.DecimalField(
        max_digits=7, decimal_places=4, default=Decimal("0")
    )
    vat_amount = models.DecimalField(
        max_digits=18, decimal_places=4, default=Decimal("0")
    )
    net_amount = models.DecimalField(max_digits=18, decimal_places=4)
    net_after_vat = models.DecimalField(max_digits=18, decimal_places=4)

    class Meta:
        ordering = ("sales_order_id", "line_no")
        constraints = (
            models.UniqueConstraint(
                fields=("sales_order", "line_no"), name="unique_so_line_number"
            ),
            models.CheckConstraint(
                condition=models.Q(line_no__gt=0), name="so_line_number_gt_zero"
            ),
            models.CheckConstraint(
                condition=models.Q(quantity__gt=0), name="so_line_quantity_gt_zero"
            ),
            models.CheckConstraint(
                condition=models.Q(rate__gte=0), name="so_line_rate_non_negative"
            ),
            models.CheckConstraint(
                condition=models.Q(
                    discount_percentage__gte=0,
                    discount_percentage__lte=100,
                ),
                name="so_line_discount_pct_range",
            ),
            models.CheckConstraint(
                condition=models.Q(discount_amount__gte=0),
                name="so_line_discount_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(
                    vat_percentage__gte=0,
                    vat_percentage__lte=100,
                ),
                name="so_line_vat_pct_range",
            ),
            models.CheckConstraint(
                condition=models.Q(vat_amount__gte=0),
                name="so_line_vat_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(net_amount__gte=0), name="so_line_net_non_negative"
            ),
            models.CheckConstraint(
                condition=models.Q(net_after_vat__gte=models.F("net_amount")),
                name="so_line_total_gte_net",
            ),
        )

    def __str__(self) -> str:
        return f"{self.sales_order.sales_order_no} - Line {self.line_no}"
