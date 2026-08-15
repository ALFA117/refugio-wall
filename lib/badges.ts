// Badge tiers — single source of truth. Previously the brasas thresholds (1000/500/100) and
// their colors were hardcoded twice (Wall.tsx's Badge, GuardianProfile.tsx's badgeLabel), so a
// tier change in one place could silently drift from the other and show a guardian a different
// badge on their profile than on the leaderboard.
import type { Dict } from "./i18n";

export const BADGE_TIERS = [
  { min: 2500, key: "eternal", color: "var(--warm-white)" },
  { min: 1000, key: "firekeeper", color: "var(--gold)" },
  { min: 500, key: "ember", color: "var(--ember)" },
  { min: 100, key: "kindling", color: "var(--violet)" },
  { min: 25, key: "spark", color: "var(--ash)" },
] as const;

export function badgeForBrasas(brasas: number, d: Dict): { label: string; color: string } | null {
  const tier = BADGE_TIERS.find((t) => brasas >= t.min);
  return tier ? { label: d.badges[tier.key as keyof Dict["badges"]], color: tier.color } : null;
}
