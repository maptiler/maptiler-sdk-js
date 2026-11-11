import type { Page } from "@playwright/test";

/** An RGB colour, each channel `0`–`255`. */
export type Rgb = [number, number, number];

/**
 * The colour on screen where `lngLat` falls on `window.__map`, as composited by the browser.
 * Reads the middle pixel of a small screenshot, so it sees exactly what a user would.
 */
export async function colorAtLngLat(page: Page, lngLat: [number, number]): Promise<Rgb> {
  const point = await page.evaluate((lngLat) => {
    const { x, y } = window.__map.project(lngLat);
    const rect = window.__map.getCanvas().getBoundingClientRect();
    return { x: rect.left + x, y: rect.top + y };
  }, lngLat);

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
    return [r, g, b] as Rgb;
  }, png.toString("base64"));
}

/** Largest difference between the channels of two colours. */
export function colorDistance(a: Rgb, b: Rgb): number {
  return Math.max(...a.map((channel, i) => Math.abs(channel - b[i])));
}
