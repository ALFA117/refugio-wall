# Wall of Guardians 🔥

The public leaderboard companion for **[Refugio](https://github.com/ALFA117/Refugio)** — a Decentraland (SDK7) campfire that only burns when people show up. This site shows the top guardians and their embers *outside* the metaverse, so the ranking is shareable on the web (the "Retention & Discovery" angle of the hackathon).

Built with **Next.js (App Router)**, **Framer Motion**, and **Tailwind**, in the same ember/night visual world as the in-scene UI and the pitch page.

## How data flows

```
Decentraland Multiplayer Server  ──signedFetch(POST)──▶  /api/leaderboard  ──▶  Vercel KV
                                                                                    │
                                          Web page  ◀──── getLeaderboard() ◀────────┘
```

When a round closes, the authoritative server `signedFetch`es a snapshot of the top guardians to `POST /api/leaderboard` (guarded by a shared secret). The route stores it in **Vercel KV** (Upstash Redis) — a single JSON value, no SQL, no schema; the page reads it back.

**Until KV is wired, the site serves representative sample data** so it deploys and looks right immediately.

## Run locally

```bash
npm install
npm run dev
```

## Go live (optional)

1. In the Vercel dashboard: **Storage → Create Database → KV (Upstash for Redis)**, connect it to the `refugio` project. Vercel adds `KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically.
2. Add one env var yourself: `REFUGIO_INGEST_SECRET` (any long random string).
3. In the Refugio scene deploy, set EnvVars `COMPANION_URL=https://<site>/api/leaderboard` and `COMPANION_SECRET` (same value as `REFUGIO_INGEST_SECRET`). The server pushes on every round close.

## Deploy

Deploys to Vercel. Set the env vars in the project settings; no env is required for the sample-data preview.
