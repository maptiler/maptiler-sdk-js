import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getShapeGeometry } from "../../src/Marker/marker-svg-config";
import { CONTENT_METRICS, TEXT_LETTER_SPACING_EM, TEXT_MIN_FONT_PX } from "../../src/Marker/marker-constants";

// happy-dom has no canvas text measurement: stand in a context where every glyph is `em` wide
function mockCanvas(em: number | null) {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => {
    if (em === null) return null;
    let font = "";
    return {
      set font(value: string) {
        font = value;
      },
      get font() {
        return font;
      },
      measureText: (label: string) => ({ width: label.length * em * Number(/(\d+(?:\.\d+)?)px/.exec(font)?.[1]) }),
    };
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext);
}

// a fresh module per test: it caches the canvas context
async function load() {
  vi.resetModules();
  return import("../../src/Marker/marker-text-fit");
}

const inkWidth = (label: string, font: number, em: number) => label.length * em * font + (label.length - 1) * TEXT_LETTER_SPACING_EM * font;

describe("fitLabel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const circleM = getShapeGeometry("circle", "m");
  const nominalM = { font: CONTENT_METRICS.m.font, baseline: CONTENT_METRICS.m.baseline };

  it("keeps a label that fits at the size's font size and baseline", async () => {
    mockCanvas(0.6); // "00"-like: 14.2 px at 12 px, inside the 20 px fill
    const { fitLabel } = await load();
    expect(fitLabel("00", nominalM, circleM)).toEqual(nominalM);
  });

  it("shrinks a wide label until it fits inside the fill", async () => {
    mockCanvas(0.95); // "MW"-like: wider than the 20 px fill at 12 px
    const { fitLabel } = await load();
    const fitted = fitLabel("MW", nominalM, circleM);

    expect(fitted.font).toBeLessThan(nominalM.font);
    expect(fitted.font).toBeGreaterThanOrEqual(TEXT_MIN_FONT_PX);
    // inside the fill's chord at the cap line, with the margin to spare
    expect(inkWidth("MW", fitted.font, 0.95)).toBeLessThanOrEqual(20);
    // the baseline follows the font size on a whole pixel
    expect(Number.isInteger(fitted.baseline)).toBe(true);
    expect(fitted.baseline).toBeLessThan(nominalM.baseline);
  });

  it("shrinks wide labels on every size", async () => {
    mockCanvas(0.95);
    const { fitLabel } = await load();
    for (const size of ["s", "m", "l"] as const) {
      const metrics = CONTENT_METRICS[size];
      const geometry = getShapeGeometry("circle", size);
      const fitted = fitLabel("WW", { font: metrics.font, baseline: metrics.baseline }, geometry);
      expect(fitted.font).toBeLessThan(metrics.font);
      expect(inkWidth("WW", fitted.font, 0.95)).toBeLessThanOrEqual(geometry.clip.w);
    }
  });

  it("never shrinks below the minimum font size", async () => {
    mockCanvas(0.95);
    const { fitLabel } = await load();
    expect(fitLabel("MMMMMMMMMM", nominalM, circleM).font).toBe(TEXT_MIN_FONT_PX);
  });

  it("leaves a single character alone", async () => {
    mockCanvas(5);
    const { fitLabel } = await load();
    expect(fitLabel("W", nominalM, circleM)).toEqual(nominalM);
  });

  it("keeps the size's metrics where text can't be measured", async () => {
    mockCanvas(null);
    const { fitLabel } = await load();
    expect(fitLabel("MW", nominalM, circleM)).toEqual(nominalM);
  });
});
