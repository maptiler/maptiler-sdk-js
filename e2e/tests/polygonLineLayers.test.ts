import { expect, test, type Page } from "@playwright/test";
import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";
import type { LineLayer as LineLayerClass, LineLayerConstructorOptions, LineLayerStyle, PolygonLayer as PolygonLayerClass, PolygonLayerConstructorOptions } from "../../src/index";

// How PolygonLayers and LineLayers draw on a real map: fills, outlines and their positions,
// dashes, glows, expressions, zoom ramps, GPX content and restyling, compared against snapshots.
//
// Every test draws over a black background layer, which hides the mocked raster tiles, in
// Mercator at a fixed view, and screenshots the map's canvas only, leaving out its controls.

test.setTimeout(60000);

/** The view every test draws at: about 28° of longitude across and 16° of latitude down. */
const CENTER: [number, number] = [0, 0];
const ZOOM = 5;

type Position = [number, number];

/** A square polygon `size` degrees wide, centred on `center`. */
function square(center: Position, size: number, properties: Record<string, unknown> = {}) {
  const [x, y] = center;
  const h = size / 2;
  return {
    type: "Feature" as const,
    properties,
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [x - h, y - h],
          [x + h, y - h],
          [x + h, y + h],
          [x - h, y + h],
          [x - h, y - h],
        ],
      ],
    },
  };
}

/** A line through `coordinates`. */
function line(coordinates: Position[], properties: Record<string, unknown> = {}) {
  return { type: "Feature" as const, properties, geometry: { type: "LineString" as const, coordinates } };
}

function collection(features: ReturnType<typeof square | typeof line>[]) {
  return { type: "FeatureCollection" as const, features };
}

/** A straight line across the view at latitude `y`. */
function horizontal(y: number, properties: Record<string, unknown> = {}) {
  return line(
    [
      [-10, y],
      [10, y],
    ],
    properties,
  );
}

/** A zigzag across the view at latitude `y`, so joins and caps show. */
function zigzag(y: number): Position[] {
  return [
    [-10, y],
    [-5, y + 3],
    [0, y - 1],
    [5, y + 3],
    [10, y],
  ];
}

/** Loads the fixture in Mercator at the fixed view, with a black background layer over the mocked raster tiles. */
async function setupPage(page: Page) {
  const { mapHandle } = await loadFixtureAndGetMapHandle({ fixture: "dataLayers", page });
  expect(mapHandle).not.toBeNull();
  expect(await page.title()).toBe("MapTiler E2E Data Layers");

  await page.evaluate(
    async ({ center, zoom }) => {
      const map = window.__map;
      map.setProjection({ type: "mercator" });
      map.jumpTo({ center, zoom });
      map.addLayer({ id: "backdrop", type: "background", paint: { "background-color": "#000000" } });
      await new Promise((resolve) => map.once("idle", resolve));
    },
    { center: CENTER, zoom: ZOOM },
  );
}

/** Adds a `PolygonLayer` or `LineLayer` per options in the page, in order, kept by id in `window.__pageObjects`, then waits for the map to settle. */
async function addLayers(page: Page, layers: ({ kind: "polygon"; options: PolygonLayerConstructorOptions } | { kind: "line"; options: LineLayerConstructorOptions })[]) {
  await page.evaluate(async (layers) => {
    const map = window.__map;
    const PolygonLayer = window.__pageObjects.PolygonLayer as typeof PolygonLayerClass;
    const LineLayer = window.__pageObjects.LineLayer as typeof LineLayerClass;

    for (const { kind, options } of layers) {
      const layer = kind === "polygon" ? new PolygonLayer(options as PolygonLayerConstructorOptions) : new LineLayer(options as LineLayerConstructorOptions);
      window.__pageObjects[layer.id] = layer;
      map.addLayer(layer);
    }
    await new Promise((resolve) => map.once("idle", resolve));
  }, layers);
}

async function expectSnapshot(page: Page, name: string) {
  await expect(page.locator("canvas.maplibregl-canvas")).toHaveScreenshot(`${name}.png`, { timeout: 10000 });
}

test.describe("PolygonLayer", () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test("fills overlapping polygons with a translucent colour and a centred outline", async ({ page }) => {
    await addLayers(page, [
      {
        kind: "polygon",
        options: {
          id: "polygons",
          data: collection([square([-3, 1], 10), square([3, -1], 10)]),
          style: { color: "#3366ff", opacity: 0.6, outline: { color: "#ffffff", width: 2 } },
        },
      },
    ]);

    await expectSnapshot(page, "polygon-fill-outline");
  });

  test("sits the outline inside, centred on, or outside the edge", async ({ page }) => {
    const outline = { color: "#ffffff", width: 8 };
    await addLayers(page, [
      { kind: "polygon", options: { id: "inside", data: square([-8, 0], 6), style: { color: "#ff0000", outline: { ...outline, position: "inside" } } } },
      { kind: "polygon", options: { id: "center", data: square([0, 0], 6), style: { color: "#ff0000", outline: { ...outline, position: "center" } } } },
      { kind: "polygon", options: { id: "outside", data: square([8, 0], 6), style: { color: "#ff0000", outline: { ...outline, position: "outside" } } } },
    ]);

    await expectSnapshot(page, "polygon-outline-positions");
  });

  test("dashes the outline", async ({ page }) => {
    await addLayers(page, [
      {
        kind: "polygon",
        options: { id: "polygons", data: square([0, 0], 10), style: { color: "#224488", outline: { color: "#ffcc00", width: 3, dash: true } } },
      },
    ]);

    await expectSnapshot(page, "polygon-outline-dashed");
  });

  test("draws a glow beneath the fill, showing outside the polygons", async ({ page }) => {
    await addLayers(page, [
      {
        kind: "polygon",
        options: { id: "polygons", data: collection([square([-5, 0], 6), square([5, 0], 6)]), style: { color: "#22aa55", glow: { width: 20 } } },
      },
    ]);

    await expectSnapshot(page, "polygon-glow");
  });

  test("colours and fades each polygon by expressions reading its properties", async ({ page }) => {
    await addLayers(page, [
      {
        kind: "polygon",
        options: {
          id: "polygons",
          data: collection([square([-8, 0], 6, { kind: "park", alpha: 1 }), square([0, 0], 6, { kind: "water", alpha: 0.6 }), square([8, 0], 6, { kind: "other", alpha: 0.3 })]),
          style: {
            color: ["match", ["get", "kind"], "park", "#2ecc71", "water", "#3498db", "#e74c3c"],
            opacity: ["get", "alpha"],
          },
        },
      },
    ]);

    await expectSnapshot(page, "polygon-expressions");
  });
});

