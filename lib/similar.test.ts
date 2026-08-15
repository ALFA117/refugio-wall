import { describe, it, expect } from "vitest";
import { closestName } from "./similar";

const NAMES = ["emberkeeper.eth", "nightowl", "sol.guardian", "ashwalker", "kindling"];

describe("closestName", () => {
  it("suggests the obvious typo", () => {
    expect(closestName("nightowll", NAMES)).toBe("nightowl");
    expect(closestName("nihgtowl", NAMES)).toBe("nightowl");
  });

  it("returns null for something genuinely unrelated", () => {
    expect(closestName("xyzzyplugh123", NAMES)).toBeNull();
  });

  it("returns null with no candidates", () => {
    expect(closestName("anything", [])).toBeNull();
  });

  it("is case-insensitive", () => {
    expect(closestName("NIGHTOWL", NAMES)).toBe("nightowl");
  });

  it("matches itself exactly", () => {
    expect(closestName("ashwalker", NAMES)).toBe("ashwalker");
  });
});
