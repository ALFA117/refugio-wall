import { test, expect } from "@playwright/test";

// A real end-to-end pass through the pages that carry the site's actual purpose: the
// leaderboard loads, the language toggle works, the playable demo loads, and a real guardian
// profile resolves. Sample data is always present (no KV env vars in CI), so this never
// depends on live data existing.

test("home loads with the leaderboard and language toggle", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Guardians");
  const langToggle = page.getByRole("button", { name: "Switch language" });
  await expect(langToggle).toBeVisible();
  await langToggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("demo page loads and shows the play button", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("button", { name: /play/i }).first()).toBeVisible();
});

test("a real guardian profile resolves", async ({ page }) => {
  await page.goto("/guardians/emberkeeper.eth");
  await expect(page.locator("h1")).toHaveText("emberkeeper.eth");
  await expect(page.getByText(/Rank #1/)).toBeVisible();
});

test("an unknown guardian shows a 404 with a suggestion when close", async ({ page }) => {
  await page.goto("/guardians/nightowll");
  await expect(page.getByText("No such guardian")).toBeVisible();
  await expect(page.getByRole("link", { name: "nightowl" })).toBeVisible();
});

test("/guardians full roster page lists everyone", async ({ page }) => {
  await page.goto("/guardians");
  await expect(page.locator("ol > li")).toHaveCount(10);
});

test("/stats shows aggregate numbers", async ({ page }) => {
  await page.goto("/stats");
  await expect(page.getByText("Guardians", { exact: false }).first()).toBeVisible();
});

test("/compare lets you pick two guardians and shows a delta", async ({ page }) => {
  await page.goto("/compare?a=emberkeeper.eth&b=nightowl");
  await expect(page.getByText(/is ahead by/)).toBeVisible();
});

test.describe("first-visit onboarding", () => {
  // Overrides the suite-wide pre-seeded storage state (see playwright.config.ts) — this is
  // the one test that specifically needs a truly fresh, never-seen-it-before session.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("shows once, walks through 3 steps, and does not block the page after dismissal", async ({ page }) => {
    await page.goto("/");
    const dialog = page.getByRole("dialog", { name: "This is the Wall" });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("dialog", { name: "Try it yourself" })).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("dialog", { name: "Explore further" })).toBeVisible();

    await page.getByRole("dialog").getByRole("button", { name: "Got it" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    // A real click on the language toggle must land now that nothing is covering it.
    await page.getByRole("button", { name: "Switch language" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("Skip dismisses immediately and does not reappear on reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("dialog").getByRole("button", { name: "Skip" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.reload();
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
