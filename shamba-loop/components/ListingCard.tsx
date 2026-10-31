"use client";

import { useState, type FormEvent } from "react";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { Button } from "@/components/ui/Button";
import type { Listing } from "@/types";

const wasteIcons: Record<string, string> = {
  "Maize stalks": "🌽",
  "Coffee husks": "☕",
  Manure: "🌱",
  "Rice husks": "🌾",
};

export function ListingCard({ listing }: { listing: Listing }) {
  const [showOffer, setShowOffer] = useState(false);
  const [price, setPrice] = useState(String(listing.pricePerKg));
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { makeOffer } = useMarketplace();

  function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(price);
    if (!Number.isFinite(amount) || amount <= 0) return;
    makeOffer(listing, amount, message.trim());
    setSubmitted(true);
    setShowOffer(false);
  }

  return (
    <article className="listing-card">
      <div className="listing-card-top">
        <span className="waste-icon" aria-hidden="true">{wasteIcons[listing.wasteType]}</span>
        <span className={`status-pill ${listing.status === "Available" ? "status-green" : "status-neutral"}`}>
          {listing.status}
        </span>
      </div>
      <div>
        <p className="eyebrow">{listing.quality}</p>
        <h3>{listing.wasteType}</h3>
        <p className="listing-location"><span aria-hidden="true">⌖</span> {listing.location} · {listing.distanceKm ? `${listing.distanceKm} km away` : "Just listed"}</p>
      </div>
      <div className="listing-metrics">
        <div><strong>{listing.quantityKg.toLocaleString()} <small>kg</small></strong><span>Available</span></div>
        <div><strong>KSh {listing.pricePerKg}<small>/kg</small></strong><span>Asking price</span></div>
      </div>
      <div className="listing-card-footer">
        <span>{listing.farmerName} <span className="verified-mark" title="Verified farmer">✓</span></span>
        <span>{listing.availableDate}</span>
      </div>
      {submitted ? (
        <p className="inline-success" role="status">Offer sent to {listing.farmerName}.</p>
      ) : showOffer ? (
        <form className="offer-inline-form" onSubmit={submitOffer}>
          <label>
            Your offer (KSh/kg)
            <input min="1" step="1" type="number" value={price} onChange={(event) => setPrice(event.target.value)} required />
          </label>
          <label>
            Note (optional)
            <input maxLength={120} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Pickup details or a quick note" />
          </label>
          <div className="form-actions">
            <Button size="small" type="button" variant="outline" onClick={() => setShowOffer(false)}>Cancel</Button>
            <Button size="small" type="submit">Send offer</Button>
          </div>
        </form>
      ) : (
        <Button className="listing-action" variant="outline" onClick={() => setShowOffer(true)}>Make an offer <span aria-hidden="true">→</span></Button>
      )}
    </article>
  );
}
