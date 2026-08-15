import { defineConfig, devices } from "@playwright/test";

// Local/CI E2E config — always launches its own `next start` against the production build
// (webServer below) rather than assuming a dev server is already running, so `npm run
// test:e2e` works the same on a fresh checkout as it does in CI.
export default defineConfig({
  testDir: "./e2e",
  // Serial: a single `next start` process handling a dozen simultaneous first-navigations
  // from parallel workers was timing out every request past the first few — this is a small
  // suite, not a load test, so there's no upside to fighting that for parallelism.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    // Every test gets a fresh browser context (fresh localStorage), which means the first-
    // visit onboarding overlay would block every single test's first interaction — that's
    // correct app behavior (a modal should block the background), just not what these smoke/
    // a11y tests are checking. Pre-seed the "seen" flag so they land on the real page instead.
    storageState: {
      cookies: [],
      origins: [{ origin: "http://localhost:3100", localStorage: [{ name: "refugio-onboarding-seen", value: "1" }] }],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Assumes a build already exists (CI runs `npm run build` as its own step before this).
    // Rebuilding inside webServer too was timing out the 180s window on top of the actual
    // server start.
    command: "npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
