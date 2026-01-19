import { expect, test } from "@playwright/test";
import path from "path";
import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";

test("Renders RTL text correctly when RTL plugin is enabled and incorrectly when disabled", async ({ page }) => {
  // Route handler for tiles.json
  await page.route("https://api.maptiler.com/tiles/v3/tiles.json*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      path: path.resolve(import.meta.dirname, "./mocks/rtl-tiles-json.json"),
    });
  });

  await loadFixtureAndGetMapHandle({
    fixture: "rtlTextPlugin",
    page,
  });

  expect(await page.title()).toBe("MapTiler E2E RTL Text Plugin");

  await expect(page).toHaveScreenshot("rtlTextPlugin-active.png");

  await loadFixtureAndGetMapHandle({
    fixture: "rtlTextPlugin",
    page,
    queryParams: { "disable-rtl": "true" },
  });

  await expect(page).toHaveScreenshot("rtlTextPlugin-disabled.png");
});
