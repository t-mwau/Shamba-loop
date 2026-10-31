"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialFarmerListings, initialListings, initialOffers } from "@/lib/seed";
import type { Listing, NewListing, Offer } from "@/types";

interface MarketplaceContextValue {
  listings: Listing[];
  farmerListings: Listing[];
  offers: Offer[];
  createListing: (listing: NewListing) => void;
  makeOffer: (listing: Listing, pricePerKg: number, message: string) => void;
  respondToOffer: (offerId: string, accepted: boolean) => void;
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState(initialListings);
  const [farmerListings, setFarmerListings] = useState(initialFarmerListings);
  const [offers, setOffers] = useState(initialOffers);

  const createListing = useCallback((input: NewListing) => {
    const listing: Listing = {
      ...input,
      id: crypto.randomUUID(),
      distanceKm: 0,
      farmerName: "You",
      quality: "Farmer supplied",
      status: "Available",
    };
    setFarmerListings((current) => [listing, ...current]);
    setListings((current) => [listing, ...current]);
  }, []);

  const makeOffer = useCallback((listing: Listing, pricePerKg: number, message: string) => {
    const quantityKg = listing.quantityKg;
    const offer: Offer = {
      id: crypto.randomUUID(),
      listingId: listing.id,
      listingName: listing.wasteType,
      farmerName: listing.farmerName,
      processorName: "Nakuru BioWorks",
      quantityKg,
      pricePerKg,
      totalAmount: quantityKg * pricePerKg,
      pickupDate: "To be agreed",
      message: message || "Interested in this supply. Let's arrange a pickup.",
      status: "Pending",
    };
    setOffers((current) => [offer, ...current]);
    setListings((current) =>
      current.map((item) =>
        item.id === listing.id ? { ...item, status: "Offer received" } : item,
      ),
    );
  }, []);

  const respondToOffer = useCallback((offerId: string, accepted: boolean) => {
    setOffers((current) =>
      current.map((offer) =>
        offer.id === offerId ? { ...offer, status: accepted ? "Accepted" : "Declined" } : offer,
      ),
    );
    if (accepted) {
      const selectedOffer = offers.find((offer) => offer.id === offerId);
      if (selectedOffer) {
        setFarmerListings((current) =>
          current.map((listing) =>
            listing.id === selectedOffer.listingId
              ? { ...listing, status: "Pickup scheduled" }
              : listing,
          ),
        );
        setListings((current) =>
          current.map((listing) =>
            listing.id === selectedOffer.listingId
              ? { ...listing, status: "Pickup scheduled" }
              : listing,
          ),
        );
        setOffers((current) =>
          current.map((offer) =>
            offer.listingId === selectedOffer.listingId &&
            offer.id !== offerId &&
            offer.status === "Pending"
              ? { ...offer, status: "Declined" }
              : offer,
          ),
        );
      }
    }
  }, [offers]);

  const value = useMemo(
    () => ({ listings, farmerListings, offers, createListing, makeOffer, respondToOffer }),
    [listings, farmerListings, offers, createListing, makeOffer, respondToOffer],
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within MarketplaceProvider");
  }
  return context;
}
