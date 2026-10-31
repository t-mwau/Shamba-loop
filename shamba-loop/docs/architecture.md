# Architecture

ShambaLoop is a Next.js App Router application written in TypeScript. The current build is a client-side MVP demo: sample records live in `lib/seed.ts`, and `components/MarketplaceProvider.tsx` manages temporary listings and offers in memory. Refreshing the page resets demo changes.

## Source layout

- `app/` — route pages and global application styles. Farmer and processor routes are separate folders.
- `components/` — reusable marketplace UI; basic shared controls live in `components/ui/`.
- `lib/` — focused marketplace helpers for matching, impact calculations, validation, and demo data.
- `types/` — shared domain types.
- `public/` — static browser assets and the web app manifest.
- `docs/` — architecture notes and, as they are created, research and design artifacts.
- `supabase/` — starter database migration and optional seed data; not connected to the running demo.
- `tests/` — planned automated unit and end-to-end coverage.

## Planned service boundaries

Clerk provides authentication through the Next.js provider and server middleware; the farmer and processor flows require a signed-in session. Keep Clerk's secret key in server environment variables and never expose it through client components. Marketplace records remain in-memory demo data and are not tied to Clerk identities or persisted. The Supabase migration enables row-level security but intentionally defines no policies; add and review role-aware policies before connecting persistent records. M-Pesa, SMS/USSD, and live mapping remain unimplemented; the browser demo must not be used to arrange real payments or pickups.

## Core flow

1. A farmer creates a listing from `/farmer/new-listing`.
2. The listing appears in the processor marketplace at `/processor`.
3. A processor submits an offer from a listing card.
4. The farmer reviews offers at `/farmer/offers` and accepts or declines.
5. Accepting an offer marks its listing as pickup scheduled and closes other pending offers for that listing.
