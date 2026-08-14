# Wall of Guardians 🔥

The public leaderboard companion for **[Refugio](https://github.com/ALFA117/Refugio)** — a Decentraland (SDK7) campfire that only burns when people show up. This site shows the top guardians and their embers *outside* the metaverse, so the ranking is shareable on the web (the "Retention & Discovery" angle of the hackathon).

Built with **Next.js (App Router)**, **Framer Motion**, and **Tailwind**, in the same ember/night visual world as the in-scene UI and the pitch page.

## How data flows

```
Decentraland Multiplayer Server  ──signedFetch(POST)──▶  /api/leaderboard  ──▶  Supabase
                                                                                    │
                                          Web page  ◀──── getLeaderboard() ◀────────┘
```

When a round closes, the authoritative server can `signedFetch` a snapshot of the top guardians to `POST /api/leaderboard` (guarded by a shared secret). The route upserts into Supabase; the page reads it back.

**Until Supabase is wired, the site serves representative sample data** so it deploys and looks right immediately.

## Run locally

```bash
npm install
npm run dev
```

## Go live (optional)

1. Create a Supabase project and a `leaderboard` table: `display_name text`, `brasas int`, `updated_at timestamptz`.
2. Set the env vars from [`.env.example`](.env.example) in the Vercel project.
3. Have the Refugio server POST snapshots to `/api/leaderboard` with the `x-refugio-secret` header on round close.

## Deploy

Deploys to Vercel. Set the env vars in the project settings; no env is required for the sample-data preview.
