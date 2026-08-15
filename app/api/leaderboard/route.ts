import { NextResponse } from "next/server";
import { getLeaderboard, kvSet, isKvConfigured, recordSnapshot, type Timeframe } from "@/lib/leaderboard";
import { isRateLimited } from "@/lib/rateLimit";
import { IngestSchema } from "@/lib/ingestSchema";

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
// round close). Guarded by a shared secret so only our server can write. Stores in Vercel KV
// when configured; otherwise responds 501 so the caller knows ingest isn't wired yet.
export async function POST(req: Request) {
  // Rate-limited before the secret check too, so repeated wrong-secret guesses get throttled
  // instead of getting unlimited free attempts.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`ingest:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const secret = process.env.REFUGIO_INGEST_SECRET;
  if (!secret || req.headers.get("x-refugio-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isKvConfigured()) {
    return NextResponse.json({ error: "KV not configured" }, { status: 501 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const parsed = IngestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const ok = await kvSet(parsed.data.entries);
  if (!ok) return NextResponse.json({ error: "kv write failed" }, { status: 502 });
  await recordSnapshot(parsed.data.entries);
  return NextResponse.json({ ok: true, written: parsed.data.entries.length });
}
