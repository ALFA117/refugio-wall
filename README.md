<div align="center">

# Wall of Guardians

### The public leaderboard for Refugio, a Decentraland campfire that only burns when people show up.

[![Live site](https://img.shields.io/badge/Live_site-wall--of--guardians.vercel.app-E8743B?style=for-the-badge&logo=vercel&logoColor=white)](https://wall-of-guardians.vercel.app)
[![Play the demo](https://img.shields.io/badge/Play_the_demo-no_install-1a1a1a?style=for-the-badge)](https://wall-of-guardians.vercel.app/demo)
[![The scene](https://img.shields.io/badge/The_scene-ALFA117%2FRefugio-6d4bd1?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ALFA117/Refugio)
[![License: MIT](https://img.shields.io/badge/License-MIT-555?style=for-the-badge)](LICENSE)

![Next.js](https://img.shields.io/badge/Next.js_14-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_18-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white)
![Vercel KV](https://img.shields.io/badge/Vercel_KV-Upstash_Redis-DC382D?logo=redis&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright_+_axe-2EAD33?logo=playwright&logoColor=white)

<br/>

<img src="docs/img/hero.jpg" alt="Wall of Guardians on a laptop (the leaderboard) and on a phone (the playable feed-the-fire demo)" width="100%" />

**[▶ Open the Wall](https://wall-of-guardians.vercel.app)** · **[Play the demo](https://wall-of-guardians.vercel.app/demo)** · **[How it works](#-how-the-data-flows)** · **[Architecture notes](docs/ARCHITECTURE.md)**

</div>

> [!NOTE]
> Until the Refugio scene is published and pushing rounds, the live site serves **representative sample data** and says so on every page (*Preview · sample data*). The guardian names and numbers in these screenshots come from that sample set.

---

## 🎯 Why a website for a metaverse scene

[Refugio](https://github.com/ALFA117/Refugio) is a cooperative campfire in **Decentraland (SDK7)**: the more people sit around it, the higher it burns, and strangers keep it alive together in 3-minute rounds. The problem is that everything that happens in a metaverse scene stays *inside* the metaverse.

The Wall takes the ranking **outside**, to a normal web page you can open on any phone and share with a link. It also lets people who can't or won't install the Decentraland client **feel the mechanic in the browser** before visiting. That's the *Retention & Discovery* angle of the Friendzone hackathon.

## 🔥 What's inside

### The Wall (`/`)

- Live leaderboard with **All-time / This week / Today** filters, synced to the URL (`?tf=week` is itself shareable).
- Search with highlight (press `/`), milestone badges and a sticky "leading" bar once the podium scrolls away.
- Deep-linkable **guardian profiles** at `/guardians/[name]`, each with its own Open Graph share card, a Web Share button and rank/streak stats.
- `/guardians` (full roster), `/stats` (community numbers and badge distribution) and `/compare` (any two guardians, head to head).
- Bilingual (English by default, Spanish toggle), installable as a PWA, and a hidden easter egg (5 rapid taps on the language toggle).

### The demo (`/demo`)

A small, real game, not just a readout:

- **3 difficulty modes** that tune wood timing, decay and how much firewood can be alight at once.
- **8-seat guardian ring** around a layered campfire, matching the real scene's seat count.
- **Feed-the-fire loop:** tap the wood before it burns out; streak and best-streak tracking, spark bursts, a low-health warning and haptic feedback where supported.
- **Game over** screen with your best streak and a share button. Difficulty and best streak persist across visits.

<table>
<tr>
<td width="50%"><img src="docs/img/demo.jpg" alt="The web demo mid-round: fire intensity, streak, a piece of firewood to tap and the fire health bar" /><p align="center"><sub>The demo: tap the wood before it burns out.</sub></p></td>
<td width="50%"><img src="docs/img/guardians.jpg" alt="The full roster of guardians as a ruled table with tier, rounds and embers" /><p align="center"><sub>Every guardian, with tier, rounds and embers.</sub></p></td>
</tr>
<tr>
<td width="50%"><img src="docs/img/perfil.jpg" alt="A guardian profile page with embers, rank, rounds played and tier, plus Share and Compare buttons" /><p align="center"><sub>Shareable guardian profile.</sub></p></td>
<td width="50%"><img src="docs/img/compare.jpg" alt="Two guardians compared head to head: embers, rank, rounds and tier" /><p align="center"><sub>Head to head in <code>/compare</code>.</sub></p></td>
</tr>
<tr>
<td width="50%"><img src="docs/img/stats.jpg" alt="Community stats: embers earned, guardians, rounds played, badges earned and highlights" /><p align="center"><sub>What the whole community has built.</sub></p></td>
<td width="50%" align="center"><img src="docs/img/movil.jpg" alt="The Wall on a phone" width="55%" /><p align="center"><sub>Made for phones first.</sub></p></td>
</tr>
</table>

## 🧠 How the data flows

```mermaid
flowchart LR
    A["Refugio scene: Decentraland Multiplayer Server"] -->|signedFetch on round close| B["POST /api/leaderboard"]
    B -->|rate limit, secret, zod| C[("Vercel KV")]
    C --> D["Server components"]
    D --> E["Wall, profiles, stats, compare"]
    E -->|polls every 30 s when live| F["GET /api/leaderboard"]
    F --> C
```

When a round closes in the scene, the authoritative server `signedFetch`es a snapshot of the top guardians to `POST /api/leaderboard`. The route rate-limits by IP, checks a shared secret (`x-refugio-secret`), validates shape and bounds with zod, and stores a single JSON value in **Vercel KV** (Upstash Redis): no SQL, no schema. A daily snapshot is kept for trends. Pages read it server-side and the Wall polls every 30 s once the source is live.

More detail (data model, request flow, page structure) in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## 🛠️ Stack

| Layer | Technology |
|:--|:--|
| Web | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion · lucide-react |
| Data | Vercel KV (Upstash Redis) · zod for ingest validation |
| Quality | Vitest (badge tiers, fuzzy name matching, i18n key parity, history, rate limit) · Playwright smoke tests with an axe-core accessibility pass on every page · GitHub Actions CI |
| Deploy | Vercel (with Analytics and Speed Insights) |

## 🚀 Run it locally

```bash
npm install
npm run dev
```

No environment variables are needed: without KV the site serves the sample data.

<details>
<summary><b>Tests</b></summary>

```bash
npm test          # Vitest: pure logic
npm run build     # required once before test:e2e (it starts the built app, not the dev server)
npm run test:e2e  # Playwright: smoke tests + axe-core a11y pass on every page
```

The E2E suite runs against a production build (`next start`) on port 3100, serially (one worker): a single Next.js server handling a dozen simultaneous first navigations from parallel browser contexts turned out to be the bottleneck, not anything worth testing for.

</details>

<details>
<summary><b>Go live with real data</b></summary>

1. In the Vercel dashboard: **Storage → Create Database → KV (Upstash for Redis)** and connect it to the project. Vercel adds `KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically.
2. Add one env var yourself: `REFUGIO_INGEST_SECRET` (any long random string).
3. In the Refugio scene deploy, set `COMPANION_URL=https://<site>/api/leaderboard` and `COMPANION_SECRET` (same value as `REFUGIO_INGEST_SECRET`). The server pushes on every round close.

</details>

## 🏕️ Part of Refugio

| Repo | What it is |
|:--|:--|
| [ALFA117/Refugio](https://github.com/ALFA117/Refugio) | The Decentraland SDK7 scene: the campfire, the seats, the cooperative round and the server that awards embers |
| **ALFA117/refugio-wall** (this repo) | The public web companion: leaderboard, profiles, stats and the browser demo |

Built for the **Friendzone Hackathon** on DoraHacks.

## 📄 License

[MIT](LICENSE)

---

<div align="center">

**One log at a time, together.**

</div>
