# ShambaLoop

ShambaLoop is a mobile-friendly marketplace concept connecting Kenyan farmers who have crop or animal waste with nearby processors who can use it. It is designed to help farmers list available material, receive offers, agree on pickup, confirm weight, and ultimately get paid through M-Pesa.

## Run locally

Start the Django API in one terminal:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Configure DJANGO_SECRET_KEY, CLERK_JWT_ISSUER, and CLERK_JWKS_URL in backend/.env
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

In another terminal, start the Next.js app:

```bash
npm install
npx -y clerk@latest init # first-time Clerk setup
# Set DJANGO_API_URL=http://127.0.0.1:8000 in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Clerk setup

For a fresh local environment, run `npx -y clerk@latest init` once to create or connect a Clerk development instance and populate the ignored `.env.local`. For deployment, configure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in the hosting provider's environment settings. Never commit or expose `CLERK_SECRET_KEY`.

Clerk continues to manage sign-up and sign-in credentials. Django does not store passwords: the Next.js server obtains the signed-in Clerk session token and forwards it to Django, which verifies the JWT signature, issuer, expiration, and optional audience against Clerk's JWKS endpoint. Set `CLERK_JWT_ISSUER` and `CLERK_JWKS_URL` in the Django environment for the same Clerk instance as the Next.js keys. The sign-up and sign-in pages use Clerk's hosted authentication components, so verification emails and password policies remain managed by Clerk.

## Django and database setup

Django stores listings and offers in the configured database. Local development defaults to SQLite. For deployment, set `DATABASE_URL` to a managed PostgreSQL URL and set `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CLERK_JWT_ISSUER`, and `CLERK_JWKS_URL` in the backend environment. Keep the Django secret and database URL private. Run `python manage.py migrate` on the deployed service before accepting marketplace traffic. `DJANGO_API_URL` in the Next.js environment selects the Django service; local development uses `http://127.0.0.1:8000`. The marketplace currently uses generic farmer/processor labels; profile names and role selection are not part of this MVP.

## Deploy to Netlify

The repository-root `netlify.toml` configures Netlify to build the Next.js app in `shamba-loop/` with the Next.js runtime plugin. Connect this GitHub repository to Netlify and deploy; no standalone `index.html` is needed because `app/page.tsx` provides the `/` route.

Before deploying, add these environment variables in the Netlify site settings:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_HASH_SECRET` — use a random secret of at least 32 characters
- `DJANGO_API_URL` — base URL for the separately hosted Django API

The app's production middleware returns HTTP 503 for authentication and protected routes if Upstash rate limiting or its hash secret is missing or unavailable. Sentry variables are optional; see `.env.example`.

The Django API must be deployed separately from the Next.js site. Configure its database and Clerk JWT variables there, run migrations as part of deployment, and set its public service URL as `DJANGO_API_URL` in Netlify. Keep browser requests on the authenticated same-origin Next.js proxy.

GitHub Pages is a static-only host and cannot run this app's server-side Clerk protection or middleware. Use Netlify for the current app; deploying to GitHub Pages would require a separate static-only version and changes to those features.

## Production safeguards

- **Monitoring:** Sentry captures client, server, edge, and request errors when `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` are configured. Optional source-map uploads require `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` as private build environment variables. Default personal-data collection and session replay are disabled.
- **Rate limits:** Upstash Redis backs shared sliding-window limits: 120 requests per minute for protected routes/API requests (per account or IP) and 20 page requests per 10 minutes for sign-in/sign-up (per IP). A 32-character or longer `RATE_LIMIT_HASH_SECRET` HMAC-pseudonymizes account/IP identifiers. On Vercel, the platform overwrites `X-Forwarded-For`; do not trust this header behind a different proxy without verifying its behavior. Production auth/protected/API requests fail closed with HTTP 503 when rate limiting is not configured or unavailable. These limits guard app routes; Clerk's direct authentication endpoints need their own provider-side abuse controls in the Clerk dashboard.
- **Django authentication:** The API accepts Clerk-issued JWT bearer tokens and verifies them against the configured JWKS URL and issuer. Keep the Django settings aligned with the same Clerk instance used by Next.js. Deploy the API over HTTPS with a production secret key, allowed-host list, and managed database.
- **Legal and support pages:** `/privacy`, `/terms`, and `/support` are linked in the footer. The privacy and terms pages are explicitly pre-launch drafts because the legal controller, privacy contact, lawful bases, data retention and transfer details, and contractual terms are not confirmed. Support currently uses the supplied email address and does not promise a response time.
- **Not yet operational:** Sentry and Upstash require accounts and values in your deployment provider's project settings. No monitoring alert destinations, on-call owner, incident-response runbook, help-desk/ticket system, or production environment credentials have been supplied. Do not collect real user data or launch transactions until these items and the legal checklist are completed.

## MVP routes

- `/` — product landing page and marketplace overview
- `/sign-in` and `/sign-up` — Clerk authentication
- `/processor` — browse active supply and submit an offer (requires sign-in)
- `/farmer` — farmer listings and dashboard (requires sign-in)
- `/farmer/new-listing` — create a persistent listing (requires sign-in)
- `/farmer/offers` — accept or decline incoming offers (requires sign-in)
- `/privacy`, `/terms`, `/support` — pre-launch information and support contact

## Project folders

- `app/` — Next.js routes and shared styles
- `components/` — marketplace features; `components/ui/` holds reusable controls
- `lib/` — validation, matching, impact, and Django API proxy helpers
- `backend/` — Django REST API, Clerk JWT authentication, database models, and tests
- `types/` — shared TypeScript domain types
- `supabase/` — starter database migration and optional seed script
- `docs/` — architecture and future product documentation
- `public/` — static browser assets

## Current scope

Clerk protects sign-up, sign-in, and marketplace sessions. The Django API verifies Clerk tokens and persists marketplace listings and offers in SQLite locally or PostgreSQL in deployment, with records scoped to the authenticated Clerk account. M-Pesa payment, SMS/USSD, verification, and live maps are not connected; no real payment or pickup is arranged. Configure those services and complete privacy/operational review before handling real transactions.

## Integration status

The Supabase schema is a legacy starter only and is not connected. Clerk handles account credentials; its publishable key and secret key belong in local/deployment environment variables, never in client-side code or committed files. Django verifies Clerk JWTs and stores marketplace data separately from Clerk profile management. M-Pesa, SMS/USSD, verification, and live maps remain unimplemented.
