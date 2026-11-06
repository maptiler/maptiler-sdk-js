import { expect, test } from "@playwright/test";

import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";

test("Sanitizes source attributions in the default attribution control", async ({ page }) => {
  await page.route("https://evil.example/**", (route) => route.fulfill({ status: 200, contentType: "image/png", body: "" }));

  await loadFixtureAndGetMapHandle({
    fixture: "attributionSanitizing",
    page,
  });

  const attribution = page.locator(".maplibregl-ctrl-attrib-inner");
  await expect(attribution).toContainText("© OpenStreetMap contributors");

  // javascript: URLs only run when clicked, and the SVG animation needs a moment to set its href
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    for (const element of document.querySelectorAll(".maplibregl-ctrl-attrib-inner :is(a[href^='javascript:'], svg a, button)")) {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    }
  });
  await page.waitForTimeout(1000);

  expect(await page.evaluate(() => window.__attributionScriptExecuted)).toBeUndefined();
  expect(await page.evaluate(() => document.baseURI)).toBe(page.url());
  expect(await page.evaluate(() => getComputedStyle(document.body).outlineStyle)).toBe("none");
  await expect(attribution.locator("iframe, form, button, svg, base, style")).toHaveCount(0);
  await expect(attribution.locator("a", { hasText: "© OpenStreetMap contributors" })).toHaveCount(0);
});
