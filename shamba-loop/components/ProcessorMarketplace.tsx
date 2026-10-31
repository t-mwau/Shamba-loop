"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { useMarketplace } from "@/components/MarketplaceProvider";

const filters = ["All materials", "Maize stalks", "Coffee husks", "Manure", "Rice husks"];

export function ProcessorMarketplace() {
  const { listings } = useMarketplace();
  const [filter, setFilter] = useState("All materials");
  const visibleListings = useMemo(
    () => listings.filter((listing) => filter === "All materials" || listing.wasteType === filter),
    [filter, listings],
  );

  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div><p className="eyebrow">THE LOCAL MARKETPLACE</p><h1>Good materials.<br /><em>Closer than you think.</em></h1><p>Browse farm waste from nearby farmers and make an offer that works for both of you.</p></div>
        <div className="marketplace-location"><span>⌖</span><div><small>SHOWING SUPPLY NEAR</small><strong>Nakuru, Kenya</strong></div><span className="location-chevron">⌄</span></div>
      </div>
      <div className="marketplace-toolbar">
        <div className="filter-list" role="group" aria-label="Filter by material">
          {filters.map((item) => <button className={`filter-chip ${filter === item ? "filter-active" : ""}`} key={item} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
        <span className="results-count">{visibleListings.length} listings nearby</span>
      </div>
      <div className="listings-grid">
        {visibleListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>
      {visibleListings.length === 0 && <div className="empty-state"><span>🌿</span><h2>No listings in this category yet</h2><p>Check another material or let a farmer know you’re looking.</p><Link className="text-link" href="/farmer/new-listing">Create a listing <span aria-hidden="true">→</span></Link></div>}
      <div className="demo-note"><span>✳</span> Marketplace preview with sample Nakuru listings. Offers are demo-only and reset when you refresh.</div>
    </div>
  );
}
