import { describe, it, expect } from "vitest";
import { isRateLimited } from "./rateLimit";

describe("isRateLimited", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(key, 5, 60_000)).toBe(false);
    }
  });

  it("blocks once the limit is exceeded within the window", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) isRateLimited(key, 3, 60_000);
    expect(isRateLimited(key, 3, 60_000)).toBe(true);
  });

  it("keeps separate counters per key", () => {
    const a = `test-a-${Math.random()}`;
    const b = `test-b-${Math.random()}`;
    for (let i = 0; i < 5; i++) isRateLimited(a, 3, 60_000);
    expect(isRateLimited(b, 3, 60_000)).toBe(false);
  });
});
