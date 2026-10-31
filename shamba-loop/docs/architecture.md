# Architecture

ShambaLoop is a Next.js App Router application written in TypeScript. The current build is a client-side MVP demo: sample records live in `lib/seed.ts`, and `components/MarketplaceProvider.tsx` manages temporary listings and offers in memory. Refreshing the page resets demo changes.

## Source layout

- `app/` — route pages and global application styles. Farmer and processor routes are separate folders.
- `components/` — reusable marketplace UI; basic shared controls live in `components/ui/`.
- `middleware.ts` — Clerk session checks for farmer and processor routes.
- `lib/` — focused marketplace helpers for matching, impact calculations, validation, and demo data.
- `types/` — shared domain types.
- `public/` — static browser assets and the web app manifest.
- `docs/` — architecture notes and, as they are created, research and design artifacts.
- `supabase/` — starter database migration and optional seed data; not connected to the running demo.
- `tests/` — planned automated unit and end-to-end coverage.

## Service boundaries

Clerk provides authentication through the Next.js provider and server middleware; the farmer and processor flows require a signed-in session. Keep Clerk's secret key in server environment variables and never expose it through client components. Sentry is wired for client, server, edge, and request errors when DSNs are configured; personal-data collection and session replay are disabled by default. Upstash provides shared sliding-window rate limits for auth, protected pages, and API routes, and uses an HMAC secret to pseudonymize limiter identifiers. Production requests fail closed when Upstash is missing or unavailable.

Marketplace records remain in-memory demo data and are not tied to Clerk identities or persisted. The Supabase migration enables row-level security but intentionally defines no policies; add and review role-aware policies before connecting persistent records. The privacy and terms pages are pre-launch drafts until the operator/controller, lawful bases, retention and transfer arrangements, and privacy contact are verified. M-Pesa, SMS/USSD, persistent marketplace storage, and live mapping remain unimplemented; the browser demo must not be used to arrange real payments or pickups.

## Production readiness gates

- Add Vercel environment variables for Clerk production, Sentry DSNs, Upstash REST credentials, and a randomly generated `RATE_LIMIT_HASH_SECRET` of at least 32 characters. Keep Sentry upload tokens server-side and out of client bundles.
- Confirm Sentry receives a deliberate test event; configure alert recipients, an accountable on-call owner, retention, access controls, and an incident-response runbook.
- Verify Upstash connectivity and the Vercel proxy behavior in production. Current middleware limits authenticated protected/API requests to 120 per minute and auth-page requests to 20 per 10 minutes per pseudonymous account/IP. Add separate endpoint and account-level limits to every future write/payment handler; Clerk auth endpoints also need provider-side abuse controls.
- Replace the pre-launch privacy/terms disclosures only after confirming the legal operator/controller, lawful bases, retention periods, vendor/subprocessor and international-transfer details, rights/complaint contact, and support workflow. Review ODPC registration, DPO, DPIA, breach-response, and data-subject request obligations with qualified Kenyan counsel.
- Keep the support email monitored, assign request ownership and escalation, and define a response target before advertising a support SLA. The current mailto contact is not a ticketing system.
- Do not enable persistent real-user listings, payments, or pickups until server-side authorization, database policies, backups, payment verification, audit logging, monitoring, and privacy review have been completed.

## Core flow

1. A farmer signs in through Clerk before accessing the farmer flow.
2. The farmer creates a listing from `/farmer/new-listing`.
3. The listing appears in the processor marketplace at `/processor`.
4. A processor submits an offer from a listing card.
5. The farmer reviews offers at `/farmer/offers` and accepts or declines.
6. Accepting an offer marks its listing as pickup scheduled and closes other pending offers for that listing.
