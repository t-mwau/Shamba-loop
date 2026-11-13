from django.urls import path

from marketplace.views import HealthView, MarketplaceView, ListingCreateView, OfferCreateView, OfferDetailView


urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("marketplace/", MarketplaceView.as_view(), name="marketplace"),
    path("listings/", ListingCreateView.as_view(), name="listing-create"),
    path("offers/", OfferCreateView.as_view(), name="offer-create"),
    path("offers/<uuid:offer_id>/", OfferDetailView.as_view(), name="offer-detail"),
]
