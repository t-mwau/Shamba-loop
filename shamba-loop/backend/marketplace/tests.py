from decimal import Decimal
from unittest.mock import patch

import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from marketplace.authentication import ClerkPrincipal
from marketplace.models import Listing, Offer


class MarketplaceApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.farmer = ClerkPrincipal("farmer_1")
        self.processor = ClerkPrincipal("processor_1")
        self.listing = Listing.objects.create(
            farmer_id=self.farmer.id,
            waste_type="Maize stalks",
            quantity_kg=Decimal("850"),
            price_per_kg=Decimal("8"),
            location="Nakuru, Rift Valley",
            available_date="Ready today",
        )

    def test_marketplace_requires_authentication(self):
        response = self.client.get("/api/marketplace/")
        self.assertEqual(response.status_code, 401)

    def test_marketplace_shows_other_farmers_listings(self):
        self.client.force_authenticate(user=self.processor)
        response = self.client.get("/api/marketplace/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["listings"]), 1)
        self.assertEqual(response.data["listings"][0]["id"], str(self.listing.id))
        self.assertEqual(response.data["farmerListings"], [])

    def test_farmer_can_create_a_validated_listing(self):
        self.client.force_authenticate(user=self.farmer)
        response = self.client.post(
            "/api/listings/",
            {
                "wasteType": "Coffee husks",
                "quantityKg": 250,
                "pricePerKg": 12,
                "location": "Njoro, Nakuru",
                "availableDate": "Ready tomorrow",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Listing.objects.filter(farmer_id=self.farmer.id).count(), 2)

    def test_invalid_listing_is_rejected(self):
        self.client.force_authenticate(user=self.farmer)
        response = self.client.post(
            "/api/listings/",
            {
                "wasteType": "Unsupported",
                "quantityKg": 0,
                "pricePerKg": 12,
                "location": "Nakuru",
                "availableDate": "Ready today",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Listing.objects.count(), 1)

    def test_processor_can_make_offer_and_owner_can_accept_it(self):
        self.client.force_authenticate(user=self.processor)
        response = self.client.post(
            "/api/offers/",
            {"listingId": str(self.listing.id), "pricePerKg": 9, "message": "I can collect."},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        offer = Offer.objects.get()
        self.assertEqual(offer.farmer_id, self.farmer.id)

        self.client.force_authenticate(user=self.farmer)
        response = self.client.patch(
            f"/api/offers/{offer.id}/",
            {"accepted": True},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.listing.refresh_from_db()
        offer.refresh_from_db()
        self.assertEqual(self.listing.status, Listing.Status.PICKUP_SCHEDULED)
        self.assertEqual(offer.status, Offer.Status.ACCEPTED)

    def test_accepting_an_offer_declines_other_pending_offers(self):
        first_offer = Offer.objects.create(
            listing=self.listing,
            farmer_id=self.farmer.id,
            processor_id=self.processor.id,
            quantity_kg=self.listing.quantity_kg,
            price_per_kg=Decimal("9"),
        )
        second_offer = Offer.objects.create(
            listing=self.listing,
            farmer_id=self.farmer.id,
            processor_id="processor_2",
            quantity_kg=self.listing.quantity_kg,
            price_per_kg=Decimal("10"),
        )
        self.client.force_authenticate(user=self.farmer)
        response = self.client.patch(
            f"/api/offers/{first_offer.id}/",
            {"accepted": True},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        first_offer.refresh_from_db()
        second_offer.refresh_from_db()
        self.assertEqual(first_offer.status, Offer.Status.ACCEPTED)
        self.assertEqual(second_offer.status, Offer.Status.DECLINED)

    def test_declining_last_pending_offer_reopens_listing(self):
        offer = Offer.objects.create(
            listing=self.listing,
            farmer_id=self.farmer.id,
            processor_id=self.processor.id,
            quantity_kg=self.listing.quantity_kg,
            price_per_kg=Decimal("9"),
        )
        self.listing.status = Listing.Status.OFFER_RECEIVED
        self.listing.save(update_fields=["status"])
        self.client.force_authenticate(user=self.farmer)
        response = self.client.patch(
            f"/api/offers/{offer.id}/",
            {"accepted": False},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.status, Listing.Status.AVAILABLE)

    def test_offer_cannot_be_submitted_on_own_listing(self):
        self.client.force_authenticate(user=self.farmer)
        response = self.client.post(
            "/api/offers/",
            {"listingId": str(self.listing.id), "pricePerKg": 9},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Offer.objects.count(), 0)

    def test_only_the_listing_owner_can_respond_to_offer(self):
        offer = Offer.objects.create(
            listing=self.listing,
            farmer_id=self.farmer.id,
            processor_id=self.processor.id,
            quantity_kg=self.listing.quantity_kg,
            price_per_kg=Decimal("9"),
        )
        self.client.force_authenticate(user=self.processor)
        response = self.client.patch(
            f"/api/offers/{offer.id}/",
            {"accepted": True},
            format="json",
        )
        self.assertEqual(response.status_code, 404)
        offer.refresh_from_db()
        self.assertEqual(offer.status, Offer.Status.PENDING)


class ClerkJWTAuthenticationTests(TestCase):
    @override_settings(
        CLERK_JWKS_URL="https://clerk.example/.well-known/jwks.json",
        CLERK_JWT_ISSUER="https://clerk.example",
    )
    @patch("marketplace.authentication.jwt.PyJWKClient")
    def test_valid_clerk_session_creates_user_principal(self, jwks_client_class):
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        jwks_client_class.return_value.get_signing_key_from_jwt.return_value = type(
            "SigningKey", (), {"key": private_key.public_key()}
        )()
        token = jwt.encode(
            {"sub": "user_123", "iss": "https://clerk.example", "exp": 9999999999},
            private_key,
            algorithm="RS256",
        )
        response = self.client.get("/api/marketplace/", HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["farmerListings"], [])

    @override_settings(
        CLERK_JWKS_URL="https://clerk.example/.well-known/jwks.json",
        CLERK_JWT_ISSUER="https://clerk.example",
    )
    @patch("marketplace.authentication.jwt.PyJWKClient")
    def test_invalid_clerk_session_is_rejected(self, jwks_client_class):
        public_key = rsa.generate_private_key(public_exponent=65537, key_size=2048).public_key()
        jwks_client_class.return_value.get_signing_key_from_jwt.return_value = type(
            "SigningKey", (), {"key": public_key}
        )()
        token = jwt.encode(
            {"sub": "user_123", "iss": "https://clerk.example", "exp": 9999999999},
            rsa.generate_private_key(public_exponent=65537, key_size=2048),
            algorithm="RS256",
        )
        response = self.client.get(
            "/api/marketplace/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(response.status_code, 401)
