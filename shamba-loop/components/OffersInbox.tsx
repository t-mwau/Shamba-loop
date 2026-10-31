"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/MarketplaceProvider";

export function OffersInbox() {
  const { offers, respondToOffer } = useMarketplace();
  return (
    <div className="page-wrap offers-page">
      <Link className="back-link" href="/farmer">← Back to dashboard</Link>
      <div className="page-heading offers-heading"><div><p className="eyebrow">YOUR INBOX</p><h1>Offers on your <em>listings.</em></h1><p>Compare the details, then choose the offer that works best for you.</p></div><span className="offer-count">{offers.filter((offer) => offer.status === "Pending").length} waiting for you</span></div>
      <div className="offers-list">
        {offers.map((offer) => <article className="offer-card" key={offer.id}>
          <div className="offer-card-heading"><div><p className="eyebrow">{offer.listingName} · {offer.quantityKg.toLocaleString()} kg</p><h2>{offer.processorName}</h2></div><span className={`status-pill ${offer.status === "Pending" ? "status-amber" : offer.status === "Accepted" ? "status-green" : "status-neutral"}`}>{offer.status}</span></div>
          <div className="offer-details"><div><span>Offer price</span><strong>KSh {offer.pricePerKg}<small>/kg</small></strong></div><div><span>Total offer</span><strong>KSh {offer.totalAmount.toLocaleString()}</strong></div><div><span>Suggested pickup</span><strong>{offer.pickupDate}</strong></div></div>
          <p className="offer-message">“{offer.message}”</p>
          {offer.status === "Pending" ? <div className="offer-actions"><button className="button button-outline" onClick={() => respondToOffer(offer.id, false)}>Decline</button><button className="button button-primary" onClick={() => respondToOffer(offer.id, true)}>Accept offer <span aria-hidden="true">→</span></button></div> : <p className="offer-footnote">{offer.status === "Accepted" ? "Offer accepted. Coordinate the final pickup and confirm weight together." : "This offer is closed."}</p>}
        </article>)}
        {offers.length === 0 && <div className="empty-state"><span>📬</span><h2>No offers yet</h2><p>When processors are interested, their offers will appear here.</p><Link className="text-link" href="/processor">Explore the marketplace <span aria-hidden="true">→</span></Link></div>}
      </div>
      <p className="demo-note"><span>✳</span> Sample offers for demonstration only. No real pickup or payment is arranged.</p>
    </div>
  );
}
