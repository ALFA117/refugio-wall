import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Automated pass over the pages a real visitor lands on. Scoped to "serious"/"critical" impact
// only — "minor"/"moderate" flags from axe include a lot of judgment calls (heading order on a
// single-h1 page, landmark redundancy) that were already reasoned through by hand earlier in
// this project; failing CI on those would just make the check noisy, not more useful.
const PAGES = ["/", "/demo", "/guardians", "/stats", "/compare", "/guardians/emberkeeper.eth"];

for (const path of PAGES) {
  test(`a11y: ${path} has no serious/critical violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
