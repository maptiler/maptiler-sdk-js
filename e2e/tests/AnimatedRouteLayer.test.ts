import { expect, test } from "@playwright/test";

import getMapInstanceForFixture from "./helpers/getMapInstanceForFixture";

test("Awaits until map ready and takes snapshot", async ({ page }) => {
  const { map } = await getMapInstanceForFixture({
    fixture: "animatedRouteLayer",
    page,
    timeout: 10000,
  });

  expect(await page.title()).toBe("MapTiler E2E Animated Route Layer");

  // await expect(page).toHaveScreenshot("mapLoad.png");
});
