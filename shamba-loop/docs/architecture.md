# Architecture

ShambaLoop is a Next.js App Router application written in TypeScript with a Django REST backend. Clerk authenticates users; Django validates Clerk session JWTs and persists marketplace listings and offers. The client-side `MarketplaceProvider` uses authenticated same-origin Next.js route handlers as a proxy to Django and never connects directly to the database.

## Source layout

- `app/` — route pages and global application styles. Farmer and processor routes are separate folders.
- `components/` — reusable marketplace UI; basic shared controls live in `components/ui/`.
- `middleware.ts` — Clerk session checks for farmer and processor routes.
- `lib/` — Django API proxy, validation, matching, impact calculations, and shared helpers.
- `backend/` — Django settings, Clerk JWT authentication, marketplace models/API, migrations, and tests.
- `types/` — shared domain types.
- `public/` — static browser assets and the web app manifest.
- `docs/` — architecture notes and, as they are created, research and design artifacts.
- `supabase/` — legacy starter migration and optional seed data; not connected to the running app.
- `tests/` — planned automated unit and end-to-end coverage.

## Service boundaries

Clerk provides authentication through the Next.js provider and server middleware; the farmer and processor flows require a signed-in session. Keep Clerk's secret key in server environment variables and never expose it through client components. Sentry is wired for client, server, edge, and request errors when DSNs are configured; personal-data collection and session replay are disabled by default. Upstash provides shared sliding-window rate limits for auth, protected pages, and API routes, and uses an HMAC secret to pseudonymize limiter identifiers. Production requests fail closed when Upstash is missing or unavailable.

The Next.js server obtains a Clerk session JWT and forwards it to Django using a bearer header. Django verifies the JWT signature with Clerk's JWKS endpoint and checks the configured issuer, expiry, and optional audience; backend endpoints reject unauthenticated requests. `DJANGO_API_URL` selects the backend. The Django service uses SQLite locally and supports PostgreSQL through `DATABASE_URL` in deployment. Do not expose the Django service secret, database URL, or Clerk secret to browser code.

Marketplace records are not profile records: the MVP shows generic farmer/processor names and has no role-selection or public profile workflow. Review authorization, privacy, retention, backups, and access controls before using real personal data. The privacy and terms pages are pre-launch drafts until the operator/controller, lawful bases, retention and transfer arrangements, and privacy contact are verified. M-Pesa, SMS/USSD, and live mapping remain unimplemented; the app must not be used to arrange real payments or pickups.

## Production readiness gates

- Deploy the Django API separately from the Netlify-hosted Next.js app. Configure production `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DATABASE_URL`, `CLERK_JWT_ISSUER`, and `CLERK_JWKS_URL`; configure `DJANGO_API_URL` in Netlify alongside Clerk, Sentry, and Upstash settings. Keep all service credentials server-side.
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