test.describe("LineLayer", () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test("draws lines with a width, round caps and round joins by default", async ({ page }) => {
    await addLayers(page, [{ kind: "line", options: { id: "lines", data: line(zigzag(-1)), style: { color: "#33ccff", width: 12 } } }]);

    await expectSnapshot(page, "line-default");
  });

  test("dashes lines with each dash shorthand", async ({ page }) => {
    const style: LineLayerStyle = { color: "#ffffff", width: 4 };
    await addLayers(page, [
      { kind: "line", options: { id: "dashed", data: horizontal(4), style: { ...style, dash: true } } },
      { kind: "line", options: { id: "dotted", data: horizontal(0), style: { ...style, dash: "dotted" } } },
      { kind: "line", options: { id: "underscores", data: horizontal(-4), style: { ...style, dash: "___ _ ", cap: "butt" } } },
    ]);

    await expectSnapshot(page, "line-dashes");
  });

  test("draws an outline beneath the lines and a glow beneath both", async ({ page }) => {
    await addLayers(page, [
      {
        kind: "line",
        options: {
          id: "lines",
          data: line(zigzag(-1)),
          style: { color: "#ff6600", width: 6, outline: { color: "#ffffff", width: 2 }, glow: { color: "#ff00ff", width: 12 } },
        },
      },
    ]);

    await expectSnapshot(page, "line-outline-glow");
  });

  test("keeps the outline solid under dashes", async ({ page }) => {
    await addLayers(page, [
      {
        kind: "line",
        options: { id: "lines", data: line(zigzag(-1)), style: { color: "#ffcc00", width: 6, dash: true, outline: { color: "#3366ff", width: 3 } } },
      },
    ]);

    await expectSnapshot(page, "line-dashed-outline");
  });

  test("sizes and colours each line by expressions reading its properties", async ({ page }) => {
    await addLayers(page, [
      {
        kind: "line",
        options: {
          id: "lines",
          data: collection([horizontal(5, { kind: "motorway", w: 14 }), horizontal(0, { kind: "primary", w: 8 }), horizontal(-5, { kind: "other", w: 3 })]),
          style: {
            color: ["match", ["get", "kind"], "motorway", "#e74c3c", "primary", "#f1c40f", "#ecf0f1"],
            width: ["get", "w"],
            glow: { width: 6 },
          },
        },
      },
    ]);

    await expectSnapshot(page, "line-expressions");
  });

  test("glows around a zoom-ramped width", async ({ page }) => {
    await addLayers(page, [
      {
        kind: "line",
        options: {
          id: "lines",
          data: line(zigzag(-1)),
          // 11px wide at the test's zoom 5
          style: {
            color: "#33ccff",
            width: [
              { zoom: 0, value: 2 },
              { zoom: 10, value: 20 },
            ],
            glow: { color: "#ffffff", width: 8 },
          },
        },
      },
    ]);

    await expectSnapshot(page, "line-zoom-width-glow");
  });

  test("draws the edges of polygons as lines", async ({ page }) => {
    await addLayers(page, [{ kind: "line", options: { id: "lines", data: collection([square([-5, 0], 8), square([5, 0], 8)]), style: { color: "#2ecc71", width: 4 } } }]);

    await expectSnapshot(page, "line-polygon-edges");
  });

  test("draws GPX content", async ({ page }) => {
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="e2e" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Track</name>
    <trkseg>
      <trkpt lat="-4" lon="-10"></trkpt>
      <trkpt lat="3" lon="-6"></trkpt>
      <trkpt lat="-2" lon="0"></trkpt>
      <trkpt lat="4" lon="6"></trkpt>
      <trkpt lat="-3" lon="10"></trkpt>
    </trkseg>
  </trk>
</gpx>`;
    await addLayers(page, [{ kind: "line", options: { id: "track", data: gpx, style: { color: "#ff3366", width: 5, outline: { color: "#ffffff" } } } }]);

    await expectSnapshot(page, "line-gpx");
  });

  test("redraws a new style set with setStyle", async ({ page }) => {
    await addLayers(page, [{ kind: "line", options: { id: "lines", data: line(zigzag(-1)), style: { color: "#33ccff", width: 4 } } }]);

    await page.evaluate(async () => {
      const map = window.__map;
      const idle = new Promise((resolve) => map.once("idle", resolve));
      (window.__pageObjects.lines as LineLayerClass).setStyle({ color: "#ff6600", width: 10, dash: "dotted", glow: true });
      await idle;
    });

    await expectSnapshot(page, "line-set-style");
  });
});
