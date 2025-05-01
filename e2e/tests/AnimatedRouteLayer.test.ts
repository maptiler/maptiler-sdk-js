import { expect, test } from "@playwright/test";
import getMapInstanceForFixture from "./helpers/getMapInstanceForFixture";
import { AnimatedRouteLayer } from "index";
import { Map } from "@maptiler/sdk";
import expected from "./expected-results/animatedRouteLayer-1.json" assert { type: "json" };

test("Follows the correct path taking screenshots at each interval", async ({ page }) => {
  await getMapInstanceForFixture({
    fixture: "animatedRouteLayer",
    page,
    timeout: 10000,
  });

  expect(await page.title()).toBe("MapTiler E2E Animated Route Layer");

  await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
    await expect(page).toHaveScreenshot(`animated-route-${data.frame}.png`);
    expect(data).toEqual(expected[data.frame as number]);
  });

  await page.clock.install();

  await page.evaluate(async () => {
    const NUM_SCREENSHOTS = 20;
    const NUM_FRAMES_BETWEEN_SCREENSHOTS = 20;

    const { animatedRouteLayer } = window.__pageObjects as { animatedRouteLayer: AnimatedRouteLayer };
    const map = window.__map as Map;

    for (let i = 0; i < NUM_SCREENSHOTS; i++) {
      for (let j = 0; j < NUM_FRAMES_BETWEEN_SCREENSHOTS; j++) {
        animatedRouteLayer.updateManual();
      }
      await window.notifyScreenshotStateReady({
        frame: i,
        center: map.getCenter().toArray(),
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    }
  });

  await page.clock.runFor(10000);
});
