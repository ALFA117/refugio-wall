import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Automated pass over the pages a real visitor lands on. Scoped to "serious"/"critical" impact
// only — "minor"/"moderate" flags from axe include a lot of judgment calls (heading order on a
// single-h1 page, landmark redundancy) that were already reasoned through by hand earlier in
// this project; failing CI on those would just make the check noisy, not more useful.
// The redesign fades rows and panels in (staggered, framer-motion driven). Axe samples colours
// as they are, so a scan mid-fade reports text at 1.1:1 that settles at full contrast. Wait
// until the effective opacity of every element that carries text has stopped changing.
async function textSettled(page: Page) {
  await page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        const snapshot = () =>
          Array.from(document.body.querySelectorAll<HTMLElement>("*"))
            .filter((el) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent!.trim()))
            .map((el) => {
              let o = 1;
              for (let n: HTMLElement | null = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
              return o.toFixed(3);
            })
            .join();
        const before = snapshot();
        setTimeout(() => resolve(before === snapshot()), 400);
      }),
    null,
    { timeout: 15_000 },
  );
}

const PAGES = ["/", "/demo", "/guardians", "/stats", "/compare", "/guardians/emberkeeper.eth"];

for (const path of PAGES) {
  test(`a11y: ${path} has no serious/critical violations`, async ({ page }) => {
    await page.goto(path);
    await textSettled(page);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
