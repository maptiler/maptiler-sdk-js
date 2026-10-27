import { expect, test, type Page } from "@playwright/test";
import loadImageViewerFixture from "./helpers/loadImageViewerFixture";
import type { ImageViewerMarker as ImageViewerMarkerClass } from "../../src";

// The mocked image is 4096 x 2048 px, see mocks/image-viewer-metadata.json.
// Its size is a multiple of the tile size, so every tile is fully covered by the opaque mock tile,
// whereas the API serves transparent padding around images of other sizes
const IMAGE_SIZE: [number, number] = [4096, 2048];
const IMAGE_CENTER: [number, number] = [2048, 1024];

// One screen pixel covers a few image pixels when the image is fitted to the viewport
const PX_TOLERANCE = 10;

function expectPxCloseTo(actual: number[], expected: number[], tolerance = PX_TOLERANCE) {
  expect(Math.abs(actual[0] - expected[0])).toBeLessThan(tolerance);
  expect(Math.abs(actual[1] - expected[1])).toBeLessThan(tolerance);
}

// Registers the listener in the page before the test triggers the event, and returns a function awaiting it
async function waitForViewerEvent(page: Page, type: "click" | "moveend") {
  await page.evaluate((type) => {
    window.__pageObjects = {
      ...window.__pageObjects,
      [`next-${type}`]: window.__imageViewer.once(type).then((e) => ({ imageX: e.imageX, imageY: e.imageY, isOutOfBounds: e.isOutOfBounds })),
    };
  }, type);

  return () => page.evaluate((type) => window.__pageObjects[`next-${type}`] as Promise<{ imageX: number; imageY: number; isOutOfBounds: boolean }>, type);
}

async function getElementCenter(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`${selector} not found`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

function getCanvasCenter(page: Page) {
  return getElementCenter(page, "#map canvas");
}

test.setTimeout(30000);

//#region Loading
test.describe("Loading", () => {
  test("renders the image fitted to the viewport", async ({ page }) => {
    await loadImageViewerFixture({ page });
    expect(await page.title()).toBe("MapTiler E2E Image Viewer");

    await page.evaluate(() => window.createImageViewer());

    const center = await page.evaluate(() => window.__imageViewer.getCenter());
    expectPxCloseTo(center, IMAGE_CENTER, 1);

    await expect(page).toHaveScreenshot("imageViewer-fitted.png");
  });

  test("applies the initial center, zoom and bearing", async ({ page }) => {
    await loadImageViewerFixture({ page });

    await page.evaluate(() => window.createImageViewer({ center: [750, 500], zoom: 2, bearing: 30 }));

    const { center, zoom, bearing } = await page.evaluate(() => ({
      center: window.__imageViewer.getCenter(),
      zoom: window.__imageViewer.getZoom(),
      bearing: window.__imageViewer.getBearing(),
    }));

    expectPxCloseTo(center, [750, 500], 1);
    expect(zoom).toBeCloseTo(2);
    expect(bearing).toBeCloseTo(30);

    await expect(page).toHaveScreenshot("imageViewer-initial-camera.png");
  });
});

//#region Controls
test.describe("Controls", () => {
  test("the fit to bounds control restores the fitted view", async ({ page }) => {
    await loadImageViewerFixture({ page });
    await page.evaluate(() => window.createImageViewer());

    const fittedZoom = await page.evaluate(() => window.__imageViewer.getZoom());

    await page.evaluate(async () => {
      window.__imageViewer.jumpTo({ center: [300, 300], zoom: 3 });
      await window.waitForImageViewerIdle();
    });

    const moveEnd = await waitForViewerEvent(page, "moveend");
    await page.locator(".maplibregl-ctrl-fit-image-to-bounds").click();
    await moveEnd();

    const { center, zoom } = await page.evaluate(() => ({
      center: window.__imageViewer.getCenter(),
      zoom: window.__imageViewer.getZoom(),
    }));

    expectPxCloseTo(center, IMAGE_CENTER, 1);
    expect(zoom).toBeCloseTo(fittedZoom);
  });
});

//#region Camera
test.describe("Camera", () => {
  test("setCenter, getCenter and jumpTo use image pixels", async ({ page }) => {
    await loadImageViewerFixture({ page });
    await page.evaluate(() => window.createImageViewer());

    const afterSetCenter = await page.evaluate(() => window.__imageViewer.setCenter([100, 200]).getCenter());
    expectPxCloseTo(afterSetCenter, [100, 200], 1);

    const afterJumpTo = await page.evaluate(() => {
      const viewer = window.__imageViewer;
      viewer.jumpTo({ center: [2900, 1900], zoom: 1.5 });
      return { center: viewer.getCenter(), zoom: viewer.getZoom() };
    });
    expectPxCloseTo(afterJumpTo.center, [2900, 1900], 1);
    expect(afterJumpTo.zoom).toBeCloseTo(1.5);
  });

  test("getImageBounds covers the bounds passed to fitImageBounds", async ({ page }) => {
    await loadImageViewerFixture({ page });
    await page.evaluate(() => window.createImageViewer());

    const [tl, br] = await page.evaluate(async () => {
      const viewer = window.__imageViewer;
      viewer.fitImageBounds([
        [500, 500],
        [1500, 1000],
      ]);
      await viewer.once("moveend");
      return viewer.getImageBounds();
    });

    // the bounds are wider than the viewport, so they fit horizontally
    expectPxCloseTo([tl[0], br[0]], [500, 1500], 1);
    expect(tl[1]).toBeLessThan(500);
    expect(br[1]).toBeGreaterThan(1000);
  });

  test("keeps the image fitted when the viewport is resized", async ({ page }) => {
    await loadImageViewerFixture({ page });
    await page.evaluate(() => window.createImageViewer());

    const zoomBefore = await page.evaluate(() => window.__imageViewer.getZoom());

    await page.setViewportSize({ width: 640, height: 480 });
    await page.evaluate(() => window.waitForImageViewerIdle());

    const { center, zoom, bounds } = await page.evaluate(() => ({
      center: window.__imageViewer.getCenter(),
      zoom: window.__imageViewer.getZoom(),
      bounds: window.__imageViewer.getImageBounds(),
    }));

    expect(zoom).toBeLessThan(zoomBefore);
    expectPxCloseTo(center, IMAGE_CENTER, 1);
    // the whole image is still visible
    expect(bounds[0][0]).toBeLessThanOrEqual(0);
    expect(bounds[0][1]).toBeLessThanOrEqual(0);
    expect(bounds[1][0]).toBeGreaterThanOrEqual(IMAGE_SIZE[0]);
    expect(bounds[1][1]).toBeGreaterThanOrEqual(IMAGE_SIZE[1]);
  });

  test("stops fitting the image on resize once the user has dragged it", async ({ page }) => {
    await loadImageViewerFixture({ page });
    await page.evaluate(() => window.createImageViewer());

    const { x, y } = await getCanvasCenter(page);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 100, y + 50, { steps: 5 });
    await page.mouse.up();

    const zoomBefore = await page.evaluate(() => window.__imageViewer.getZoom());

    await page.setViewportSize({ width: 640, height: 480 });
    await page.evaluate(() => window.waitForImageViewerIdle());

    const zoomAfter = await page.evaluate(() => window.__imageViewer.getZoom());
    expect(zoomAfter).toBeCloseTo(zoomBefore);
  });
});

