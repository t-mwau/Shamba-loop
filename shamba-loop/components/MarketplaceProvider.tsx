"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { Listing, NewListing, Offer } from "@/types";

interface MarketplaceContextValue {
  listings: Listing[];
  farmerListings: Listing[];
  offers: Offer[];
  loading: boolean;
  saving: boolean;
  error: string;
  refresh: () => Promise<void>;
  createListing: (listing: NewListing) => Promise<boolean>;
  makeOffer: (listing: Listing, pricePerKg: number, message: string) => Promise<boolean>;
  respondToOffer: (offerId: string, accepted: boolean) => Promise<boolean>;
}

interface MarketplaceResponse {
  listings: Listing[];
  farmerListings: Listing[];
  offers: Offer[];
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
      return body.error;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [listings, setListings] = useState<Listing[]>([]);
  const [farmerListings, setFarmerListings] = useState<Listing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/marketplace", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Marketplace data could not be loaded."));
      }
      const data = (await response.json()) as MarketplaceResponse;
      setListings(data.listings);
      setFarmerListings(data.farmerListings);
      setOffers(data.offers);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Marketplace data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (/^\/(?:farmer|processor)(?:\/|$)/.test(pathname)) {
      void refresh();
    }
  }, [pathname, refresh]);

  const sendMutation = useCallback(async (url: string, method: "POST" | "PATCH", body: object) => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        setError(await getErrorMessage(response, "Your changes could not be saved. Please try again."));
        return false;
      }
      await refresh();
      return true;
    } catch {
      setError("Your changes could not be saved. Check your connection and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [refresh]);

  const createListing = useCallback(
    (input: NewListing) => sendMutation("/api/listings", "POST", input),
    [sendMutation],
  );

  const makeOffer = useCallback(
    (listing: Listing, pricePerKg: number, message: string) =>
      sendMutation("/api/offers", "POST", { listingId: listing.id, pricePerKg, message }),
    [sendMutation],
  );

  const respondToOffer = useCallback(
    (offerId: string, accepted: boolean) =>
      sendMutation(`/api/offers/${encodeURIComponent(offerId)}`, "PATCH", { accepted }),
    [sendMutation],
  );

  const value = useMemo(
    () => ({
      listings,
      farmerListings,
      offers,
      loading,
      saving,
      error,
      refresh,
      createListing,
      makeOffer,
      respondToOffer,
    }),
    [listings, farmerListings, offers, loading, saving, error, refresh, createListing, makeOffer, respondToOffer],
  );
  const marketplacePage = /^\/(?:farmer|processor)(?:\/|$)/.test(pathname);

  return (
    <MarketplaceContext.Provider value={value}>
      {marketplacePage && (loading || error) && (
        <div className={`marketplace-notice ${error ? "marketplace-notice-error" : ""}`} role={error ? "alert" : "status"}>
          {error ? (
            <>
              <span>{error}</span>
              <button type="button" onClick={() => void refresh()}>Try again</button>
            </>
          ) : (
            <span>Loading your marketplace…</span>
          )}
        </div>
      )}
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within MarketplaceProvider");
  }
  return context;
}
