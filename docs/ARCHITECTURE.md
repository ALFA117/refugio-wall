# Architecture

How the Wall of Guardians is put together, for whoever touches this next (including future-me).

## Data model

Everything lives under three keys in Vercel KV (Upstash Redis) — no SQL, no schema, no ORM.

| Key | Shape | Written by | Read by |
|---|---|---|---|
| `refugio_leaderboard` | `Guardian[]` — the current top-N snapshot | `POST /api/leaderboard` | `GET /api/leaderboard`, every server component that renders leaderboard data |
| `refugio_leaderboard_history` | `Snapshot[]` — `{ date: "YYYY-MM-DD", entries: Guardian[] }[]`, capped at 30 entries | `recordSnapshot()`, called once per successful ingest | `getHistory()` → `guardianTrend()` / `topGainer()` (`lib/history.ts`) |
| — | (none yet) | — | referral stats live server-side in the DCL scene's own storage, not KV — nothing on the web side reads them yet |

`Guardian = { displayName: string; brasas: number; gamesPlayed?: number }`. That's the entire
schema. Adding a field means updating `lib/ingestSchema.ts` (validation) and nowhere else —
there's no migration step because there's no schema to migrate.

**Until `KV_REST_API_URL`/`KV_REST_API_TOKEN` exist**, `lib/leaderboard.ts` serves hardcoded
`SAMPLE` data and `source: "sample"` everywhere. The site is fully functional and looks correct
in this state — that's deliberate, so a fresh deploy or a judge visiting before the hackathon
demo never sees a broken/empty page.

## Request flow

```
Decentraland Multiplayer Server (round closes)
        │  signedFetch, POST, header x-refugio-secret
        ▼
POST /api/leaderboard  (app/api/leaderboard/route.ts)
  1. rate limit check       (lib/rateLimit.ts — 20 req/min per IP, in-memory)
  2. secret check           (REFUGIO_INGEST_SECRET, constant-time not required: not a password)
  3. isKvConfigured()       → 501 if KV isn't connected yet
  4. zod validation         (lib/ingestSchema.ts — shape + bounds, not just types)
  5. kvSet(entries)         → overwrites refugio_leaderboard
  6. recordSnapshot(entries) → appends/replaces today's row in refugio_leaderboard_history
        │
        ▼
GET /api/leaderboard?timeframe=...           (public, used by client-side polling)
getLeaderboardBundle() / getLeaderboard()     (used by server components on every page)
        │
        ▼
Wall / GuardiansList / StatsPage / CompareView / GuardianProfile (render)
```

The Wall's client-side auto-refresh (`Wall.tsx`, 30s interval, only when `source === "live"`)
hits the same public `GET` route — there's no separate realtime channel.

## Why every page component is small + a route file

Pages under `app/**/page.tsx` are server components: they fetch (`getLeaderboardBundle()`,
`getHistory()`, etc.), do the request-scoped stuff Next.js wants server-side (searchParams,
metadata, JSON-LD), and hand plain data down as props to a `"use client"` component in
`components/`. The client component owns all interactivity (motion, state, localStorage). This
split is why `guardianTrend()`/`topGainer()` live in a plain `lib/history.ts` instead of inside
a component — they're pure functions computed server-side and passed down already-resolved, and
being pure makes them trivially unit-testable without mounting anything.

## Pages

| Route | Purpose |
|---|---|
| `/` | The leaderboard — podium, filtered rows, footer stats |
| `/demo` | Playable, no-install taste of the feed-the-fire mechanic |
| `/guardians` | Full roster (`/` only ever shows the top 10) |
| `/guardians/[name]` | Deep-linkable profile — rank, badge, trend sparkline, share, compare |
| `/stats` | Aggregate community numbers + badge distribution |
| `/compare` | Pick two guardians, see who's ahead |

## Testing

- `lib/**/*.test.ts` (Vitest) — pure logic only: badge tiers, fuzzy-name matching, i18n key
  parity, the ingest schema, the rate limiter, history math. No KV, no network, no DOM.
- `e2e/*.spec.ts` (Playwright, against a real `next start` build) — smoke tests across every
  page, an automated axe-core a11y pass on each, and OG-metadata presence checks. Runs serially
  (`workers: 1`) — a single `next start` process couldn't keep up with a dozen parallel
  first-navigations.
- CI (`.github/workflows/ci.yml`) runs lint → typecheck → unit tests → build → E2E on every
  push/PR to `main`.

## Security posture

- CSP + security headers in `next.config.mjs` — same-origin only, framing blocked. `unsafe-eval`
  is dev-only (Next's Fast Refresh needs it; the production bundle doesn't).
- Ingest endpoint: rate-limited, secret-guarded, zod-validated. The rate limiter is in-memory
  per-process — it resets on cold start and doesn't coordinate across serverless instances. Fine
  for blunting brute-force/retry-storm traffic on a low-volume, single-trusted-source endpoint;
  not a substitute for a real distributed limiter if this ever needed to handle untrusted public
  writes.

## What's NOT here

- No database beyond the two KV keys above.
- No auth for readers — the leaderboard is intentionally public.
- No server-sent events/websockets — "live" means 30s polling.
- No image uploads — avatars are generated (`GuardianDot`'s radial gradient), not user assets.
