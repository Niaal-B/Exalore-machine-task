from rest_framework.routers import SimpleRouter

from .viewsets import SalesQuotationViewSet


router = SimpleRouter()
router.register("quotations", SalesQuotationViewSet, basename="quotation")

urlpatterns = router.urls
