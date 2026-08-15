import { describe, it, expect } from "vitest";
import { DICTS } from "./i18n";

// Walks both dictionaries and asserts they have exactly the same shape — catches the case
// where a new string gets added to one language's Dict block but the other is forgotten,
// which the TypeScript `Dict` type alone won't catch if both objects happen to satisfy it
// only because of leftover/duplicate keys or `any`-typed escape hatches.
function keyPaths(obj: unknown, prefix = ""): string[] {
  if (Array.isArray(obj)) {
    // Arrays (taglines, systems) are compared by length/shape elsewhere, not per-path.
    return [prefix];
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

describe("i18n dictionary parity", () => {
  it("en and es expose the exact same key paths", () => {
    const enKeys = keyPaths(DICTS.en).sort();
    const esKeys = keyPaths(DICTS.es).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it("taglines and systems arrays are the same length in both languages", () => {
    expect(DICTS.es.taglines.length).toBe(DICTS.en.taglines.length);
    expect(DICTS.es.systems.length).toBe(DICTS.en.systems.length);
  });

  it("no string value is empty", () => {
    for (const lang of ["en", "es"] as const) {
      const walk = (obj: unknown, path: string): void => {
        if (typeof obj === "string") {
          expect(obj.length, `${lang}:${path} is empty`).toBeGreaterThan(0);
        } else if (Array.isArray(obj)) {
          obj.forEach((v, i) => walk(v, `${path}[${i}]`));
        } else if (obj && typeof obj === "object") {
          Object.entries(obj as Record<string, unknown>).forEach(([k, v]) => walk(v, `${path}.${k}`));
        }
      };
      walk(DICTS[lang], lang);
    }
  });
});
