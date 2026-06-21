from django.db import models


class Item(models.Model):
    """A product or service maintained in the ERP item catalogue."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    class TaxStatus(models.TextChoices):
        TAXABLE = "taxable", "Taxable"
        NON_TAXABLE = "non_taxable", "Non-taxable"

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
        max_length=50,
        blank=True,
        help_text="Business behaviour classification; allowed values are pending confirmation.",
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
