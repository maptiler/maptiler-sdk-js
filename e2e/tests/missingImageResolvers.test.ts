import { expect, test, type Page } from "@playwright/test";
import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";

// Largest per-channel difference from an icon's colour still counted as that colour
const COLOR_TOLERANCE = 16;

/** Waits until the map has gone idle after its `styleLoad`th style load, with the icon layer added. */
async function waitForStyleLoad(page: Page, styleLoad: number) {
  await page.waitForFunction((n) => window.__missingImageResolvers.idleStyleLoads === n, styleLoad);
}

/** The colour on screen at the centre of the icon placed at `id`'s point. */
async function colorAtIcon(page: Page, id: string): Promise<[number, number, number]> {
  const point = await page.evaluate((id) => {
    const lngLat = window.__missingImageResolvers.points[id];
    const { x, y } = window.__map.project(lngLat);
    const rect = window.__map.getCanvas().getBoundingClientRect();
    return { x: rect.left + x, y: rect.top + y };
  }, id);

  const png = await page.screenshot({
    clip: { x: Math.round(point.x) - 2, y: Math.round(point.y) - 2, width: 4, height: 4 },
    animations: "disabled",
  });

  return page.evaluate(async (base64) => {
    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const ctx = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");
    if (!ctx) throw new Error("No 2D context");
    ctx.drawImage(bitmap, 0, 0);
    const [r, g, b] = ctx.getImageData(Math.floor(bitmap.width / 2), Math.floor(bitmap.height / 2), 1, 1).data;
    return [r, g, b] as [number, number, number];
  }, png.toString("base64"));
}

/** What every style load should end with: each icon drawn by its own resolver, and only the unowned one reported missing. */
async function expectIconsResolved(page: Page) {
  const state = await page.evaluate(() => {
    const { calls, missing, colors } = window.__missingImageResolvers;
    return {
      calls,
      missing: [...new Set(missing)],
      colors,
      hasImage: Object.fromEntries(["sdk-a", "user-b", "nobody-c"].map((id) => [id, window.__map.hasImage(id)])),
    };
  });

  // added resolvers go first, and the user's resolver isn't asked for an image they've already drawn
  expect(state.calls.sdk).toEqual(expect.arrayContaining(["sdk-a", "user-b", "nobody-c"]));
  expect(state.calls.user).toEqual(expect.arrayContaining(["user-b", "nobody-c"]));
  expect(state.calls.user).not.toContain("sdk-a");

  expect(state.missing).toEqual(["nobody-c"]);
  expect(state.hasImage).toEqual({ "sdk-a": true, "user-b": true, "nobody-c": false });

  for (const id of ["sdk-a", "user-b"]) {
    const actual = await colorAtIcon(page, id);
    state.colors[id].forEach((channel, i) => {
      expect(Math.abs(actual[i] - channel), `${id} channel ${String(i)} is ${String(actual[i])}, expected ${String(channel)}`).toBeLessThanOrEqual(COLOR_TOLERANCE);
    });
  }
}

async function loadFixture(page: Page) {
  await loadFixtureAndGetMapHandle({
    fixture: "missingImageResolvers",
    page,
    lazy: true,
  });

  expect(await page.title()).toBe("MapTiler E2E Missing Image Resolvers");
  await waitForStyleLoad(page, 1);
}

test("added and user resolvers draw their own icons on a real map", async ({ page }) => {
  await loadFixture(page);

  await expectIconsResolved(page);
});

test("resolvers still draw the icons after setStyle", async ({ page }) => {
  await loadFixture(page);

  await page.evaluate(() => {
    window.__missingImageResolvers.reset();
    window.__missingImageResolvers.swapStyle();
  });

  await waitForStyleLoad(page, 2);

  await expectIconsResolved(page);
});
