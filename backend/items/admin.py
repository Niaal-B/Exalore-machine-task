from django.contrib import admin
from django.utils.html import format_html

from .models import Item, ItemPrice, ItemUnit


class ItemUnitInline(admin.TabularInline):
    model = ItemUnit
    fields = ("unit", "co_factor", "barcode")
    extra = 0
    show_change_link = True


class ItemPriceInline(admin.TabularInline):
    model = ItemPrice
    fields = ("price_list_type", "sale_price", "minimum_selling_price")
    extra = 0
    show_change_link = True


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "group_code",
        "status",
        "tax_status",
        "manufacturer",
        "updated_at",
    )
    search_fields = ("code", "name", "secondary_name", "generic_name")
    list_filter = ("status", "tax_status")
    ordering = ("code",)
    readonly_fields = ("image_preview", "created_at", "updated_at")
    list_per_page = 50
    inlines = (ItemUnitInline,)

    fieldsets = (
        (
            "Identification",
            {
                "fields": (
                    "code",
                    "name",
                    "secondary_name",
                    "generic_name",
                    "description",
                )
            },
        ),
        (
            "Classification",
            {
                "fields": (
                    "behaviour",
                    "group_code",
                    "status",
                    "tax_status",
                    "manufacturer",
                )
            },
        ),
        ("Storage", {"fields": ("shelf_code",)}),
        ("Image", {"fields": ("image", "image_preview")}),
        (
            "Audit",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    @admin.display(description="Current image")
    def image_preview(self, obj: Item) -> str:
        if not obj.image:
            return "No image"
        return format_html(
            '<img src="{}" alt="{}" style="max-height: 120px; max-width: 180px;" />',
            obj.image.url,
            obj.name,
        )


@admin.register(ItemUnit)
class ItemUnitAdmin(admin.ModelAdmin):
    list_display = (
        "item_code",
        "unit",
        "co_factor",
        "barcode",
        "updated_at",
    )
    search_fields = ("item__code", "item__name", "unit", "barcode")
    list_filter = ("unit",)
    ordering = ("item__code", "unit")
    readonly_fields = ("created_at", "updated_at")
    list_select_related = ("item",)
    autocomplete_fields = ("item",)
    list_per_page = 50
    inlines = (ItemPriceInline,)

    @admin.display(description="Item code", ordering="item__code")
    def item_code(self, obj: ItemUnit) -> str:
        return obj.item.code


@admin.register(ItemPrice)
class ItemPriceAdmin(admin.ModelAdmin):
    list_display = (
        "item_code",
        "unit",
        "price_list_type",
        "sale_price",
        "minimum_selling_price",
        "updated_at",
    )
    search_fields = (
        "item_unit__item__code",
        "item_unit__item__name",
        "item_unit__unit",
        "price_list_type",
    )
    list_filter = ("price_list_type", "item_unit__unit")
    ordering = ("item_unit__item__code", "item_unit__unit", "price_list_type")
    readonly_fields = ("created_at", "updated_at")
    list_select_related = ("item_unit", "item_unit__item")
    autocomplete_fields = ("item_unit",)
    list_per_page = 50

    @admin.display(description="Item code", ordering="item_unit__item__code")
    def item_code(self, obj: ItemPrice) -> str:
        return obj.item_unit.item.code

    @admin.display(description="Unit", ordering="item_unit__unit")
    def unit(self, obj: ItemPrice) -> str:
        return obj.item_unit.unit
