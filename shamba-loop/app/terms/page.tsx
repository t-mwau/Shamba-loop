import type { Metadata } from "next";
import { dataController, supportEmail } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Terms — ShambaLoop",
  description: "Pre-launch terms information for the ShambaLoop demo.",
};

export default function TermsPage() {
  return (
    <article className="page-wrap legal-page">
      <p className="eyebrow">USING SHAMBALOOP</p>
      <h1>Terms of use</h1>
      <p className="legal-notice" role="note">
        PRE-LAUNCH DRAFT — These terms are not ready for a public trading service. The legal controller/operator,
        governing terms, consumer protections, dispute process, and transaction rules require review and approval.
      </p>
      <section>
        <h2>Operator and current service</h2>
        <p>{dataController}. This website is a demonstration. Listings, offers, availability, distances, prices, and account examples may be sample data or temporary browser state.</p>
      </section>
      <section>
        <h2>No real transactions in the demo</h2>
        <p>Do not rely on this preview to arrange a pickup, make a payment, or exchange goods. No payment, logistics, identity verification, dispute resolution, or marketplace settlement service is connected. A displayed offer or accepted status is not a real-world commitment.</p>
      </section>
      <section>
        <h2>Accounts and acceptable use</h2>
        <p>Clerk handles authentication. Keep your sign-in details secure, do not share one-time codes, and do not use the service to submit misleading, unlawful, or harmful content. Production account eligibility, role rules, listing requirements, and account suspension procedures are not yet finalized.</p>
      </section>
      <section>
        <h2>Support and future changes</h2>
        <p>For questions, contact <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. Before a live launch, the operator must publish complete terms covering fees, payments, collection, cancellations, disputes, liability, termination, applicable law, and complaint handling, reviewed by qualified Kenyan counsel.</p>
      </section>
      <p className="legal-updated">Draft date: 31 October 2026.</p>
    </article>
  );
}
