// Data layer for the Wall of Guardians — backed by Vercel KV (Upstash Redis).
//
// Flow: the Decentraland Multiplayer Server `signedFetch`es a snapshot to
// POST /api/leaderboard on round close; we store it in KV; the page reads it back.
// No SQL, no schema — a single JSON value under one key.
//
// Goes live automatically once these env vars exist (Vercel KV adds them for you when you
// create a KV store and connect it to the project):
//   KV_REST_API_URL, KV_REST_API_TOKEN
//   REFUGIO_INGEST_SECRET  (shared secret the DCL server sends; you set this one)
// Until then, representative sample data is served so the site deploys and looks right.

export type Guardian = { displayName: string; brasas: number; gamesPlayed?: number };
export type Timeframe = "all" | "week" | "today";
export type Source = "live" | "sample";

export type LeaderboardResult = { entries: Guardian[]; source: Source; updatedAt: string };
export type LeaderboardBundle = {
  source: Source;
  updatedAt: string;
  frames: Record<Timeframe, Guardian[]>;
};

const KV_KEY = "refugio_leaderboard";

const SAMPLE: Record<Timeframe, Guardian[]> = {
  all: [
    { displayName: "emberkeeper.eth", brasas: 1480, gamesPlayed: 41 },
    { displayName: "nightowl", brasas: 1225, gamesPlayed: 33 },
    { displayName: "sol.guardian", brasas: 1090, gamesPlayed: 30 },
    { displayName: "ashwalker", brasas: 940, gamesPlayed: 26 },
    { displayName: "kindling", brasas: 815, gamesPlayed: 22 },
    { displayName: "firstlight", brasas: 690, gamesPlayed: 19 },
    { displayName: "cinder.dcl", brasas: 545, gamesPlayed: 15 },
    { displayName: "warmhands", brasas: 430, gamesPlayed: 12 },
    { displayName: "lastcoal", brasas: 320, gamesPlayed: 9 },
    { displayName: "newcomer", brasas: 180, gamesPlayed: 5 },
  ],
  week: [
    { displayName: "nightowl", brasas: 520, gamesPlayed: 14 },
    { displayName: "ashwalker", brasas: 470, gamesPlayed: 13 },
    { displayName: "emberkeeper.eth", brasas: 430, gamesPlayed: 12 },
    { displayName: "firstlight", brasas: 360, gamesPlayed: 10 },
    { displayName: "sol.guardian", brasas: 300, gamesPlayed: 8 },
    { displayName: "warmhands", brasas: 250, gamesPlayed: 7 },
    { displayName: "kindling", brasas: 190, gamesPlayed: 5 },
    { displayName: "duskrunner", brasas: 140, gamesPlayed: 4 },
  ],
  today: [
    { displayName: "ashwalker", brasas: 200, gamesPlayed: 6 },
    { displayName: "emberkeeper.eth", brasas: 170, gamesPlayed: 5 },
    { displayName: "duskrunner", brasas: 130, gamesPlayed: 4 },
    { displayName: "nightowl", brasas: 100, gamesPlayed: 3 },
    { displayName: "firstlight", brasas: 60, gamesPlayed: 2 },
  ],
};

function kvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

// Read the stored leaderboard from KV (Upstash REST). Returns null if unset/unconfigured.
async function kvGet(): Promise<Guardian[] | null> {
  const cfg = kvConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/get/${KV_KEY}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result: string | null };
    if (!data.result) return null;
    const parsed = JSON.parse(data.result) as Guardian[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

// Write the leaderboard to KV. Called by the ingest route. Returns false if unconfigured.
export async function kvSet(entries: Guardian[]): Promise<boolean> {
  const cfg = kvConfig();
  if (!cfg) return false;
  try {
    const res = await fetch(`${cfg.url}/set/${KV_KEY}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "text/plain" },
      body: JSON.stringify(entries),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function isKvConfigured(): boolean {
  return kvConfig() !== null;
}

// Single-timeframe read (used by the API route). When live, every timeframe serves the
// cumulative KV ranking (time-windowing is future work — the server persists all-time only).
export async function getLeaderboard(timeframe: Timeframe = "all"): Promise<LeaderboardResult> {
  const live = await kvGet();
  return {
    entries: live ?? SAMPLE[timeframe],
    source: live ? "live" : "sample",
    updatedAt: new Date().toISOString(),
  };
}

// All timeframes at once (used by the page so the client can switch without refetching).
export async function getLeaderboardBundle(): Promise<LeaderboardBundle> {
  const live = await kvGet();
  if (live) {
    return { source: "live", updatedAt: new Date().toISOString(), frames: { all: live, week: live, today: live } };
  }
  return { source: "sample", updatedAt: new Date().toISOString(), frames: SAMPLE };
}
