// Plain Levenshtein edit distance — used only to suggest "did you mean X?" on a guardian
// profile 404. No dependency needed for something this small.
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

// Returns the closest candidate name by edit distance, but only if it's actually close —
// a distance that's most of the string length isn't a typo, it's a different name, and
// suggesting it would be more confusing than saying nothing.
export function closestName(target: string, candidates: string[]): string | null {
  if (candidates.length === 0) return null;
  const t = target.toLowerCase();
  let best: string | null = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const dist = editDistance(t, c.toLowerCase());
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  const threshold = Math.max(2, Math.ceil(t.length * 0.4));
  return bestDist <= threshold ? best : null;
}
