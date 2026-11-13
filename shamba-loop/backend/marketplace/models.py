import uuid

from django.db import models


class Listing(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "Available"
        OFFER_RECEIVED = "Offer received"
        PICKUP_SCHEDULED = "Pickup scheduled"
        COMPLETED = "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer_id = models.CharField(max_length=128, db_index=True)
    waste_type = models.CharField(max_length=40)
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    price_per_kg = models.DecimalField(max_digits=12, decimal_places=2)
    location = models.CharField(max_length=120)
    available_date = models.CharField(max_length=30)
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.AVAILABLE,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "-created_at"], name="listing_status_created_idx")]


class Offer(models.Model):
    class Status(models.TextChoices):
        PENDING = "Pending"
        ACCEPTED = "Accepted"
        DECLINED = "Declined"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="offers")
    farmer_id = models.CharField(max_length=128, db_index=True)
    processor_id = models.CharField(max_length=128, db_index=True)
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    price_per_kg = models.DecimalField(max_digits=12, decimal_places=2)
    pickup_date = models.CharField(max_length=80, default="To be agreed")
    message = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["listing", "status"], name="offer_listing_status_idx"),
            models.Index(fields=["farmer_id", "-created_at"], name="offer_farmer_created_idx"),
        ]
