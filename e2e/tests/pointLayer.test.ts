import { expect, test, type Page } from "@playwright/test";
import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";
import type { PointLayer as PointLayerClass } from "../../src/index";

test.setTimeout(60000);

/** Loads the fixture and collects MapLibre's missing-image warnings. */
async function setupPage(page: Page) {
  const missingImageWarnings: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "warning" && /could not be loaded|Image .* missing/i.test(msg.text())) missingImageWarnings.push(msg.text());
  });

  const { mapHandle } = await loadFixtureAndGetMapHandle({ fixture: "pointLayer", page });
  expect(mapHandle).not.toBeNull();
  expect(await page.title()).toBe("MapTiler E2E Point Layer");

  return { missingImageWarnings };
}

test.describe("PointLayer", () => {
  test("circles mode renders every point", async ({ page }) => {
    await setupPage(page);

    const rendered = await page.evaluate(async () => {
      const map = window.__map;
      const features = Array.from({ length: 25 }, (_, i) => ({
        type: "Feature" as const,
        properties: { i },
        geometry: { type: "Point" as const, coordinates: [(i % 5) * 6 - 12, Math.floor(i / 5) * 6 - 12] },
      }));
      const layer = new (window.__pageObjects.PointLayer as typeof PointLayerClass)({ data: { type: "FeatureCollection", features }, styling: { pointColor: "#e63946" } });
      map.addLayer(layer);
      await new Promise((resolve) => map.once("idle", resolve));

      const ids = new Set(map.queryRenderedFeatures({ layers: layer.getSublayerIds() }).map((f) => f.properties.i as number));
      return ids.size;
    });

    expect(rendered).toBe(25);
  });

  test("markers mode draws one image per label and renders every marker, at every zoom", async ({ page }) => {
    const { missingImageWarnings } = await setupPage(page);

    const results = await page.evaluate(async () => {
      const map = window.__map;
      const features = Array.from({ length: 25 }, (_, i) => ({
        type: "Feature" as const,
        // a few labels repeat, so they share an image
        properties: { i, label: String(i % 10) },
        geometry: { type: "Point" as const, coordinates: [(i % 5) * 6 - 12, Math.floor(i / 5) * 6 - 12] },
      }));
      const layer = new (window.__pageObjects.PointLayer as typeof PointLayerClass)({
        mode: "markers",
        data: { type: "FeatureCollection", features },
        styling: { marker: { shape: "square", size: "m" }, label: "label" },
      });
      map.addLayer(layer);

      const out: { zoom: number; rendered: number; images: number }[] = [];
      // zooming across integer zooms loads new tiles, each needing its images before it renders
      for (const zoom of [3, 3.9, 4.1, 2.5]) {
        map.jumpTo({ zoom });
        await new Promise((resolve) => map.once("idle", resolve));
        const rendered = new Set(map.queryRenderedFeatures({ layers: layer.getSublayerIds() }).map((f) => f.properties.i as number)).size;
        const images = map.listImages().filter((id) => id.startsWith(`${layer.id}-marker-`)).length;
        out.push({ zoom, rendered, images });
      }
      return out;
    });

    for (const { rendered, images } of results) {
      expect(rendered).toBe(25);
      // ten distinct labels, ten images
      expect(images).toBe(10);
    }
    expect(missingImageWarnings).toEqual([]);
  });

  test("fires one dataloading and one data event per setData", async ({ page }) => {
    await setupPage(page);

    const events = await page.evaluate(async () => {
      const map = window.__map;
      const randomPoints = (count: number) => ({
        type: "FeatureCollection" as const,
        features: Array.from({ length: count }, (_, i) => ({
          type: "Feature" as const,
          properties: { i },
          geometry: { type: "Point" as const, coordinates: [Math.random() * 60 - 30, Math.random() * 40 - 20] },
        })),
      });

      const layer = new (window.__pageObjects.PointLayer as typeof PointLayerClass)({ data: randomPoints(200) });
      const log: string[] = [];
      layer.on("dataloading", () => log.push("dataloading"));
      layer.on("data", () => log.push("data"));

      const settle = () => new Promise((resolve) => map.once("idle", resolve));
      const step = async (name: string, action: () => void) => {
        log.push(name);
        action();
        await settle();
      };

      await step("add", () => map.addLayer(layer));
      await step("setData", () => layer.setData(randomPoints(200)));
      await step("burst", () => {
        for (let i = 0; i < 50; i++) layer.setData(randomPoints(50 + i));
      });
      await step("pan", () => map.jumpTo({ center: [20, 10], zoom: 4 }));
      return log;
    });

    expect(events).toEqual(["add", "dataloading", "data", "setData", "dataloading", "data", "burst", "dataloading", "data", "pan"]);
  });

  test("keeps its place in the layer order through a diffed setStyle", async ({ page }) => {
    await setupPage(page);

    const orders = await page.evaluate(async () => {
      const map = window.__map;
      const style = (layerIds: string[]) => ({
        version: 8 as const,
        sources: {},
        layers: layerIds.map((id) => ({ id, type: "background" as const, paint: { "background-opacity": id === "bottom" ? 1 : 0 } })),
      });
      const settle = () => new Promise((resolve) => map.once("idle", resolve));
      const describeOrder = (layerId: string) =>
        map
          .getLayersOrder()
          .map((id) => (id === layerId ? "LAYER" : id.startsWith(layerId) ? "sublayer" : id))
          .join(",");

      map.setStyle(style(["bottom", "labels", "top"]), { diff: false });
      await settle();

      const layer = new (window.__pageObjects.PointLayer as typeof PointLayerClass)({ data: { type: "FeatureCollection", features: [] } });
      map.addLayer(layer, "labels");
      await settle();
      const before = describeOrder(layer.id);

      map.setStyle(style(["bottom", "fill-a", "fill-b", "labels", "top"]));
      await settle();
      const afterDiff = describeOrder(layer.id);

      map.setStyle(style(["bottom", "other"]));
      await settle();
      const afterDiffWithoutLabels = describeOrder(layer.id);

      return { before, afterDiff, afterDiffWithoutLabels };
    });

    expect(orders.before).toBe("bottom,sublayer,LAYER,labels,top");
    expect(orders.afterDiff).toBe("bottom,fill-a,fill-b,sublayer,LAYER,labels,top");
    expect(orders.afterDiffWithoutLabels).toBe("bottom,other,sublayer,LAYER");
  });

  test.describe("markers collision", () => {
    /**
     * Sixteen pairs of near-coincident points (about 6px apart at zoom 3), the
     * pairs about 90px apart. Within each pair one point has the higher `mag`,
     * and which comes first in the data alternates, so data order can't win.
     */
    async function addPairs(page: Page, collisionBehaviour: string) {
      return page.evaluate(async (behaviour) => {
        const map = window.__map;
        const features = [];
        for (let i = 0; i < 16; i++) {
          const [lng, lat] = [(i % 4) * 8 - 12, Math.floor(i / 4) * 8 - 12];
          const winner = {
            type: "Feature" as const,
            properties: { id: `${String(i)}-high`, mag: 5 + i / 10 },
            geometry: { type: "Point" as const, coordinates: [lng + 0.5, lat] },
          };
          const loser = { type: "Feature" as const, properties: { id: `${String(i)}-low`, mag: 1 + i / 10 }, geometry: { type: "Point" as const, coordinates: [lng, lat] } };
          features.push(...(i % 2 === 0 ? [loser, winner] : [winner, loser]));
        }
        const layer = new (window.__pageObjects.PointLayer as typeof PointLayerClass)({
          mode: "markers",
          data: { type: "FeatureCollection", features },
          collisionBehaviour: behaviour as never,
          styling: { marker: { shape: "square", size: "m" }, priority: ["get", "mag"] },
        });
        map.addLayer(layer);
        await new Promise((resolve) => map.once("idle", resolve));

        const rendered = (sublayer: string) => map.queryRenderedFeatures({ layers: [`${layer.id}-${sublayer}`] }).map((f) => f.properties);
        return {
          markers: [...new Set(rendered("marker").map((p) => p.id as string))].sort(),
          dots: map.getLayer(`${layer.id}-dot`) ? new Set(rendered("dot").map((p) => p.id as string)).size : 0,
          clusterCounts: map.getLayer(`${layer.id}-cluster`) ? rendered("cluster").map((p) => p.point_count as number) : [],
        };
      }, collisionBehaviour);
    }

    const winners = Array.from({ length: 16 }, (_, i) => `${String(i)}-high`).sort();

    test("hide-by-priority shows the higher-priority marker of each overlapping pair", async ({ page }) => {
      await setupPage(page);
      const { markers } = await addPairs(page, "hide-by-priority");
      expect(markers).toEqual(winners);
    });

    test("minimize-by-priority shows the winners and leaves a dot for every point", async ({ page }) => {
      await setupPage(page);
      const { markers, dots } = await addPairs(page, "minimize-by-priority");
      expect(markers).toEqual(winners);
      expect(dots).toBe(32);
    });

    test("cluster groups each pair into one cluster of two", async ({ page }) => {
      await setupPage(page);
      const { markers, clusterCounts } = await addPairs(page, "cluster");
      expect(markers).toEqual([]);
      expect(clusterCounts).toEqual(Array.from({ length: 16 }, () => 2));
    });

    test("collides markers by their body, not their shadow margin", async ({ page }) => {
      await setupPage(page);

      const shown = await page.evaluate(async () => {
        const map = window.__map;
        // at zoom 3 on the equator, 1px is 360 / (512 × 2³) degrees
        const degreesPerPixel = 360 / (512 * 8);
        const pair = (gapPx: number, lat: number) =>
          [0, gapPx * degreesPerPixel].map((dLng, i) => ({
            type: "Feature" as const,
            properties: { id: `${String(gapPx)}-${String(i)}` },
            geometry: { type: "Point" as const, coordinates: [dLng, lat] },
          }));
        const layer = new (window.__pageObjects.PointLayer as typeof PointLayerClass)({
          mode: "markers",
          // medium markers are 32px: 36px apart they clear each other, 28px apart they don't
          data: { type: "FeatureCollection", features: [...pair(36, 5), ...pair(28, -5)] },
          collisionBehaviour: "hide-by-priority",
          styling: { marker: { shape: "square", size: "m" } },
        });
        map.addLayer(layer);
        await new Promise((resolve) => map.once("idle", resolve));
        return [...new Set(map.queryRenderedFeatures({ layers: layer.getSublayerIds() }).map((f) => f.properties.id as string))].sort();
      });

      expect(shown.filter((id) => id.startsWith("36-"))).toEqual(["36-0", "36-1"]);
      expect(shown.filter((id) => id.startsWith("28-"))).toHaveLength(1);
    });
  });
});
