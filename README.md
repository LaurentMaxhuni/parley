# Parley — AI Pricing & Negotiation Copilot

Parley helps freelancers and small businesses set defensible prices and reply
to client pushback. It includes email/password authentication, AI-generated
structured advice, saved per-user history, and a Deal Health Score dashboard.

## What you need

- Node.js 20.9 or newer
- A Neon project with Neon Auth enabled
- An OpenRouter API key with available credit

## Run it

1. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

   On PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Fill in these four required values in `.env.local`:

   - `DATABASE_URL` — Neon Postgres connection string. Prefer the pooled
     connection string for a serverless deployment.
   - `NEON_AUTH_BASE_URL` — Neon Console → Auth → Configuration.
   - `NEON_AUTH_COOKIE_SECRET` — any cryptographically random value of at
     least 32 characters.
   - `OPENROUTER_API_KEY` — from the OpenRouter Keys page.

   To enable the included **Continue with Google** buttons, open Neon Console
   → **Auth** → **Configuration** → **OAuth providers**, enable Google, and
   choose Neon-managed credentials or enter your Google OAuth client
   credentials there. No Google secret belongs in this app's environment
   file; Neon Auth owns the provider configuration and callback flow.

   Also add every URL that serves Parley to Neon Console → **Auth** →
   **Configuration** → **Trusted origins**. At minimum, development normally
   needs `http://localhost:3000`; add the exact production and preview URLs
   you use as well. An omitted URL makes Neon Auth reject sign-in and sign-out
   requests with `INVALID_ORIGIN`.

3. Install dependencies and apply the committed database migration:

   ```bash
   npm install
   npm run setup
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). You can verify the
configuration and database connection at
[http://localhost:3000/api/health](http://localhost:3000/api/health).

## Production

Set the same environment variables in your hosting provider, then run the
database migration once for that environment:

```bash
npm run db:migrate
```

The normal production commands are:

```bash
npm run build
npm start
```

`npm run build` regenerates Prisma Client before compiling. The app's auth and
database clients are initialized lazily, so builds do not require live secrets;
runtime requests still fail clearly if configuration is missing.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEON_AUTH_BASE_URL` | Yes | Managed Neon Auth endpoint |
| `NEON_AUTH_COOKIE_SECRET` | Yes | Signs cached session cookies; minimum 32 characters |
| `OPENROUTER_API_KEY` | Yes | Authorizes AI requests |
| `OPENROUTER_SITE_URL` | No | OpenRouter app attribution |
| `OPENROUTER_SITE_NAME` | No | OpenRouter app attribution |
| `OPENROUTER_FAST_MODELS` | No | Comma-separated override for the fast tier |
| `OPENROUTER_STANDARD_MODELS` | No | Comma-separated override for the standard tier |
| `OPENROUTER_POWER_MODELS` | No | Comma-separated override for the power tier |

Model overrides are ordered fallbacks. If they are unset, the defaults in
`src/lib/openrouter.ts` are used. All default models use OpenRouter's `:free`
variants, so no paid model credit is required. Free-model capacity can be
rate-limited, but every tier has free fallbacks.

## Useful commands

```bash
npm run typecheck     # strict TypeScript check
npm run build         # Prisma generate + production build
npm run setup         # Prisma generate + deploy committed migrations
npm run db:migrate    # deploy committed migrations
npm run db:push       # development-only schema sync
npm run db:studio     # inspect data in Prisma Studio
```

## How the app is wired

- `src/lib/auth/server.ts` — lazy Neon Auth singleton
- `src/lib/prisma.ts` — lazy Prisma singleton
- `src/lib/openrouter.ts` — model routing, fallback, timeout, structured output
- `src/lib/prompts.ts` — bounded request schemas and validated AI response schemas
- `src/app/api/generate/route.ts` — authentication, AI generation, validation, storage
- `src/app/api/health/route.ts` — configuration and database readiness check
- `src/proxy.ts` — Next.js 16 route protection
- `prisma/migrations/` — deployable database schema

See `PROMPTS.md` for prompt design and `AGENTS.md` for the architectural
decisions behind the pinned dependency versions.
