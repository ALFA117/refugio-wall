// Shared motion tokens — the same ease curve was copy-pasted as a literal array into four
// files (Wall, Demo, GuardianProfile, TickerNumber). One definition means a future tuning pass
// only has to happen once, and nobody can accidentally introduce a slightly different curve.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
