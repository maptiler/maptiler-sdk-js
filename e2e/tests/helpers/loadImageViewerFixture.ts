import { Page } from "@playwright/test";
import path from "path";
import loadFixtureAndGetMapHandle from "./loadFixtureAndGetMapHandle";

interface LoadImageViewerFixtureOptions {
  page: Page;
  debug?: boolean;
}

/**
 * Mocks the image API and loads the `imageViewer` fixture, without creating a viewer.
 * The viewer is created in the page with `window.createImageViewer(options)`.
 */
export default async function loadImageViewerFixture({ page, debug = false }: LoadImageViewerFixtureOptions) {
  // Tiles first: routes added later take precedence, so the metadata route is matched before this catch-all
  await page.route("https://api.maptiler.com/images/**", (route) => {
    if (debug) console.info(`ℹ️ Image tile intercepted at ${route.request().url()}`);
    return route.fulfill({
      status: 200,
      contentType: "image/png",
      path: path.resolve(import.meta.dirname, "../mocks/image-viewer-tile.png"),
    });
  });

  await page.route("https://api.maptiler.com/images/*/image.json*", (route) => {
    if (debug) console.info(`ℹ️ Image metadata intercepted at ${route.request().url()}`);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      path: path.resolve(import.meta.dirname, "../mocks/image-viewer-metadata.json"),
    });
  });

  await loadFixtureAndGetMapHandle({
    fixture: "imageViewer",
    page,
    mockStyle: false,
    mockTiles: false,
    lazy: true,
    debug,
  });
}
