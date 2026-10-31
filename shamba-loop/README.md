# ShambaLoop

ShambaLoop is a mobile-friendly marketplace concept connecting Kenyan farmers who have crop or animal waste with nearby processors who can use it. It is designed to help farmers list available material, receive offers, agree on pickup, confirm weight, and ultimately get paid through M-Pesa.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## MVP routes

- `/` — product landing page and marketplace overview
- `/sign-in` and `/sign-up` — Clerk authentication
- `/processor` — browse nearby sample supply and submit an offer (requires sign-in)
- `/farmer` — farmer listings and dashboard (requires sign-in)
- `/farmer/new-listing` — create a demo listing (requires sign-in)
- `/farmer/offers` — accept or decline incoming offers (requires sign-in)

## Project folders

- `app/` — Next.js routes and shared styles
- `components/` — marketplace features; `components/ui/` holds reusable controls
- `lib/` — validation, matching, impact, and demo data helpers
- `types/` — shared TypeScript domain types
- `supabase/` — starter database migration and optional seed script
- `docs/` — architecture and future product documentation
- `public/` — static browser assets

## Current scope

This is a front-end demo with Clerk authentication enforced by Next.js middleware. Marketplace records are in-memory sample data and reset on refresh. The M-Pesa payment, SMS/USSD, verification, maps, and persistent database integrations are not connected; no real pickup or payment is arranged. Configure those services on a trusted server before handling real user data or money.

## Integration status

The Supabase schema is a starter only; row-level security is enabled, and policies must be added before connecting the app. Clerk handles authentication; its publishable key and secret key belong in local/deployment environment variables, never in client-side code or committed files. M-Pesa, SMS/USSD, verification, live maps, and persistent database access are not implemented. Marketplace actions remain demo-only and are not persisted by Clerk.
