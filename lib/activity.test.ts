import { describe, it, expect } from "vitest";
import { diffActivity } from "./activity";

const LABELS = { joined: "{name} joined the leaderboard", movedUp: "{name} moved up to #{rank}" };

describe("diffActivity", () => {
  it("returns nothing on the first poll (no baseline yet)", () => {
    expect(diffActivity(null, { a: 0 }, LABELS)).toEqual([]);
  });

  it("reports a newcomer", () => {
    const events = diffActivity({ a: 0 }, { a: 0, b: 1 }, LABELS);
    expect(events).toEqual(["b joined the leaderboard"]);
  });

  it("does not report someone moving down", () => {
    const events = diffActivity({ a: 0, b: 1 }, { a: 1, b: 0 }, LABELS);
    expect(events).toEqual(["b moved up to #1"]);
  });

  it("does not report someone whose rank didn't change", () => {
    expect(diffActivity({ a: 0 }, { a: 0 }, LABELS)).toEqual([]);
  });

  it("handles an empty new set", () => {
    expect(diffActivity({ a: 0 }, {}, LABELS)).toEqual([]);
  });
});
