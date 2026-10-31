"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/MarketplaceProvider";

const wasteIcons: Record<string, string> = { "Maize stalks": "🌽", "Coffee husks": "☕", Manure: "🌱", "Rice husks": "🌾" };

export default function FarmerPage() {
  const { farmerListings, offers } = useMarketplace();
  const pendingCount = offers.filter((offer) => offer.status === "Pending").length;
  const totalKg = farmerListings.reduce((sum, listing) => sum + listing.quantityKg, 0);

  return (
    <div className="page-wrap farmer-page">
      <div className="dashboard-welcome">
        <div><p className="eyebrow">FARMER DASHBOARD</p><h1>Good morning, Mary <span aria-hidden="true">☀</span></h1><p>Here’s what’s happening with your farm waste.</p></div>
        <Link className="button button-primary" href="/farmer/new-listing">＋ New listing</Link>
      </div>
      <div className="stats-grid">
        <article className="stat-card"><span className="stat-icon">◈</span><strong>{farmerListings.length}</strong><span>Active listings</span><small>Across your farm</small></article>
        <article className="stat-card"><span className="stat-icon">↗</span><strong>{pendingCount}</strong><span>Offers to review</span><small>Buyers are interested</small></article>
        <article className="stat-card"><span className="stat-icon">♧</span><strong>{totalKg.toLocaleString()}<small> kg</small></strong><span>Listed this season</span><small>Value ready to unlock</small></article>
      </div>
      <section className="dashboard-section">
        <div className="section-title-row"><div><p className="eyebrow">YOUR FARM</p><h2>Your listings</h2></div><Link className="text-link" href="/farmer/offers">View all offers <span aria-hidden="true">→</span></Link></div>
        <div className="farmer-listings">
          {farmerListings.map((listing) => <article className="farmer-listing-row" key={listing.id}>
            <span className="waste-icon small-waste-icon" aria-hidden="true">{wasteIcons[listing.wasteType]}</span>
            <div className="farmer-listing-main"><h3>{listing.wasteType}</h3><p>{listing.quantityKg.toLocaleString()} kg · KSh {listing.pricePerKg}/kg · {listing.location}</p></div>
            <span className={`status-pill ${listing.status === "Pickup scheduled" ? "status-purple" : listing.status === "Offer received" ? "status-amber" : "status-green"}`}>{listing.status}</span>
            <span className="farmer-listing-date">{listing.availableDate}</span>
          </article>)}
          {farmerListings.length === 0 && <div className="empty-state"><span>🌾</span><h2>Your first listing starts here</h2><p>Tell nearby processors what you have available.</p><Link className="button button-primary" href="/farmer/new-listing">Create a listing</Link></div>}
        </div>
      </section>
      <div className="dashboard-tip"><span>✳</span><p><strong>Quick tip</strong> Dry, well-sorted materials often attract better offers. Add a clear quality note to help buyers decide.</p><Link href="/farmer/new-listing">Got it</Link></div>
      <p className="demo-note"><span>✳</span> Demo dashboard. Changes are temporary and reset when you refresh.</p>
    </div>
  );
}
