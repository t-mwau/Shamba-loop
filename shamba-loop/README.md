# ShambaLoop

ShambaLoop is a mobile-friendly marketplace concept connecting Kenyan farmers who have crop or animal waste with nearby processors who can use it. It is designed to help farmers list available material, receive offers, agree on pickup, confirm weight, and ultimately get paid through M-Pesa.

## Run locally

```bash
npm install
npx -y clerk@latest init # first-time Clerk setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Clerk setup

For a fresh local environment, run `npx -y clerk@latest init` once to create or connect a Clerk development instance and populate the ignored `.env.local`. For deployment, configure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in the hosting provider's environment settings. Never commit or expose `CLERK_SECRET_KEY`.

## Deploy to Netlify

The repository-root `netlify.toml` configures Netlify to build the Next.js app in `shamba-loop/` with the Next.js runtime plugin. Connect this GitHub repository to Netlify and deploy; no standalone `index.html` is needed because `app/page.tsx` provides the `/` route.

Before deploying, add these environment variables in the Netlify site settings:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_HASH_SECRET` — use a random secret of at least 32 characters

The app's production middleware returns HTTP 503 for authentication and protected routes if Upstash rate limiting or its hash secret is missing or unavailable. Sentry variables are optional; see `.env.example`.

GitHub Pages is a static-only host and cannot run this app's server-side Clerk protection or middleware. Use Netlify for the current app; deploying to GitHub Pages would require a separate static-only version and changes to those features.

## Production safeguards

- **Monitoring:** Sentry captures client, server, edge, and request errors when `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` are configured. Optional source-map uploads require `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` as private build environment variables. Default personal-data collection and session replay are disabled.
- **Rate limits:** Upstash Redis backs shared sliding-window limits: 120 requests per minute for protected routes/API requests (per account or IP) and 20 page requests per 10 minutes for sign-in/sign-up (per IP). A 32-character or longer `RATE_LIMIT_HASH_SECRET` HMAC-pseudonymizes account/IP identifiers. On Vercel, the platform overwrites `X-Forwarded-For`; do not trust this header behind a different proxy without verifying its behavior. Production auth/protected/API requests fail closed with HTTP 503 when rate limiting is not configured or unavailable. These limits guard app routes; Clerk's direct authentication endpoints need their own provider-side abuse controls in the Clerk dashboard.
- **Legal and support pages:** `/privacy`, `/terms`, and `/support` are linked in the footer. The privacy and terms pages are explicitly pre-launch drafts because the legal controller, privacy contact, lawful bases, data retention and transfer details, and contractual terms are not confirmed. Support currently uses the supplied email address and does not promise a response time.
- **Not yet operational:** Sentry and Upstash require accounts and values in your deployment provider's project settings. No monitoring alert destinations, on-call owner, incident-response runbook, help-desk/ticket system, or production environment credentials have been supplied. Do not collect real user data or launch transactions until these items and the legal checklist are completed.

## MVP routes

- `/` — product landing page and marketplace overview
- `/sign-in` and `/sign-up` — Clerk authentication
- `/processor` — browse nearby sample supply and submit an offer (requires sign-in)
- `/farmer` — farmer listings and dashboard (requires sign-in)
- `/farmer/new-listing` — create a demo listing (requires sign-in)
- `/farmer/offers` — accept or decline incoming offers (requires sign-in)
- `/privacy`, `/terms`, `/support` — pre-launch information and support contact

## Project folders

- `app/` — Next.js routes and shared styles
- `components/` — marketplace features; `components/ui/` holds reusable controls
- `lib/` — validation, matching, impact, and demo data helpers
- `types/` — shared TypeScript domain types
- `supabase/` — starter database migration and optional seed script
- `docs/` — architecture and future product documentation
- `public/` — static browser assets

## Current scope

This is a front-end demo with Clerk authentication checked in the server-rendered farmer and processor pages, plus shared rate limiting in Next.js middleware. Marketplace records are in-memory sample data and reset on refresh. The M-Pesa payment, SMS/USSD, verification, maps, and persistent database integrations are not connected; no real pickup or payment is arranged. Configure those services on a trusted server before handling real user data or money.

## Integration status

The Supabase schema is a starter only; row-level security is enabled, and policies must be added before connecting the app. Clerk handles authentication; its publishable key and secret key belong in local/deployment environment variables, never in client-side code or committed files. M-Pesa, SMS/USSD, verification, live maps, and persistent database access are not implemented. Marketplace actions remain demo-only and are not persisted by Clerk.
