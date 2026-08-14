// Data layer for the Wall of Guardians.
//
// Real source: the Decentraland Multiplayer Server `signedFetch`es a snapshot to
// POST /api/leaderboard on round close; we upsert into Supabase and read it back here.
// Until Supabase is wired (env vars below), representative sample data is served so the
// site deploys and looks right immediately.
//
// Vercel env to go live:
//   SUPABASE_URL, SUPABASE_SERVICE_KEY (server-only), REFUGIO_INGEST_SECRET

export type Guardian = { displayName: string; brasas: number; gamesPlayed?: number };
export type Timeframe = "all" | "week" | "today";

export type LeaderboardResult = {
  entries: Guardian[];
  source: "supabase" | "sample";
  updatedAt: string;
};

export type LeaderboardBundle = {
  source: "supabase" | "sample";
  updatedAt: string;
  frames: Record<Timeframe, Guardian[]>;
};

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

async function fromSupabase(): Promise<Guardian[] | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/leaderboard?select=display_name,brasas,games_played&order=brasas.desc&limit=10`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { display_name: string; brasas: number; games_played?: number }[];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map((r) => ({ displayName: r.display_name, brasas: r.brasas, gamesPlayed: r.games_played }));
  } catch {
    return null;
  }
}

// Single-timeframe read (used by the API route).
export async function getLeaderboard(timeframe: Timeframe = "all"): Promise<LeaderboardResult> {
  const live = await fromSupabase();
  return {
    entries: live ?? SAMPLE[timeframe],
    source: live ? "supabase" : "sample",
    updatedAt: new Date().toISOString(),
  };
}

// All timeframes at once (used by the page so the client can switch without refetching).
export async function getLeaderboardBundle(): Promise<LeaderboardBundle> {
  const live = await fromSupabase();
  if (live) {
    return { source: "supabase", updatedAt: new Date().toISOString(), frames: { all: live, week: live, today: live } };
  }
  return { source: "sample", updatedAt: new Date().toISOString(), frames: SAMPLE };
}
