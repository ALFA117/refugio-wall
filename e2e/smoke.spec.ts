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
