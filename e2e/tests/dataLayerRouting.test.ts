import { expect, test, type Page } from "@playwright/test";
import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";
import { colorAtLngLat, colorDistance, type Rgb } from "./helpers/colorAtLngLat";
import type { PointLayer as PointLayerClass } from "../../src/index";

// The SDK map routes addLayer / moveLayer through the data layer registry (see Map.ts and
// data-layers/registry.ts): a data layer draws through sublayers beneath its controller, so
// "before a data layer" means before its bottom sublayer, and moving one moves its sublayers too.
// The unit tests check this against a mock map. These check it on a real one: both the style's
// layer order and what's drawn on top on screen.

test.setTimeout(60000);

// Largest per-channel difference from an expected colour still counted as that colour
const COLOR_TOLERANCE = 16;

const RED: Rgb = [255, 0, 0];
const BLUE: Rgb = [0, 0, 255];

/** Where every layer in these tests draws its point, at the centre of the map. */
const POINT: [number, number] = [0, 0];

/** Loads the fixture in Mercator, as on the mock style's globe a point's screen position and draw order are less predictable. */
async function setupPage(page: Page) {
  const { mapHandle } = await loadFixtureAndGetMapHandle({ fixture: "dataLayers", page });
  expect(mapHandle).not.toBeNull();
  expect(await page.title()).toBe("MapTiler E2E Data Layers");

  await page.evaluate(async () => {
    window.__map.setProjection({ type: "mercator" });
    await new Promise((resolve) => window.__map.once("idle", resolve));
  });
}

/**
 * Adds, in the page: a red `PointLayer` with id `points` (kept as `window.__pageObjects.points`),
 * then a bigger plain blue circle layer `plain`, before `plainBeforeId` if given, else on top.
 * Both draw one point at {@link POINT}, so whichever is on top shows at its centre.
 */
async function addLayers(page: Page, { plainBeforeId }: { plainBeforeId?: string } = {}) {
  await page.evaluate(
    async ({ point, plainBeforeId }) => {
      const map = window.__map;
      const PointLayer = window.__pageObjects.PointLayer as typeof PointLayerClass;
      const data = { type: "FeatureCollection" as const, features: [{ type: "Feature" as const, properties: {}, geometry: { type: "Point" as const, coordinates: point } }] };

      const points = new PointLayer({ id: "points", data, style: { color: "#ff0000", radius: 15 } });
      window.__pageObjects.points = points;
      map.addLayer(points);
      map.addSource("plain", { type: "geojson", data });
      map.addLayer({ id: "plain", type: "circle", source: "plain", paint: { "circle-color": "#0000ff", "circle-radius": 30 } }, plainBeforeId);

      await new Promise((resolve) => map.once("idle", resolve));
    },
    { point: POINT, plainBeforeId },
  );
}

/** The style's layer order, and the ids of `points`' sublayers. */
async function getOrder(page: Page) {
  return page.evaluate(() => ({
    order: window.__map.getLayersOrder(),
    sublayerIds: (window.__pageObjects.points as PointLayerClass).getSublayerIds(),
  }));
}

/** `points`' sublayers then its controller, as they must sit: together, in this order. */
function pointsBlock(sublayerIds: string[]) {
  return [...sublayerIds, "points"];
}

/** Ids from `order` from `first` on, as many as `block` — to compare with a block expected to start at `first`. */
function sliceFrom(order: string[], first: string, length: number) {
  const start = order.indexOf(first);
  return start === -1 ? [] : order.slice(start, start + length);
}

async function expectColorAtPoint(page: Page, expected: Rgb) {
  const actual = await colorAtLngLat(page, POINT);
  expect(colorDistance(actual, expected), `colour at the point is ${actual.join(",")}, expected ${expected.join(",")}`).toBeLessThanOrEqual(COLOR_TOLERANCE);
}

test.describe("Data layer routing on a real map", () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test("addLayer before a data layer puts the new layer beneath all of its sublayers", async ({ page }) => {
    await addLayers(page, { plainBeforeId: "points" });

    const { order, sublayerIds } = await getOrder(page);
    expect(sublayerIds.length).toBeGreaterThan(0);
    // `plain` straight beneath the bottom sublayer, not between the sublayers and their controller
    expect(sliceFrom(order, "plain", sublayerIds.length + 2)).toEqual(["plain", ...pointsBlock(sublayerIds)]);

    await expectColorAtPoint(page, RED);
  });

  test("moveLayer moves a data layer together with its sublayers, and fires move once", async ({ page }) => {
    await addLayers(page);
    // `plain` added last, on top
    await expectColorAtPoint(page, BLUE);

    const moves = await page.evaluate(async () => {
      const map = window.__map;
      const layer = window.__pageObjects.points as PointLayerClass;
      const beforeIds: (string | undefined)[] = [];
      layer.on("move", (e) => beforeIds.push(e.beforeId));

      map.moveLayer("points");
      await new Promise((resolve) => map.once("idle", resolve));
      return beforeIds;
    });

    const { order, sublayerIds } = await getOrder(page);
    // on top, sublayers and controller together
    expect(order.slice(-sublayerIds.length - 1)).toEqual(pointsBlock(sublayerIds));
    expect(moves).toEqual([undefined]);
    await expectColorAtPoint(page, RED);
  });

  test("moveLayer of a data layer before another layer puts its sublayers beneath that layer too", async ({ page }) => {
    await addLayers(page, { plainBeforeId: "points" });
    await expectColorAtPoint(page, RED);

    await page.evaluate(async () => {
      window.__map.moveLayer("points", "plain");
      await new Promise((resolve) => window.__map.once("idle", resolve));
    });

    const { order, sublayerIds } = await getOrder(page);
    expect(sliceFrom(order, sublayerIds[0], sublayerIds.length + 2)).toEqual([...pointsBlock(sublayerIds), "plain"]);
    await expectColorAtPoint(page, BLUE);
  });

  test("moveLayer of another layer before a data layer puts it beneath the data layer's sublayers", async ({ page }) => {
    await addLayers(page);
    await expectColorAtPoint(page, BLUE);

    await page.evaluate(async () => {
      window.__map.moveLayer("plain", "points");
      await new Promise((resolve) => window.__map.once("idle", resolve));
    });

    const { order, sublayerIds } = await getOrder(page);
    expect(sliceFrom(order, "plain", sublayerIds.length + 2)).toEqual(["plain", ...pointsBlock(sublayerIds)]);
    await expectColorAtPoint(page, RED);
  });

  test("addLayer of a data layer before another data layer puts all of it beneath all of the other", async ({ page }) => {
    const { order, below, above } = await page.evaluate(async (point) => {
      const map = window.__map;
      const PointLayer = window.__pageObjects.PointLayer as typeof PointLayerClass;
      const data = { type: "FeatureCollection" as const, features: [{ type: "Feature" as const, properties: {}, geometry: { type: "Point" as const, coordinates: point } }] };

      const above = new PointLayer({ id: "above", data, style: { color: "#ff0000", radius: 15 } });
      const below = new PointLayer({ id: "below", data, style: { color: "#0000ff", radius: 30 } });
      map.addLayer(above);
      map.addLayer(below, "above");
      await new Promise((resolve) => map.once("idle", resolve));

      return { order: map.getLayersOrder(), below: [...below.getSublayerIds(), "below"], above: [...above.getSublayerIds(), "above"] };
    }, POINT);

    expect(sliceFrom(order, below[0], below.length + above.length)).toEqual([...below, ...above]);
    await expectColorAtPoint(page, RED);
  });
});
