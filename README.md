# Xivoo — Monorepo

Xivoo — Smart Finds. Better Living. A gadgets & lifestyle e-commerce brand for Bangladesh:
storefront (Next.js), admin panel (Next.js) and API (NestJS) in one pnpm + Turborepo workspace.
Same architecture as the Aziz Mart build, fully rebranded (black #111315 / orange #FF6A00).

## Layout

| Path | What | Port |
|---|---|---|
| `apps/web` | Customer storefront — animated landing page (Three.js hero), listings, product details, cart, COD checkout, order confirmation, help & bulk orders | 3000 |
| `apps/admin` | Admin panel — sign-in with RBAC, dashboard with live sales charts, products, orders pipeline, marketing, delivery zones | 3001 |
| `apps/api` | NestJS REST API — auth/RBAC, catalog, coupons, orders (stock decrement, validated status transitions), stats. Contract in `apps/api/openapi.yaml` | 4000 |
| `packages/shared` | Design tokens, TypeScript types and the seed catalog from the handoff — single source of truth for all three apps | — |
| `postman/` | Git-native Postman collection: 13-request contract-test suite + local environment (run in CI by `.github/workflows/api-contract.yml`) | — |

## Run it

```bash
pnpm install
pnpm dev          # turbo: builds shared, then runs api + web + admin together
```

or individually: `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:admin`.

- Storefront → http://localhost:3000
- Admin → http://localhost:3001
- API → http://localhost:4000/api/v1/health

The storefront falls back to the bundled seed data if the API is down (checkout then disables); the
admin requires the API. Set `NEXT_PUBLIC_API_URL` to point either app at a different API origin.

## Admin access (demo accounts)

Sign in at http://localhost:3001/login. Passwords follow the pattern `xivoo-<role>`; the login
page can prefill them. Sessions are Bearer tokens enforced by the API, not just hidden UI.

| Email | Role | Can |
|---|---|---|
| `owner@xivoo.test` | owner | everything |
| `manager@xivoo.test` | manager | move orders, everything operational |
| `support@xivoo.test` | support | read-only (the API returns 403 on writes) |

## API contract tests

```bash
postman collection run "postman/collections/xivoo api" -e postman/environments/local.yaml
```

13 requests / 24 assertions against a running local API: health, catalog shape, the strict
category-scope rule, coupon maths, auth + role enforcement, order placement (phone normalisation,
SKU snapshots, totals), per-field validation errors, and status-transition guards. The GitHub
Actions workflow runs the same suite on every PR.

## Design fidelity

Colours, type (Bricolage Grotesque / Hanken Grotesk), radii, spacing and copy follow the handoff
README exactly (`packages/shared/src/tokens.ts`). Product imagery is temporary Unsplash stock, as in
the handoff — replace with owned photography. Category scope is strict: no Kitchen & Dining, Home &
Living, or Stationery anywhere.

## Demo-build shortcuts (replace for production)

- **Storage**: the API keeps a working copy in memory and persists every change to a
  **Vercel Blob** JSON state (`xivoo-data` store) — admin CRUD, sign-ups and orders survive
  restarts and serverless instances. Instances re-sync on reads (≤4s lag) and before every
  mutation; concurrent writes from different instances within a couple of seconds can still
  race (last writer wins). For real traffic swap `PersistenceService` for PostgreSQL + Prisma;
  the REST contract stays the same. Local dev persists to `apps/api/.data/state.json`
- **Auth is demo-grade** — in-memory users with plain-text demo passwords and random session tokens.
  Production needs hashed passwords, a session store and per-customer order scoping (order detail is
  public here so confirmation pages work for guests). Storefront customer accounts are still to come.
- Bestsellers in the admin rank by real seeded sales; the storefront still labels its grid
  "Staff picks · curated" until real sales history exists, per the brief.
- Delivery fees, coupon rules and returns copy are the handoff placeholders — confirm with the
  business.
