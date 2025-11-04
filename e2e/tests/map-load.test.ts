import { expect, test } from "@playwright/test";

import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";

test("Awaits until map ready and takes snapshot", async ({ page }, testInfo) => {
  await loadFixtureAndGetMapHandle({
    fixture: "mapLoad",
    page,
  });

  expect(await page.title()).toBe("MapTiler E2E Map Load");

  await expect(page).toHaveScreenshot("mapLoad.png");
});
