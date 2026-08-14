import { NextResponse } from "next/server";
import { getLeaderboard, type Guardian, type Timeframe } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

// GET — public read of the current Wall. `?timeframe=all|week|today`. Shareable directly.
export async function GET(req: Request) {
  const tf = new URL(req.url).searchParams.get("timeframe");
  const timeframe: Timeframe = tf === "week" || tf === "today" ? tf : "all";
  const data = await getLeaderboard(timeframe);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
  });
}

// POST — ingest a snapshot from the Decentraland Multiplayer Server (via signedFetch on
// round close). Guarded by a shared secret so only our server can write. Writes to Supabase
// when configured; otherwise responds 501 so the caller knows ingest isn't wired yet.
export async function POST(req: Request) {
  const secret = process.env.REFUGIO_INGEST_SECRET;
  if (!secret || req.headers.get("x-refugio-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 501 });
  }

  let entries: Guardian[];
  try {
    const body = (await req.json()) as { entries?: Guardian[] };
    entries = Array.isArray(body.entries) ? body.entries : [];
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const rows = entries
    .filter((e) => e && typeof e.displayName === "string" && typeof e.brasas === "number")
    .slice(0, 50)
    .map((e) => ({ display_name: e.displayName, brasas: e.brasas, updated_at: new Date().toISOString() }));

  const res = await fetch(`${url}/rest/v1/leaderboard`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "upstream write failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, written: rows.length });
}
