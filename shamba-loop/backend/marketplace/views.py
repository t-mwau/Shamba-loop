import logging
import uuid
from decimal import Decimal, InvalidOperation

from django.db import DatabaseError, IntegrityError, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from marketplace.models import Listing, Offer

logger = logging.getLogger(__name__)
WASTE_TYPES = {"Maize stalks", "Coffee husks", "Manure", "Rice husks"}
AVAILABLE_DATES = {"Ready today", "Ready tomorrow", "Ready this week", "Ready next week"}
MAX_QUANTITY_KG = Decimal("1000000000")
MAX_PRICE_PER_KG = Decimal("1000000")


def parse_positive_decimal(value, label, maximum):
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError(f"{label} must be a valid number.") from None
    if not amount.is_finite() or amount < 1 or amount > maximum:
        raise ValueError(f"{label} must be between 1 and {maximum}.")
    return amount


def listing_payload(listing, is_owner=False):
    return {
        "id": str(listing.id),
        "wasteType": listing.waste_type,
        "quantityKg": float(listing.quantity_kg),
        "pricePerKg": float(listing.price_per_kg),
        "location": listing.location,
        "distanceKm": 0,
        "farmerName": "You" if is_owner else "Local farmer",
        "quality": "Farmer supplied",
        "availableDate": listing.available_date,
        "status": listing.status,
    }


def offer_payload(offer):
    return {
        "id": str(offer.id),
        "listingId": str(offer.listing_id),
        "listingName": offer.listing.waste_type,
        "farmerName": "You",
        "processorName": "ShambaLoop processor",
        "quantityKg": float(offer.quantity_kg),
        "pricePerKg": float(offer.price_per_kg),
        "totalAmount": float(offer.quantity_kg * offer.price_per_kg),
        "pickupDate": offer.pickup_date,
        "message": offer.message,
        "status": offer.status,
    }


