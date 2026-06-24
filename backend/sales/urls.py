from rest_framework.routers import SimpleRouter

from .viewsets import CustomerViewSet, SalesOrderViewSet, SalesQuotationViewSet


router = SimpleRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("quotations", SalesQuotationViewSet, basename="quotation")
router.register("sales-orders", SalesOrderViewSet, basename="sales-order")

urlpatterns = router.urls
