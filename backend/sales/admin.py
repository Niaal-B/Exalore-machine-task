from django.contrib import admin
from django.http import JsonResponse
from django.urls import path
from items.models import ItemUnit

from .models import (
    Customer,
    PrintTemplateSetting,
    SalesQuotation,
    SalesQuotationLine,
)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name", "is_active", "updated_at")
    search_fields = ("id", "code", "name")
    list_filter = ("is_active",)
    ordering = ("id",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(PrintTemplateSetting)
class PrintTemplateSettingAdmin(admin.ModelAdmin):
    fields = ("header_image", "footer_image", "updated_at")
    readonly_fields = ("updated_at",)

    def has_add_permission(self, request):
        return not PrintTemplateSetting.objects.exists()


class SalesQuotationLineInline(admin.TabularInline):
    model = SalesQuotationLine
    extra = 1
    readonly_fields = ("item_code", "item_name", "unit")


from .serializers import generate_quotation_number

@admin.register(SalesQuotation)
class SalesQuotationAdmin(admin.ModelAdmin):
    class Media:
        js = ("js/sales_quotation_admin.js",)

    list_display = ("id", "quotation_no", "quotation_date", "customer", "status", "net_after_vat")
    search_fields = ("quotation_no", "customer__name", "customer__code", "customer_name")
    list_filter = ("status", "quotation_date", "currency")
    inlines = [SalesQuotationLineInline]
    readonly_fields = ("quotation_no", "customer_code", "customer_name", "created_at", "updated_at")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.quotation_no = generate_quotation_number(obj.quotation_date)
        if obj.customer:
            obj.customer_code = obj.customer.code
            obj.customer_name = obj.customer.name
        super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in formset.deleted_objects:
            obj.delete()
        for instance in instances:
            # Check if this is a SalesQuotationLine
            if isinstance(instance, SalesQuotationLine):
                if instance.item_unit_id:
                    instance.item_code = instance.item_unit.item.code
                    instance.item_name = instance.item_unit.item.name
                    instance.unit = instance.item_unit.unit
            instance.save()
        formset.save_m2m()

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "get-item-unit-pricing/",
                self.admin_site.admin_view(self.get_item_unit_pricing),
                name="salesquotation_item_pricing",
            ),
        ]
        return custom_urls + urls

    def get_item_unit_pricing(self, request):
        item_unit_id = request.GET.get("id")
        if not item_unit_id:
            return JsonResponse({"error": "No ID provided"}, status=400)
        try:
            item_unit = ItemUnit.objects.select_related("item").get(id=item_unit_id)
            price_obj = item_unit.prices.filter(price_list_type__iexact="Retail").first()
            sale_price = price_obj.sale_price if price_obj else "0"
            vat_percentage = "15.0000" if item_unit.item.tax_status == "taxable" else "0.0000"
            return JsonResponse({
                "sale_price": str(sale_price),
                "vat_percentage": str(vat_percentage)
            })
        except ItemUnit.DoesNotExist:
            return JsonResponse({"error": "Item unit not found"}, status=404)