class HealthView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        from django.db import connection

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except DatabaseError:
            logger.exception("Django database health check failed.")
            return Response({"status": "unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"status": "ok"})


class MarketplaceView(APIView):
    def get(self, request):
        user_id = request.user.id
        active_statuses = [Listing.Status.AVAILABLE, Listing.Status.OFFER_RECEIVED]
        marketplace_listings = Listing.objects.filter(status__in=active_statuses).exclude(
            farmer_id=user_id
        )
        farmer_listings = Listing.objects.filter(farmer_id=user_id)
        farmer_offers = Offer.objects.filter(farmer_id=user_id).select_related("listing")
        return Response(
            {
                "listings": [listing_payload(listing) for listing in marketplace_listings],
                "farmerListings": [
                    listing_payload(listing, is_owner=True) for listing in farmer_listings
                ],
                "offers": [offer_payload(offer) for offer in farmer_offers],
            }
        )


class ListingCreateView(APIView):
    def post(self, request):
        data = request.data
        if not isinstance(data, dict):
            return Response({"error": "Send valid listing details."}, status=400)
        waste_type = data.get("wasteType")
        location = data.get("location")
        available_date = data.get("availableDate")
        if not isinstance(waste_type, str) or waste_type not in WASTE_TYPES:
            return Response({"error": "Choose a supported farm waste type."}, status=400)
        if not isinstance(location, str) or not location.strip() or len(location.strip()) > 120:
            return Response({"error": "Enter a pickup location of 120 characters or fewer."}, status=400)
        if not isinstance(available_date, str) or available_date not in AVAILABLE_DATES:
            return Response({"error": "Choose when the waste will be ready."}, status=400)
        try:
            quantity = parse_positive_decimal(
                data.get("quantityKg"), "Quantity (kg)", MAX_QUANTITY_KG
            )
            price = parse_positive_decimal(
                data.get("pricePerKg"), "Price per kg", MAX_PRICE_PER_KG
            )
        except ValueError as error:
            return Response({"error": str(error)}, status=400)

        try:
            Listing.objects.create(
                farmer_id=request.user.id,
                waste_type=waste_type,
                quantity_kg=quantity,
                price_per_kg=price,
                location=location.strip(),
                available_date=available_date,
            )
        except (IntegrityError, OverflowError):
            logger.exception("Could not save marketplace listing.")
            return Response(
                {"error": "Your listing could not be saved. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"success": True}, status=status.HTTP_201_CREATED)


class OfferCreateView(APIView):
    def post(self, request):
        if not isinstance(request.data, dict):
            return Response({"error": "Send valid offer details."}, status=400)
        listing_id = request.data.get("listingId")
        try:
            listing_id = uuid.UUID(str(listing_id))
        except (AttributeError, TypeError, ValueError):
            return Response({"error": "Choose a valid listing."}, status=400)
        message = request.data.get("message", "")
        if not isinstance(message, str) or len(message) > 120:
            return Response({"error": "Your note must be 120 characters or fewer."}, status=400)
        try:
            price = parse_positive_decimal(
                request.data.get("pricePerKg"), "Offer price per kg", MAX_PRICE_PER_KG
            )
        except ValueError as error:
            return Response({"error": str(error)}, status=400)

        try:
            with transaction.atomic():
                listing = Listing.objects.select_for_update().get(pk=listing_id)
                if listing.farmer_id == request.user.id:
                    return Response({"error": "You cannot make an offer on your own listing."}, status=400)
                if listing.status not in (Listing.Status.AVAILABLE, Listing.Status.OFFER_RECEIVED):
                    return Response({"error": "This listing is no longer accepting offers."}, status=409)
                Offer.objects.create(
                    listing=listing,
                    farmer_id=listing.farmer_id,
                    processor_id=request.user.id,
                    quantity_kg=listing.quantity_kg,
                    price_per_kg=price,
                    message=message.strip(),
                )
                if listing.status == Listing.Status.AVAILABLE:
                    listing.status = Listing.Status.OFFER_RECEIVED
                    listing.save(update_fields=["status", "updated_at"])
        except Listing.DoesNotExist:
            return Response({"error": "This listing could not be found."}, status=404)
        return Response({"success": True}, status=status.HTTP_201_CREATED)


class OfferDetailView(APIView):
    def patch(self, request, offer_id):
        if not isinstance(request.data, dict):
            return Response({"error": "Send a valid response."}, status=400)
        accepted = request.data.get("accepted")
        if not isinstance(accepted, bool):
            return Response({"error": "Choose whether to accept or decline this offer."}, status=400)

        offer_summary = Offer.objects.filter(pk=offer_id, farmer_id=request.user.id).values(
            "listing_id"
        ).first()
        if not offer_summary:
            return Response({"error": "This offer could not be found."}, status=404)

        try:
            with transaction.atomic():
                listing = Listing.objects.select_for_update().get(
                    pk=offer_summary["listing_id"],
                    farmer_id=request.user.id,
                )
                offer = Offer.objects.select_for_update().get(
                    pk=offer_id,
                    farmer_id=request.user.id,
                )
                if offer.status != Offer.Status.PENDING:
                    return Response({"error": "This offer is no longer available to update."}, status=409)
                if accepted and listing.status not in (
                    Listing.Status.AVAILABLE,
                    Listing.Status.OFFER_RECEIVED,
                ):
                    return Response({"error": "This listing has already been scheduled."}, status=409)

                offer.status = Offer.Status.ACCEPTED if accepted else Offer.Status.DECLINED
                offer.save(update_fields=["status", "updated_at"])
                if accepted:
                    listing.status = Listing.Status.PICKUP_SCHEDULED
                    listing.save(update_fields=["status", "updated_at"])
                    Offer.objects.filter(
                        listing=listing,
                        status=Offer.Status.PENDING,
                    ).exclude(pk=offer.pk).update(
                        status=Offer.Status.DECLINED,
                        updated_at=timezone.now(),
                    )
                else:
                    another_pending = Offer.objects.filter(
                        listing=listing,
                        status=Offer.Status.PENDING,
                    ).exists()
                    if not another_pending and listing.status == Listing.Status.OFFER_RECEIVED:
                        listing.status = Listing.Status.AVAILABLE
                        listing.save(update_fields=["status", "updated_at"])
        except (Listing.DoesNotExist, Offer.DoesNotExist, ValueError):
            return Response({"error": "This offer is no longer available to update."}, status=409)
        return Response({"success": True})
