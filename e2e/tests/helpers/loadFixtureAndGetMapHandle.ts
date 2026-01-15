import type { Map } from "../../../src/index";
import { JSHandle, Page, expect } from "@playwright/test";
import path from "path";

interface IloadFixtureAndGetMapHandle {
  fixture: string;
  page: Page;
  mockStyle?: boolean;
  mockTiles?: boolean;
  debug?: boolean;
  waitUntil?: "load" | "domcontentloaded" | "networkidle";
  queryParams?: Record<string, string>;
}

export default async function loadFixtureAndGetMapHandle({
  fixture,
  page,
  mockStyle = true,
  mockTiles = true,
  debug = false,
  waitUntil = "load",
  queryParams,
}: IloadFixtureAndGetMapHandle): Promise<{ mapHandle: JSHandle<Map | null> }> {
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
        path: path.resolve(import.meta.dirname, `../mocks/tile.png`),
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

  await page.goto([`http://localhost:5173/${fixture}.html`, queryParams && new URLSearchParams(queryParams).toString()].filter(Boolean).join("?"), {
    waitUntil,
  });

  try {
    const mapHandle = await page.evaluateHandle<Map | null>(() => {
      return Promise.race<Map | null>([
        new Promise<Map | null>(async (resolve) => {
          try {
            window.__map.on("idle", () => {
              resolve(window.__map as Map);
            });
          } catch (e) {
            console.error("Error getting map instance", e);
            resolve(null);
          }
        }),
        new Promise<Map | null>((resolve) => {
          setTimeout(() => {
            console.error("Map did not load in time");
            resolve(null);
          }, 10000);
        }),
      ]);
    });

    return {
      mapHandle,
    };
  } catch (e) {
    console.error(e);
    const nullMap = await page.evaluateHandle(() => null);
    return {
      mapHandle: nullMap as JSHandle<Map | null>,
    };
  }
}
