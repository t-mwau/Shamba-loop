import Link from "next/link";
import { NewListingForm } from "@/components/NewListingForm";
import { auth } from "@clerk/nextjs/server";

export default async function NewListingPage() {
  await auth.protect();

  return (
    <div className="page-wrap new-listing-page">
      <Link className="back-link" href="/farmer">← Back to dashboard</Link>
      <div className="new-listing-layout">
        <div className="new-listing-intro">
          <p className="eyebrow">A NEW OPPORTUNITY</p>
          <h1>Let your leftovers<br /><em>do a little more.</em></h1>
          <p>Share what you have. Nearby processors can make an offer, then you can agree on the pickup together.</p>
          <div className="listing-promise"><span>✓</span><p><strong>You’re in control</strong><br />Set your price. Accept only the offers that feel right.</p></div>
          <div className="listing-promise"><span>✓</span><p><strong>Weight confirmed at pickup</strong><br />You and the buyer agree on the final weight on site.</p></div>
          <div className="listing-promise"><span>✓</span><p><strong>Agree payment directly</strong><br />ShambaLoop does not process payments yet. Confirm the payment method with your buyer before pickup.</p></div>
        </div>
        <NewListingForm />
      </div>
    </div>
  );
}
