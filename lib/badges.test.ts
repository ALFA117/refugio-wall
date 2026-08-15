import { describe, it, expect } from "vitest";
import { badgeForBrasas, BADGE_TIERS } from "./badges";
import { DICTS } from "./i18n";

describe("badgeForBrasas", () => {
  const d = DICTS.en;

  it("returns null below the lowest tier", () => {
    expect(badgeForBrasas(24, d)).toBeNull();
    expect(badgeForBrasas(0, d)).toBeNull();
  });

  it("picks the correct tier at each boundary", () => {
    expect(badgeForBrasas(25, d)?.label).toBe(d.badges.spark);
    expect(badgeForBrasas(99, d)?.label).toBe(d.badges.spark);
    expect(badgeForBrasas(100, d)?.label).toBe(d.badges.kindling);
    expect(badgeForBrasas(499, d)?.label).toBe(d.badges.kindling);
    expect(badgeForBrasas(500, d)?.label).toBe(d.badges.ember);
    expect(badgeForBrasas(999, d)?.label).toBe(d.badges.ember);
    expect(badgeForBrasas(1000, d)?.label).toBe(d.badges.firekeeper);
    expect(badgeForBrasas(2499, d)?.label).toBe(d.badges.firekeeper);
    expect(badgeForBrasas(2500, d)?.label).toBe(d.badges.eternal);
    expect(badgeForBrasas(999999, d)?.label).toBe(d.badges.eternal);
  });

  it("tiers are sorted descending by threshold (badgeForBrasas relies on first-match-wins)", () => {
    for (let i = 1; i < BADGE_TIERS.length; i++) {
      expect(BADGE_TIERS[i].min).toBeLessThan(BADGE_TIERS[i - 1].min);
    }
  });

  it("gives the same tier in both languages for the same brasas value", () => {
    for (const brasas of [0, 25, 100, 500, 1000, 2500, 5000]) {
      const en = badgeForBrasas(brasas, DICTS.en);
      const es = badgeForBrasas(brasas, DICTS.es);
      expect(en === null).toBe(es === null);
      expect(en?.color).toBe(es?.color);
    }
  });
});
