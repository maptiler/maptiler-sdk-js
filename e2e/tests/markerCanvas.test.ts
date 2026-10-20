import { expect, test, type Page } from "@playwright/test";
import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";

// A channel difference above this counts the pixel as different — below it is anti-aliasing noise
const PIXEL_DIFF_THRESHOLD = 64;

// Share of a marker's inked pixels allowed to differ between the DOM and canvas renderings
const MAX_DIFF_RATIO = 0.05;

async function loadFixture(page: Page) {
  await loadFixtureAndGetMapHandle({
    fixture: "markerCanvas",
    page,
    lazy: true,
    mockStyle: false,
    mockTiles: false,
  });

  expect(await page.title()).toBe("MapTiler E2E Marker Canvas");
  await page.waitForFunction(() => document.body.dataset.ready === "true");
}

test("draws every marker to canvas", async ({ page }) => {
  await loadFixture(page);

  await expect(page.locator("#grid")).toHaveScreenshot("markerCanvas.png", { animations: "disabled" });
});

test("canvas markers match their DOM markers", async ({ page }) => {
  await loadFixture(page);

  const ids = await page.locator('.cell[data-kind="dom"]').evaluateAll((cells) => cells.map((cell) => (cell as HTMLElement).dataset.case ?? ""));
  expect(ids.length).toBeGreaterThan(0);

  const results: { id: string; ratio: number }[] = [];

  for (const id of ids) {
    const [dom, canvas] = await Promise.all(
      (["dom", "canvas"] as const).map(async (kind) => {
        const png = await page.locator(`.cell[data-case="${id}"][data-kind="${kind}"]`).screenshot({ animations: "disabled" });
        return png.toString("base64");
      }),
    );

    const ratio = await page.evaluate(
      async ({ dom, canvas, threshold }) => {
        async function pixels(base64: string) {
          const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
          const bitmap = await createImageBitmap(blob);
          const ctx = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");
          if (!ctx) throw new Error("No 2D context");
          ctx.drawImage(bitmap, 0, 0);
          return ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
        }

        const [a, b] = await Promise.all([pixels(dom), pixels(canvas)]);
        if (a.length !== b.length) return 1;

        let inked = 0;
        let different = 0;
        for (let i = 0; i < a.length; i += 4) {
          // on the white cell background, anything not white is part of the marker or its shadow
          const isInk = (data: Uint8ClampedArray) => data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250;
          if (!isInk(a) && !isInk(b)) continue;
          inked++;
          const diff = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]));
          if (diff > threshold) different++;
        }

        return inked === 0 ? 0 : different / inked;
      },
      { dom, canvas, threshold: PIXEL_DIFF_THRESHOLD },
    );

    results.push({ id, ratio });
  }

  const mismatches = results.filter(({ ratio }) => ratio > MAX_DIFF_RATIO);
  expect(mismatches, `markers whose canvas differs from the DOM by more than ${String(MAX_DIFF_RATIO * 100)}% of inked pixels`).toEqual([]);
});
