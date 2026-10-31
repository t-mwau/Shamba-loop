import type { Metadata } from "next";
import { privacyContact, supportEmail } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Support — ShambaLoop",
  description: "Contact ShambaLoop support.",
};

export default function SupportPage() {
  return (
    <article className="page-wrap legal-page">
      <p className="eyebrow">WE’RE HERE TO HELP</p>
      <h1>Support</h1>
      <p>For help using the preview, email our support contact:</p>
      <p><a className="button button-primary" href={`mailto:${supportEmail}?subject=ShambaLoop%20support`}>{supportEmail}</a></p>
      <h2>Help us investigate</h2>
      <ul>
        <li>Include the page or feature and a brief description of the problem.</li>
        <li>Do not send your password, one-time code, payment credentials, or unnecessary personal information.</li>
        <li>We currently handle support requests by email; no ticket portal or response-time commitment is in place yet.</li>
      </ul>
      <h2>Privacy or account request</h2>
      <p>The privacy-request contact is {privacyContact}. It must be established before collecting real user data. Until then, do not send sensitive identity documents or real transaction details to this demo.</p>
    </article>
  );
}
