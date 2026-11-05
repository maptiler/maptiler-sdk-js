import { expect, test, type Page } from "@playwright/test";
import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";

// Largest per-channel difference from the circle colour still counted as that colour
const COLOR_TOLERANCE = 16;

const DATASET = {
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [0, 0] } }],
};

/** Waits until the map has gone idle after the layer's `load`th finished data load. */
async function waitForLoad(page: Page, load: number) {
  await page.waitForFunction((n) => window.__dataLayer.idleLoads === n, load);
}

/** The colour on screen at the centre of the layer's point. */
async function colorAtPoint(page: Page): Promise<[number, number, number]> {
  const point = await page.evaluate(() => {
    const { x, y } = window.__map.project(window.__dataLayer.point);
    const rect = window.__map.getCanvas().getBoundingClientRect();
    return { x: rect.left + x, y: rect.top + y };
  });

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

/** What every load should end with: one dataloading and one data, the source and sublayers in place beneath the controller, and the circle drawn. */
async function expectLayerLoaded(page: Page) {
  const state = await page.evaluate(() => {
    const { events, layerId, sourceId, circleColor, getSublayerIds } = window.__dataLayer;
    const order = window.__map.getLayersOrder();
    const sublayerIds = getSublayerIds();
    return {
      events: [...events],
      hasSource: Boolean(window.__map.getSource(sourceId)),
      sublayerIds,
      orderAroundController: order.slice(order.indexOf(layerId) - sublayerIds.length, order.indexOf(layerId) + 1),
      layerId,
      circleColor,
    };
  });

  expect(state.events).toEqual(["dataloading", "data"]);
  expect(state.hasSource).toBe(true);
  expect(state.sublayerIds.length).toBeGreaterThan(0);
  expect(state.orderAroundController).toEqual([...state.sublayerIds, state.layerId]);

  const actual = await colorAtPoint(page);
  state.circleColor.forEach((channel, i) => {
    expect(Math.abs(actual[i] - channel), `channel ${String(i)} is ${String(actual[i])}, expected ${String(channel)}`).toBeLessThanOrEqual(COLOR_TOLERANCE);
  });
}

async function loadFixture(page: Page) {
  const datasetRequests: string[] = [];

  // the layer's data is a dataset UUID, so it loads from the MapTiler Cloud dataset URL
  await page.route("https://api.maptiler.com/data/*/features.json*", async (route) => {
    datasetRequests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(DATASET) });
  });

  await loadFixtureAndGetMapHandle({
    fixture: "dataLayer",
    page,
    lazy: true,
  });

  expect(await page.title()).toBe("MapTiler E2E Data Layer");
  await waitForLoad(page, 1);

  return { datasetRequests };
}

test("loads a dataset UUID on a real map, reporting it to listeners attached after addLayer", async ({ page }) => {
  const { datasetRequests } = await loadFixture(page);

  const datasetId = await page.evaluate(() => window.__dataLayer.datasetId);
  expect(datasetRequests).toEqual([`https://api.maptiler.com/data/${datasetId}/features.json?key=DOESNT_MATTER`]);

  await expectLayerLoaded(page);
});

for (const kind of ["url", "object"] as const) {
  test(`rebuilds and reloads after setStyle with a style ${kind}`, async ({ page }) => {
    await loadFixture(page);

    await page.evaluate((kind) => {
      window.__dataLayer.reset();
      window.__dataLayer.swapStyle(kind);
    }, kind);

    await waitForLoad(page, 2);

    await expectLayerLoaded(page);
  });
}
