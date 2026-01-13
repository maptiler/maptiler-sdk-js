import { Page, expect } from "@playwright/test";
import path from "path";
import { injectGlobalVariables } from "./injectGlobalVariables";

interface IgetMapInstanceForFixture {
  fixture: string;
  page: Page;
  mockStyle?: boolean;
  mockTiles?: boolean;
  debug?: boolean;
  timeout?: number;
}

export default async function getMapInstanceForFixture({ fixture, page, mockStyle = true, mockTiles = true, debug = false, timeout = 10000 }: IgetMapInstanceForFixture) {
  await injectGlobalVariables(page);
  await page.addInitScript((plt) => {
    window.__pageLoadTimeout = plt;
  }, timeout);

  if (mockStyle) {
    // mock style response
    await page.route("https://api.maptiler.com/maps/*/*.json*", async (route) => {
      if (debug) console.info(`ℹ️ Style intercepted at ${route.request().url()}`);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        path: path.resolve(import.meta.dirname, "../mocks/maptiler-style.json"),
      });
    });
  }

  if (mockTiles) {
    // mocks the tile response always returning the mock tile
    await page.route("https://api.maptiler.com/tiles/*/*/*/*.jpg?key=*&*", (route) => {
      if (debug) console.info(`ℹ️ Tile intercepted at ${route.request().url()}`);
      return route.fulfill({
        status: 200,
        contentType: "image/png",
        path: path.resolve(import.meta.dirname, "../mocks/tile.png"),
      });
    });
  }

  page.on("console", (msg) => {
    console.log("FIXTURE LOG:", msg.text());
    if (debug) {
      console.log("DEBUG FIXTURE LOG:", msg.location(), msg.text());
    }
  });

  page.addListener("requestfinished", async (request) => {
    const response = await request.response();
    if (response && response.status() >= 400) {
      console.error(`\n\nFailed to load ${request.url()}\n status: ${response.status()}\n\n`);
      expect(response.status()).toBeLessThan(400);
    }
  });

  await page.goto(`http://localhost:5173/${fixture}.html`, {
    waitUntil: "domcontentloaded",
  });

  try {
    const map = await page.evaluateHandle(() => {
      return Promise.race([
        new Promise(async (resolve) => {
          console.log("Window.__map", window.__map);
          window.__map.on("idle", () => {;
            resolve(window.__map);
          });
        }),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Map did not load in time"));
          }, window.__pageLoadTimeout);
        }),
      ]);
    });

    return {
      map,
    };
  } catch (e) {
    console.error(e);
    return {};
  }
}
