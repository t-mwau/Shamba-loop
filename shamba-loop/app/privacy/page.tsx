import type { Metadata } from "next";
import { dataController, privacyContact, supportEmail } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Privacy information — ShambaLoop",
  description: "Pre-launch privacy information for the ShambaLoop demo.",
};

export default function PrivacyPage() {
  return (
    <article className="page-wrap legal-page">
      <p className="eyebrow">YOUR INFORMATION</p>
      <h1>Privacy information</h1>
      <p className="legal-notice" role="note">
        PRE-LAUNCH DRAFT — This notice is incomplete and is not a compliance certification. The controller identity,
        privacy contact, lawful bases, retention schedule, hosting locations, and processor arrangements must be
        confirmed before collecting real user data.
      </p>
      <section>
        <h2>Who is responsible</h2>
        <p>{dataController}. ShambaLoop currently provides a demonstration marketplace, not a live trading service.</p>
        <p>Privacy requests: {privacyContact}. General support: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>
      </section>
      <section>
        <h2>What this demo handles</h2>
        <ul>
          <li>Clerk processes account and authentication information needed to register and sign in, such as your email address and session/security data.</li>
          <li>Listings and offers in this preview are sample or in-memory data. They are not reliably saved, tied to a Clerk identity, or a record of a real transaction.</li>
          <li>When Upstash rate limiting is configured, a keyed HMAC of your account identifier or the Vercel-forwarded IP address is used for temporary abuse-prevention counters. Raw IP addresses are not used as Redis keys.</li>
          <li>When Sentry is configured, it receives application errors and limited performance diagnostics. Default personal-data collection and session replay are disabled.</li>
        </ul>
      </section>
      <section>
        <h2>Purposes, legal basis, and sharing</h2>
        <p>Authentication, security, service operation, and support are the intended purposes. The controller must determine and document the lawful basis for each purpose before launch. Clerk, Sentry, Upstash, and the hosting provider may process data as service providers; their applicable terms, data-processing agreements, subprocessors, and transfer safeguards must be reviewed and disclosed before use with real users.</p>
      </section>
      <section>
        <h2>Retention and your rights</h2>
        <p>Rate-limit counters expire with their configured windows. Account-data retention is governed by Clerk settings and must be confirmed. No published retention schedule exists yet for a production service. Subject to applicable law, you may have rights to access, correct, erase, restrict, object to, or receive information about processing of your personal data. Contact the privacy address above once it has been established.</p>
        <p>You may also have the right to complain to Kenya’s Office of the Data Protection Commissioner. The controller must publish a working complaints route and respond to requests within applicable legal timelines.</p>
      </section>
      <section>
        <h2>Before a real launch</h2>
        <p>Confirm the controller and contact details, purposes and lawful bases, data inventory, retention periods, cross-border transfers, vendor contracts, security controls, and user-rights workflow. Assess ODPC registration obligations and whether a data-protection impact assessment or data-protection officer is required. Have a Kenyan privacy professional review this notice and the actual production configuration. Read the <a href="https://new.kenyalaw.org/akn/ke/act/2019/24/eng@2019-11-25" target="_blank" rel="noreferrer">Data Protection Act, 2019</a> and guidance from the <a href="https://www.odpc.go.ke/" target="_blank" rel="noreferrer">Office of the Data Protection Commissioner</a>.</p>
      </section>
      <p className="legal-updated">Draft date: 31 October 2026. Update this notice when the service or its data practices change.</p>
    </article>
  );
}
