import { expect, test } from "@playwright/test";

import getMapInstanceForFixture from "./helpers/getMapInstanceForFixture";

test("Awaits until map ready and takes snapshot", async ({ page }, testInfo) => {
  const { map } = await getMapInstanceForFixture({
    fixture: "mapLoad",
    page,
  });

  expect(await page.title()).toBe("MapTiler E2E Map Load");

  await expect(page).toHaveScreenshot("mapLoad.png");
});
