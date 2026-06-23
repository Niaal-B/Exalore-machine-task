from django.contrib import admin

from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_active", "updated_at")
    search_fields = ("code", "name")
    list_filter = ("is_active",)
    ordering = ("code",)
    readonly_fields = ("created_at", "updated_at")
