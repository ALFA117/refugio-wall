import { test, expect } from "@playwright/test";

// Every route that gets shared (socials, iMessage previews, Discord embeds) needs its own
// og:title/description/image — otherwise it silently falls back to the root layout's generic
// metadata even when a dedicated OG *image* route exists for it (this exact bug was found and
// fixed by hand earlier for /demo and /guardians/[name]; this test exists so a future route
// can't reintroduce it unnoticed).
const ROUTES = ["/", "/demo", "/guardians/emberkeeper.eth", "/guardians", "/stats", "/compare"];

for (const path of ROUTES) {
  test(`OG metadata: ${path} has title, description, and an absolute image URL`, async ({ page }) => {
    await page.goto(path);

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute("content");
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");

    expect(ogTitle, `${path} missing og:title`).toBeTruthy();
    expect(ogDescription, `${path} missing og:description`).toBeTruthy();
    expect(ogImage, `${path} missing og:image`).toBeTruthy();
    expect(ogImage, `${path} og:image should be an absolute URL`).toMatch(/^https?:\/\//);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical, `${path} missing <link rel="canonical">`).toBeTruthy();
  });
}

test("demo and a guardian profile each get their own dedicated OG title (not the root's)", async ({ page }) => {
  await page.goto("/");
  const rootTitle = await page.locator('meta[property="og:title"]').getAttribute("content");

  await page.goto("/demo");
  const demoTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
  expect(demoTitle).not.toBe(rootTitle);

  await page.goto("/guardians/emberkeeper.eth");
  const profileTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
  expect(profileTitle).not.toBe(rootTitle);
  expect(profileTitle).toContain("emberkeeper.eth");
});
