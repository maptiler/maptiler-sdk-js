import { expect, test, type Page } from "@playwright/test";
import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";
import { colorAtLngLat } from "./helpers/colorAtLngLat";
import type { ColorRamp as ColorRampClass, HeatmapLayer as HeatmapLayerClass, HeatmapLayerStyle } from "../../src/index";

// How a HeatmapLayer's opacity renders across zooms on a real map: a fixed opacity fades at the
// edges of the layer's zoom range, while a zoom-ramped one is drawn as given, as MapLibre can't
// nest one zoom interpolation in another (see resolveOpacity in heatmap-renderer.ts).
//
// Rather than compare screenshots, which differ by platform, each test reads the opacity off a
// pixel: the heatmap is a single saturated red point over a black background layer (which hides
// the mocked raster tiles), so the red channel at its centre is 255 × the opacity.

test.setTimeout(60000);

/** Where the heatmap's one point is, at the centre of the map. */
const POINT: [number, number] = [0, 0];

// Largest difference from the expected opacity still counted as it — rendering rounds and blends a little
const OPACITY_TOLERANCE = 0.08;

/** Loads the fixture in Mercator, with a black background layer over the mocked raster tiles. */
async function setupPage(page: Page) {
  const { mapHandle } = await loadFixtureAndGetMapHandle({ fixture: "dataLayers", page });
  expect(mapHandle).not.toBeNull();
  expect(await page.title()).toBe("MapTiler E2E Data Layers");

  await page.evaluate(async () => {
    const map = window.__map;
    map.setProjection({ type: "mercator" });
    map.addLayer({ id: "backdrop", type: "background", paint: { "background-color": "#000000" } });
    await new Promise((resolve) => map.once("idle", resolve));
  });
}

/**
 * Adds a heatmap of one point at {@link POINT}, saturated at its centre (a fixed radius and a high
 * intensity, so its density there is past `1` at every zoom) and coloured solid red, so only the
 * opacity changes what's drawn there.
 */
async function addHeatmap(page: Page, style: Partial<HeatmapLayerStyle>, range: { minzoom?: number; maxzoom?: number; fade?: number }) {
  await page.evaluate(
    async ({ point, style, range }) => {
      const map = window.__map;
      const HeatmapLayer = window.__pageObjects.HeatmapLayer as typeof HeatmapLayerClass;
      const ColorRamp = window.__pageObjects.ColorRamp as typeof ColorRampClass;

      const red = new ColorRamp({
        stops: [
          { value: 0, color: [255, 0, 0] },
          { value: 1, color: [255, 0, 0] },
        ],
      });
      const layer = new HeatmapLayer({
        id: "heatmap",
        data: { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: point } }] },
        style: { color: red, radius: 40, intensity: 10, weight: 1, ...style },
        ...range,
      });
      window.__pageObjects.heatmap = layer;
      map.addLayer(layer);
      await new Promise((resolve) => map.once("idle", resolve));
    },
    { point: POINT, style, range },
  );
}

/** The heatmap's opacity as drawn at `zoom`: its centre's red channel over the black background. */
async function opacityAtZoom(page: Page, zoom: number): Promise<number> {
  await page.evaluate(async (zoom) => {
    const map = window.__map;
    const idle = new Promise((resolve) => map.once("idle", resolve));
    map.jumpTo({ zoom });
    // jumping to the zoom the map is already at doesn't render, so there'd be no idle to wait for
    map.triggerRepaint();
    await idle;
  }, zoom);

  const [r, g, b] = await colorAtLngLat(page, POINT);
  // only red is ever drawn: any green or blue is the tiles showing through, and the reading is off
  expect(Math.max(g, b), `green and blue at zoom ${String(zoom)} are ${String(g)} and ${String(b)}`).toBeLessThanOrEqual(16);
  return r / 255;
}

async function expectOpacities(page: Page, expected: [zoom: number, opacity: number][]) {
  for (const [zoom, opacity] of expected) {
    const actual = await opacityAtZoom(page, zoom);
    expect(Math.abs(actual - opacity), `opacity at zoom ${String(zoom)} is ${actual.toFixed(2)}, expected ${String(opacity)}`).toBeLessThanOrEqual(OPACITY_TOLERANCE);
  }
}

test.describe("HeatmapLayer opacity", () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test("fades a fixed opacity in and out at the edges of its zoom range, and isn't drawn outside it", async ({ page }) => {
    // fades in over zooms 2–3 and out over 7–8
    await addHeatmap(page, { opacity: 1 }, { minzoom: 2, maxzoom: 8, fade: 1 });

    await expectOpacities(page, [
      [1.5, 0],
      [2.5, 0.5],
      [5, 1],
      [7.5, 0.5],
      [9, 0],
    ]);
  });

  test("draws a zoom-ramped opacity as given, without the zoom range's fade", async ({ page }) => {
    await addHeatmap(
      page,
      {
        opacity: [
          { zoom: 2, value: 0.2 },
          { zoom: 8, value: 1 },
        ],
      },
      { minzoom: 1, maxzoom: 10, fade: 1 },
    );

    await expectOpacities(page, [
      [2, 0.2],
      [5, 0.6],
      [8, 1],
      // inside the fade out's span, but the ramp is drawn as given: past its last stop, it stays at 1
      [9.5, 1],
    ]);
  });

  test("redraws a new opacity set with setStyle", async ({ page }) => {
    await addHeatmap(page, { opacity: 1 }, {});
    await expectOpacities(page, [[5, 1]]);

    await page.evaluate(() => {
      (window.__pageObjects.heatmap as HeatmapLayerClass).setStyle({
        opacity: [
          { zoom: 0, value: 0.25 },
          { zoom: 10, value: 0.75 },
        ],
      });
    });

    await expectOpacities(page, [
      [5, 0.5],
      [10, 0.75],
    ]);
  });
});
