from django.urls import path
from rest_framework.routers import SimpleRouter

from .viewsets import (
    CustomerViewSet,
    PrintTemplateSettingAPIView,
    SalesOrderViewSet,
    SalesQuotationViewSet,
)


router = SimpleRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("quotations", SalesQuotationViewSet, basename="quotation")
router.register("sales-orders", SalesOrderViewSet, basename="sales-order")

urlpatterns = [
    path("print-template/", PrintTemplateSettingAPIView.as_view(), name="print-template"),
    *router.urls,
]
