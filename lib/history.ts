import type { Snapshot } from "./leaderboard";

// Pure functions kept separate from leaderboard.ts's KV I/O so they're trivially unit-testable
// with hand-built Snapshot fixtures, without needing KV configured.

// A guardian's brasas value on each day they appear in the history, oldest first. Days they
// weren't in the top-N snapshot are simply absent (not zero) — a gap in the trend, not a dip.
export function guardianTrend(history: Snapshot[], name: string): number[] {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const lower = name.toLowerCase();
  return sorted
    .map((s) => s.entries.find((e) => e.displayName.toLowerCase() === lower))
    .filter((e): e is NonNullable<typeof e> => !!e)
    .map((e) => e.brasas);
}

// The guardian with the largest brasas increase between the two most recent snapshots. null
// if there isn't at least two days of history yet, or nobody who was present both days gained.
export function topGainer(history: Snapshot[]): { name: string; delta: number } | null {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return null;
  const [prev, curr] = sorted.slice(-2);
  if (!prev || !curr) return null;

  let best: { name: string; delta: number } | null = null;
  for (const c of curr.entries) {
    const before = prev.entries.find((e) => e.displayName.toLowerCase() === c.displayName.toLowerCase());
    const delta = c.brasas - (before?.brasas ?? 0);
    if (delta > 0 && (!best || delta > best.delta)) best = { name: c.displayName, delta };
  }
  return best;
}
