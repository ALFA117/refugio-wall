// Shared motion tokens — the same ease curve was copy-pasted as a literal array into four
// files (Wall, Demo, GuardianProfile, TickerNumber). One definition means a future tuning pass
// only has to happen once, and nobody can accidentally introduce a slightly different curve.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// One consistent press/hover signature for every clickable surface, instead of each component
// picking its own scale/lift values ad hoc (some buttons had none at all). Spread these onto
// whileTap/whileHover; SNAPPY is the matching transition for both.
export const TAP_PRESS = { scale: 0.96 } as const;
export const HOVER_LIFT = { y: -2 } as const;
export const SNAPPY = { type: "spring", stiffness: 420, damping: 24 } as const;
