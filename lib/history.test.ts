import { describe, it, expect } from "vitest";
import { guardianTrend, topGainer } from "./history";
import type { Snapshot } from "./leaderboard";

const HISTORY: Snapshot[] = [
  { date: "2026-08-10", entries: [{ displayName: "nightowl", brasas: 100 }, { displayName: "ashwalker", brasas: 80 }] },
  { date: "2026-08-11", entries: [{ displayName: "nightowl", brasas: 140 }, { displayName: "ashwalker", brasas: 90 }] },
  { date: "2026-08-12", entries: [{ displayName: "nightowl", brasas: 150 }, { displayName: "ashwalker", brasas: 200 }] },
];

describe("guardianTrend", () => {
  it("returns brasas values oldest-first", () => {
    expect(guardianTrend(HISTORY, "nightowl")).toEqual([100, 140, 150]);
  });

  it("skips days the guardian is absent instead of inserting zero", () => {
    const withGap: Snapshot[] = [
      { date: "2026-08-10", entries: [{ displayName: "nightowl", brasas: 100 }] },
      { date: "2026-08-11", entries: [{ displayName: "ashwalker", brasas: 90 }] },
      { date: "2026-08-12", entries: [{ displayName: "nightowl", brasas: 150 }] },
    ];
    expect(guardianTrend(withGap, "nightowl")).toEqual([100, 150]);
  });

  it("is case-insensitive and unordered-input-safe", () => {
    const shuffled = [HISTORY[2], HISTORY[0], HISTORY[1]] as Snapshot[];
    expect(guardianTrend(shuffled, "NIGHTOWL")).toEqual([100, 140, 150]);
  });

  it("returns empty for an unknown guardian", () => {
    expect(guardianTrend(HISTORY, "nobody")).toEqual([]);
  });
});

describe("topGainer", () => {
  it("picks the guardian with the largest gain between the last two snapshots", () => {
    // nightowl: 140->150 (+10), ashwalker: 90->200 (+110)
    expect(topGainer(HISTORY)).toEqual({ name: "ashwalker", delta: 110 });
  });

  it("returns null with fewer than 2 snapshots", () => {
    expect(topGainer([])).toBeNull();
    expect(topGainer([HISTORY[0]] as Snapshot[])).toBeNull();
  });

  it("returns null if nobody present on both days gained", () => {
    const flat: Snapshot[] = [
      { date: "2026-08-10", entries: [{ displayName: "a", brasas: 100 }] },
      { date: "2026-08-11", entries: [{ displayName: "a", brasas: 100 }] },
    ];
    expect(topGainer(flat)).toBeNull();
  });

  it("treats a guardian new to today's snapshot as gaining from 0", () => {
    const newcomer: Snapshot[] = [
      { date: "2026-08-10", entries: [{ displayName: "a", brasas: 500 }] },
      { date: "2026-08-11", entries: [{ displayName: "a", brasas: 500 }, { displayName: "b", brasas: 40 }] },
    ];
    expect(topGainer(newcomer)).toEqual({ name: "b", delta: 40 });
  });
});
