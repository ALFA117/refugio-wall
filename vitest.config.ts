import { defineConfig } from "vitest/config";

// Vitest's default file glob matches `*.spec.ts` anywhere, which picked up the Playwright
// specs under e2e/ too — those import `test` from @playwright/test, not vitest, and crashed
// with "did not expect test() to be called here" when vitest tried to run them.
export default defineConfig({
  test: {
    exclude: ["e2e/**", "node_modules/**"],
  },
});
