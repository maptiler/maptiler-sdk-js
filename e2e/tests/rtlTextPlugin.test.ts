import { expect, test } from "@playwright/test";
import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";

test("Renders RTL text correctly when RTL plugin is enabled and incorrectly when disabled", async ({ page }) => {
  await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
    const screenshotname = data.disabled ? "rtlTextPlugin-disabled.png" : "rtlTextPlugin-enabled.png";
    await expect(page).toHaveScreenshot(screenshotname);
  });

  await loadFixtureAndGetMapHandle({
    fixture: "rtlTextPlugin",
    page,
  });

  expect(await page.title()).toBe("MapTiler E2E RTL Text Plugin");

  await loadFixtureAndGetMapHandle({
    fixture: "rtlTextPlugin",
    page,
    queryParams: { "disable-rtl": "true" },
  });
});
