# AGENTS.md

Guidance for AI coding agents (Claude Code, etc.) picking up this repo, and
a record of the decisions made while building it — useful if you need to
explain "why" something is the way it is during a defense/presentation.

## What this is

**Parley** — a pricing + negotiation copilot for freelancers/small
businesses. Two AI-powered tools (Pricing Advisor, Negotiation
Counter-Generator) behind Neon Auth, with history stored in Postgres via
Prisma. See `PROMPTS.md` for the actual prompt engineering.

## Non-obvious decisions (read before "fixing" these)

- **Next.js is pinned to 16.x, not 15.x.** `@neondatabase/auth` has a hard
  peer dependency requiring Next 16+. This was discovered mid-build (v15
  was the original, more conservative pick) — don't downgrade Next without
  also dropping/replacing Neon Auth.
- **Prisma is pinned to 6.19.3, not 7.x.** Prisma 7 (a) requires a
  `prisma.config.ts` + driver-adapter architecture instead of a plain `url`
  in `schema.prisma`, and (b) its new `prisma-client` generator has a known
  module-resolution bug under Next.js 16's default Turbopack bundler. The
  schema here intentionally uses the classic `generator client { provider =
  "prisma-client-js" }`, which sidesteps both issues. If you upgrade to
  Prisma 7 later, budget time to migrate the config and re-test the build
  under Turbopack specifically.
- **`proxy.ts`, not `middleware.ts`.** Next.js 16 renamed this file (same
  API/shape, `auth.middleware()` still works identically). If a tutorial or
  older docs mention `middleware.ts`, translate it to `proxy.ts` here.
- **`@neondatabase/auth` is beta (`0.4.x-beta`).** Its API surface can
  shift between versions. If `auth.signUp.email(...)`, `auth.getSession()`,
  etc. don't match what's in `src/lib/auth/*`, check
  https://neon.com/docs/auth for the current shape before assuming the
  code is wrong.
- **No `neon_auth` user table in `prisma/schema.prisma`.** Managed Better
  Auth owns its own user/session tables in a separate schema. App tables
  (`SessionRecord`) just store `userId` as a plain string pulled from
  `session.user.id` — there's no Prisma-managed foreign key across
  schemas. If you need a hard FK, look into Prisma's `multiSchema` preview
  feature rather than hand-rolling one.
- **Tailwind v4, CSS-first.** There is no `tailwind.config.ts`. Design
  tokens (colors, fonts) live in `@theme` inside `src/app/globals.css`.
  Add new tokens there, not in a JS config file.
- **`ui/` components are hand-rolled, not installed via the shadcn CLI.**
  They follow shadcn's conventions (`cva` variants, `cn()` merge helper) so
  they're easy to extend the same way you would real shadcn components, but
  there's no `components.json` / registry wiring. Add new primitives the
  same way (small file, `cva` for variants) rather than trying to run
  `npx shadcn add`.
- **OpenRouter model slugs will go stale.** They're centralized in
  `MODEL_TIERS` in `src/lib/openrouter.ts` specifically so they're a
  one-place fix. Check https://openrouter.ai/models before a demo.
- **Pages that touch auth/DB are `export const dynamic = "force-dynamic"`.**
  This is deliberate — it stops Next from trying to statically prerender a
  page that needs a live session/DB connection at build time (which would
  fail in CI/without real env vars). Keep this on any new page that reads
  the session or queries Prisma directly.

## Commands

```bash
npm install
npx prisma generate     # regenerate the Prisma client after any schema change
npm run db:push         # push schema.prisma to the connected Neon DB
npm run db:studio       # Prisma Studio, to inspect data visually
npm run dev
npm run build
```

## File map (also see README.md)

- `src/lib/openrouter.ts` — model routing logic + the OpenRouter fetch call
- `src/lib/prompts.ts` — system/user prompt templates + Zod validation
  schemas for both tools' AI output
- `src/app/api/generate/route.ts` — ties routing + prompts + Prisma
  together; the one endpoint both tools call
- `src/components/deal-health-gauge.tsx` — the Chart.js + GSAP gauge;
  the app's one deliberately expressive visual, everything else stays quiet

## Conventions for new features

- Server components fetch data (session, Prisma) directly; client
  components (`"use client"`) own form state and call `/api/...` routes.
- Validate all AI output with a Zod schema before saving/rendering it —
  don't trust the model to always return well-formed JSON (see the
  try/catch + `safeParse` pattern in `api/generate/route.ts`).
- New AI-backed features should go through `selectModel()` rather than
  hardcoding a model slug, so routing stays visible/explainable in one
  place.
