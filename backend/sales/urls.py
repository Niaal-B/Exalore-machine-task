from rest_framework.routers import SimpleRouter

from .viewsets import CustomerViewSet, SalesQuotationViewSet


router = SimpleRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("quotations", SalesQuotationViewSet, basename="quotation")

urlpatterns = router.urls
