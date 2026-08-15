import { describe, it, expect } from "vitest";
import { IngestSchema } from "./ingestSchema";

describe("IngestSchema", () => {
  it("accepts a valid payload", () => {
    const r = IngestSchema.safeParse({ entries: [{ displayName: "nightowl", brasas: 100, gamesPlayed: 5 }] });
    expect(r.success).toBe(true);
  });

  it("accepts entries without gamesPlayed (optional)", () => {
    const r = IngestSchema.safeParse({ entries: [{ displayName: "nightowl", brasas: 100 }] });
    expect(r.success).toBe(true);
  });

  it("rejects a negative brasas value", () => {
    const r = IngestSchema.safeParse({ entries: [{ displayName: "x", brasas: -5 }] });
    expect(r.success).toBe(false);
  });

  it("rejects a non-integer brasas value", () => {
    const r = IngestSchema.safeParse({ entries: [{ displayName: "x", brasas: 1.5 }] });
    expect(r.success).toBe(false);
  });

  it("rejects an empty displayName", () => {
    const r = IngestSchema.safeParse({ entries: [{ displayName: "", brasas: 10 }] });
    expect(r.success).toBe(false);
  });

  it("rejects a displayName over 64 chars", () => {
    const r = IngestSchema.safeParse({ entries: [{ displayName: "x".repeat(65), brasas: 10 }] });
    expect(r.success).toBe(false);
  });

  it("rejects more than 50 entries", () => {
    const entries = Array.from({ length: 51 }, (_, i) => ({ displayName: `g${i}`, brasas: i }));
    const r = IngestSchema.safeParse({ entries });
    expect(r.success).toBe(false);
  });

  it("rejects a missing entries field", () => {
    const r = IngestSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types entirely", () => {
    expect(IngestSchema.safeParse(null).success).toBe(false);
    expect(IngestSchema.safeParse("not an object").success).toBe(false);
    expect(IngestSchema.safeParse({ entries: "not an array" }).success).toBe(false);
  });
});
