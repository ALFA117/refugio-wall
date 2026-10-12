# Wall of Guardians 🔥

The public companion for **[Refugio](https://github.com/ALFA117/Refugio)** — a Decentraland (SDK7) campfire that only burns when people show up. Two things live here:

- **The Wall** (`/`) — the public leaderboard, *outside* the metaverse, so the ranking is shareable on the web (the "Retention & Discovery" angle of the hackathon).
- **The Demo** (`/demo`) — a playable, no-install taste of the real feed-the-fire mechanic, for pitching to people who can't or won't install the Decentraland client.

Built with **Next.js 14 (App Router)**, **Framer Motion**, and **Tailwind**, in the same "Twilight Ember" visual world as the in-scene UI and the pitch page. Bilingual (EN default, ES toggle) via a shared `useLang` hook.

## The Wall (`/`)

- Live leaderboard with All-time / This week / Today filters (synced to the URL — `?tf=week` is itself shareable)
- Search with highlight, milestone badges, a sticky "leading" bar once the podium scrolls away
- Deep-linkable guardian profiles at `/guardians/[name]`, each with a personalized Open Graph share card, a Web Share button, and rank/streak stats
- `/guardians` — the full roster (the Wall itself only ever shows the top 10)
- `/stats` — aggregate community numbers (total guardians, embers earned, rounds played, badge distribution)
- `/compare` — pick any two guardians and see who's ahead
- A hidden easter egg (5 rapid taps on the language toggle)
- Installable as a PWA ("Add to Home Screen")

## The Demo (`/demo`)

A small, real game — not just a readout:

- **Start screen** with 3 difficulty modes (Easy/Normal/Hard — tune wood timing, decay, and how many pieces of firewood can be alight at once)
- **8-seat guardian ring** around a layered campfire (matches the real scene's seat count), with organic per-seat jitter, depth, and color variety instead of a mechanical uniform pattern
- **Feed-the-fire loop**: tap wood before it burns out; streak + best-streak tracking, milestone spark bursts, a low-health warning pulse, haptic feedback on supported devices
- **Game over** screen with your best streak and a share button when the fire goes out
- Difficulty and best streak persist across visits (localStorage)

## How the Wall's data flows

```
Decentraland Multiplayer Server  ──signedFetch(POST)──▶  /api/leaderboard  ──▶  Vercel KV
                                                                                    │
                                          Web page  ◀──── getLeaderboard() ◀────────┘
```

When a round closes, the authoritative server `signedFetch`es a snapshot of the top guardians to `POST /api/leaderboard` (guarded by a shared secret). The route stores it in **Vercel KV** (Upstash Redis) — a single JSON value, no SQL, no schema; the page reads it back and polls every 30s once live.

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

## Testing

```bash
npm test          # Vitest — pure logic: badge tiers, fuzzy-name matching, i18n key parity
npm run build      # required once before test:e2e (it starts the built app, not the dev server)
npm run test:e2e   # Playwright — smoke tests + an automated axe-core a11y pass on every page
```

The E2E suite runs against a production build (`next start`) on port 3100, not `next dev`, and serially (one worker) — a single Next.js server handling a dozen simultaneous first-navigations from parallel browser contexts turned out to be the bottleneck, not anything worth testing for.

## Deploy

Deploys to Vercel. Set the env vars in the project settings; no env is required for the sample-data preview. Live at [wall-of-guardians.vercel.app](https://wall-of-guardians.vercel.app).

## FIX_NOTES (rediseño /diseno, 2026-10-11)

- **Texto por debajo de 12 px**: 17 etiquetas de 10–11 px (badges de rango, "Leading", número del podio, pie, rondas jugadas, dificultad de la demo, estadísticas) subieron a 12 px. El selector EN/ES tenía letras de 10 px en un switch de 52×26; ahora tiene 12 px en 68×32, dentro de un botón de 44 px, y su `aria-label` dice a qué idioma cambia.

## DESIGN_NOTES

- **Fondo 3D: el dado sacó la receta 1 (figuras CSS 3D + constelación).** Se adaptó a la fogata (`components/AmbientBackground.tsx`, montado en `layout.tsx`), en tres capas que se mueven distinto con el puntero y el scroll:
  - **lejos**: un cielo nocturno con estrellas que titilan y se enlazan despacio en constelaciones violetas;
  - **en medio**: **chispas** que suben desde el centro de abajo, como de la fogata, se mecen y se apagan al subir;
  - **cerca**: figuras CSS 3D del tema: **leños** (prismas hexagonales), **brasas** (cubos) y un **anillo de guardianes** alrededor del fuego (giroscopio con 8 puntos encendidos).
- Es completo en el Wall y la demo, y tranquilo (50 %) en perfiles, comparación y estadísticas. En celular hay la mitad de estrellas, chispas y figuras, DPR ≤ 2, pausa con la pestaña oculta y una escena quieta con movimiento reducido. Los colores salen de los tokens de "Twilight Ember" (`--violet`, `--ember`, `--amber`, `--spark`).
- **No se hizo modo claro**, a propósito: el proyecto declara en `globals.css` "un solo mundo oscuro comprometido" (una fogata de noche). Se respeta esa decisión.

### Checklist de 2 minutos en el celular

1. Abre el Wall: suben chispas desde abajo, hay estrellas arriba y un anillo violeta gira en la esquina.
2. El switch EN/ES se toca sin fallar y sus letras se leen.
3. Los badges ("FIREKEEPER") y los números del podio se leen sin zoom.
4. Abre un perfil de guardián: el fondo se calma.
5. Sin scroll horizontal.
