// In-memory sliding-window rate limiter. Per-process — resets on cold start/redeploy, and
// doesn't coordinate across serverless instances. That's a real limitation, but the goal here
// is blunting brute-force secret-guessing and accidental retry storms on a low-traffic,
// single-trusted-source ingest endpoint, not surviving a real distributed attack (a shared KV-
// backed limiter would be the next step if this endpoint ever needed that).
const buckets = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  buckets.set(key, timestamps);
  return timestamps.length > limit;
}