//#region Events
test.describe("Events", () => {
  test("UI events carry image pixel coordinates", async ({ page }) => {
    await loadImageViewerFixture({ page });
    await page.evaluate(() => window.createImageViewer());

    const { x, y } = await getCanvasCenter(page);

    const insideClick = await waitForViewerEvent(page, "click");
    await page.mouse.click(x, y);
    const inside = await insideClick();

    expectPxCloseTo([inside.imageX, inside.imageY], IMAGE_CENTER);
    expect(inside.isOutOfBounds).toBe(false);

    // the image is fitted with a padding, so the edge of the viewport is outside of it
    const outsideClick = await waitForViewerEvent(page, "click");
    await page.mouse.click(10, y);
    const outside = await outsideClick();

    expect(outside.imageX).toBeLessThan(0);
    expect(outside.isOutOfBounds).toBe(true);
  });
});

//#region Markers
test.describe("ImageViewerMarker", () => {
  test("is placed at its position in image pixels", async ({ page }) => {
    await loadImageViewerFixture({ page });
    await page.evaluate(() => window.createImageViewer());

    await page.evaluate(async ([px, py]) => {
      const { ImageViewerMarker } = window.__pageObjects as { ImageViewerMarker: typeof ImageViewerMarkerClass };
      const element = document.createElement("div");
      element.id = "e2e-marker";
      element.style.width = "20px";
      element.style.height = "20px";
      element.style.background = "red";

      new ImageViewerMarker({ element, anchor: "center" }).setPosition([px, py]).addTo(window.__imageViewer);
      await window.waitForImageViewerIdle();
    }, IMAGE_CENTER);

    const markerCenter = await getElementCenter(page, "#e2e-marker");
    const canvasCenter = await getCanvasCenter(page);

    expectPxCloseTo([markerCenter.x, markerCenter.y], [canvasCenter.x, canvasCenter.y], 2);

    await expect(page).toHaveScreenshot("imageViewer-marker.png");
  });
});
