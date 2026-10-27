import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { drawMarkerCanvas, getMarkerCanvasPadding } from "../../src/Marker/marker-canvas";
import { circlePath, getShapeGeometry } from "../../src/Marker/marker-svg-config";
import { getAdaptiveColors } from "../../src/Marker/marker-adaptive-colors";
import { MARKER_ICON_VIEWBOX_SIZE, getMarkerIconPath } from "../../src/Marker/marker-icons";
import {
  CONTENT_METRICS,
  DEFAULT_OUTLINE_WIDTH,
  DOT_RING_PX,
  MARKER_FONT_FAMILY,
  SHADOW_PARAMS,
  SIZE_PX,
  TEXT_FONT_WEIGHT,
  TEXT_LETTER_SPACING_EM,
} from "../../src/Marker/marker-constants";

// happy-dom has no 2D canvas: stand in a context that records every draw call,
// with the paint state at the time of the call, and a Path2D that keeps its path data

class FakePath2D {
  constructor(readonly d?: string) {}
}

type DrawCall = {
  op: string;
  args: unknown[];
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  font: string;
};

type FakeContext = {
  calls: DrawCall[];
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  font: string;
  letterSpacing: string;
  textAlign: string;
  textBaseline: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowColor: string;
};

const RECORDED_OPS = ["setTransform", "fill", "stroke", "save", "restore", "clip", "fillText", "translate", "scale", "drawImage"] as const;

function createFakeContext(): FakeContext {
  const ctx = {
    calls: [] as DrawCall[],
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    letterSpacing: "0px",
    textAlign: "start",
    textBaseline: "alphabetic",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: "",
    // marker-text-fit measures labels on its own canvas: every glyph half an em wide, so short labels fit
    measureText(label: string) {
      return { width: label.length * 0.5 * Number(/(\d+(?:\.\d+)?)px/.exec(ctx.font)?.[1]) };
    },
  };

  for (const op of RECORDED_OPS) {
    (ctx as Record<string, unknown>)[op] = (...args: unknown[]) => {
      ctx.calls.push({ op, args, fillStyle: ctx.fillStyle, strokeStyle: ctx.strokeStyle, lineWidth: ctx.lineWidth, font: ctx.font });
    };
  }

  return ctx;
}

/** Each canvas gets its own recording context, looked up by canvas. */
function mockCanvas() {
  const contexts = new Map<HTMLCanvasElement, FakeContext>();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (this: HTMLCanvasElement) {
    let ctx = contexts.get(this);
    if (!ctx) {
      ctx = createFakeContext();
      contexts.set(this, ctx);
    }
    return ctx;
  } as unknown as typeof HTMLCanvasElement.prototype.getContext);
  return contexts;
}

let contexts: Map<HTMLCanvasElement, FakeContext>;

/** The context the marker itself was drawn on — beneath the shadow pass when there is one. */
function bodyContext(canvas: HTMLCanvasElement): FakeContext {
  const ctx = contexts.get(canvas);
  if (!ctx) throw new Error("canvas has no context");
  const drawImage = ctx.calls.find((call) => call.op === "drawImage");
  return drawImage ? bodyContext(drawImage.args[0] as HTMLCanvasElement) : ctx;
}

const callsOf = (ctx: FakeContext, op: string) => ctx.calls.filter((call) => call.op === op);
const pathOf = (call: DrawCall) => (call.args[0] as FakePath2D).d;

const colors = { outerColor: "#111111", innerColor: "#222222", contentColor: "#333333", outlineColor: "#444444" };

beforeEach(() => {
  vi.stubGlobal("Path2D", FakePath2D);
  contexts = mockCanvas();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

//#region Sizing

describe("drawMarkerCanvas sizing", () => {
  it("leaves a 1px margin around the marker box without a shadow or outline", () => {
    const { canvas, padding } = drawMarkerCanvas({ shape: "circle", size: "m", shadow: "none" }, { pixelRatio: 1 });

    expect(padding).toBe(1);
    expect(canvas.width).toBe(SIZE_PX.m + 2);
    expect(canvas.height).toBe(canvas.width);
  });

  it.each([
    ["l", 9], // strong: 2px offset + 1.5 × 4px blur
    ["m", 6], // medium: 2px offset + 1.5 × 2px blur
    ["s", 2], // soft: 1px offset, no blur
    ["xs", 2], // soft
  ] as const)("pads for the default shadow of size %s", (size, padding) => {
    const result = drawMarkerCanvas({ shape: "circle", size }, { pixelRatio: 1 });

    expect(result.padding).toBe(padding);
    expect(result.canvas.width).toBe(SIZE_PX[size] + padding * 2);
  });

  it("pads for half the outline, which sits outside the path", () => {
    expect(drawMarkerCanvas({ shape: "circle", size: "m", shadow: "none", outline: 6 }, { pixelRatio: 1 }).padding).toBe(4);
  });

  it("takes the larger of the outline and shadow extents", () => {
    expect(drawMarkerCanvas({ shape: "circle", size: "l", shadow: "strong", outline: true }, { pixelRatio: 1 }).padding).toBe(9);
  });

  it("sizes the canvas in device pixels", () => {
    const result = drawMarkerCanvas({ shape: "circle", size: "m", shadow: "none" }, { pixelRatio: 2 });

    expect(result.pixelRatio).toBe(2);
    expect(result.canvas.width).toBe((SIZE_PX.m + 2) * 2);
  });

  it("defaults the pixel ratio to window.devicePixelRatio", () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, "devicePixelRatio");
    Object.defineProperty(window, "devicePixelRatio", { value: 3, configurable: true });

    try {
      expect(drawMarkerCanvas({ shape: "circle", size: "m", shadow: "none" }).pixelRatio).toBe(3);
    } finally {
      if (descriptor) Object.defineProperty(window, "devicePixelRatio", descriptor);
      else Reflect.deleteProperty(window, "devicePixelRatio");
    }
  });

  it("draws in marker-box px, offset by the padding and scaled to device pixels", () => {
    const { canvas, padding } = drawMarkerCanvas({ shape: "circle", size: "l", shadow: "none" }, { pixelRatio: 2 });

    expect(callsOf(bodyContext(canvas), "setTransform")[0].args).toEqual([2, 0, 0, 2, 2 * padding, 2 * padding]);
  });

  it.each([
    [{ size: "l" }],
    [{ size: "m", shadow: "none" }],
    [{ size: "m", shadow: "none", outline: 6 }],
    [{ size: "l", shadow: "strong", outline: true }],
    [{ size: "xs", outline: true }],
  ] as const)("getMarkerCanvasPadding matches the padding drawn for %o", (style) => {
    expect(getMarkerCanvasPadding({ shape: "circle", ...style })).toBe(drawMarkerCanvas({ shape: "circle", ...style }, { pixelRatio: 1 }).padding);
  });
});

//#endregion

//#region Shadow

describe("drawMarkerCanvas shadow", () => {
  it("returns the drawn marker as is without a shadow", () => {
    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "m", shadow: "none" }, { pixelRatio: 1 });
    const ctx = contexts.get(canvas);

    expect(ctx && callsOf(ctx, "drawImage")).toHaveLength(0);
    expect(ctx && callsOf(ctx, "fill").length).toBeGreaterThan(0);
  });

  it("shadows the composited marker once, with the shadow given in device pixels", () => {
    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "m", shadow: "strong" }, { pixelRatio: 2 });
    const ctx = contexts.get(canvas);
    const strong = SHADOW_PARAMS.strong;

    expect(ctx).toBeDefined();
    expect(strong).not.toBeNull();
    if (!ctx || !strong) return;

    const [drawImage] = callsOf(ctx, "drawImage");
    expect(drawImage.args[0]).toBeInstanceOf(HTMLCanvasElement);
    expect(drawImage.args[0]).not.toBe(canvas);
    expect(drawImage.args.slice(1)).toEqual([0, 0]);

    expect(ctx.shadowOffsetX).toBe(strong.offsetX * 2);
    expect(ctx.shadowOffsetY).toBe(strong.offsetY * 2);
    expect(ctx.shadowBlur).toBe(strong.blur * 2);
    expect(ctx.shadowColor).toBe(strong.color);
  });
});

//#endregion

//#region Shape

describe("drawMarkerCanvas shape", () => {
  it("fills the outer path, then each inner path separately, in their colours", () => {
    const geometry = getShapeGeometry("bubble-square", "l");
    const { canvas } = drawMarkerCanvas({ shape: "bubble-square", size: "l", ...colors }, { pixelRatio: 1 });
    const fills = callsOf(bodyContext(canvas), "fill");

    expect(fills.map(pathOf)).toEqual([geometry.outer, ...geometry.inner]);
    expect(fills.map((call) => call.fillStyle)).toEqual([colors.outerColor, ...geometry.inner.map(() => colors.innerColor)]);
  });

  it("resolves unset colours to the style's adaptive defaults for the shape", () => {
    const adaptive = getAdaptiveColors("streets-v4-dark", "circle");
    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "m" }, { pixelRatio: 1, styleId: "streets-v4-dark" });
    const fills = callsOf(bodyContext(canvas), "fill");

    expect(fills.map((call) => call.fillStyle)).toEqual([adaptive.outerColor, adaptive.innerColor]);
  });

  it("swaps the default colours of an inverted shape, like the DOM marker", () => {
    const adaptive = getAdaptiveColors("", "maptiler");
    const { canvas } = drawMarkerCanvas({ shape: "maptiler", size: "m" }, { pixelRatio: 1 });
    const [outer, inner] = callsOf(bodyContext(canvas), "fill");

    expect(outer.fillStyle).toBe(adaptive.outerColor);
    expect(inner.fillStyle).toBe(adaptive.innerColor);
    expect(outer.fillStyle).toBe(getAdaptiveColors("").innerColor);
  });

  it("keeps explicit colours over the adaptive ones", () => {
    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "m", outerColor: "red" }, { pixelRatio: 1, styleId: "streets-v4-dark" });
    const [outer, inner] = callsOf(bodyContext(canvas), "fill");

    expect(outer.fillStyle).toBe("red");
    expect(inner.fillStyle).toBe(getAdaptiveColors("streets-v4-dark", "circle").innerColor);
  });

  it("strokes no outline by default", () => {
    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "m", ...colors }, { pixelRatio: 1 });
    expect(callsOf(bodyContext(canvas), "stroke")).toHaveLength(0);
  });

  it("strokes the outer path between the outer and inner fills, at the default width for `true`", () => {
    const geometry = getShapeGeometry("circle", "m");
    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "m", outline: true, ...colors }, { pixelRatio: 1 });
    const painted = bodyContext(canvas).calls.filter((call) => call.op === "fill" || call.op === "stroke");

    expect(painted.map((call) => call.op)).toEqual(["fill", "stroke", "fill"]);
    expect(pathOf(painted[1])).toBe(geometry.outer);
    expect(painted[1].lineWidth).toBe(DEFAULT_OUTLINE_WIDTH);
    expect(painted[1].strokeStyle).toBe(colors.outlineColor);
  });

  it("strokes a numeric outline at that width in CSS px", () => {
    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "m", outline: 4 }, { pixelRatio: 2 });
    expect(callsOf(bodyContext(canvas), "stroke")[0].lineWidth).toBe(4);
  });
});

//#endregion

//#region Content

describe("drawMarkerCanvas content", () => {
  it("draws a text label at the size's font, centred and on the size's baseline, clipped to the inner fill", () => {
    const geometry = getShapeGeometry("circle", "m");
    const { font, baseline } = CONTENT_METRICS.m;
    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "m", content: "AB", ...colors }, { pixelRatio: 1 });
    const ctx = bodyContext(canvas);

    const [clip] = callsOf(ctx, "clip");
    expect(pathOf(clip)).toBe(geometry.clip.d);

    const [text] = callsOf(ctx, "fillText");
    expect(text.args).toEqual(["AB", geometry.content.cx + (TEXT_LETTER_SPACING_EM * font) / 2, geometry.content.cy + baseline]);
    expect(text.font).toBe(`${String(TEXT_FONT_WEIGHT)} ${String(font)}px ${MARKER_FONT_FAMILY}`);
    expect(text.fillStyle).toBe(colors.contentColor);
    expect(ctx.letterSpacing).toBe(`${String(TEXT_LETTER_SPACING_EM * font)}px`);
    expect(ctx.textAlign).toBe("center");
    expect(ctx.textBaseline).toBe("alphabetic");

    // the clip is scoped to the label
    const ops = ctx.calls.map((call) => call.op);
    expect(ops.indexOf("save")).toBeLessThan(ops.indexOf("clip"));
    expect(ops.indexOf("fillText")).toBeLessThan(ops.indexOf("restore"));
  });

  it("draws a single character at the size's single-character font and baseline", () => {
    const geometry = getShapeGeometry("circle", "l");
    const singleChar = CONTENT_METRICS.l.singleChar;
    expect(singleChar).toBeDefined();
    if (!singleChar) return;

    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "l", content: "A" }, { pixelRatio: 1 });
    const [text] = callsOf(bodyContext(canvas), "fillText");

    expect(text.args[2]).toBe(geometry.content.cy + singleChar.baseline);
    expect(text.font).toBe(`${String(TEXT_FONT_WEIGHT)} ${String(singleChar.font)}px ${MARKER_FONT_FAMILY}`);
  });

  it("draws the shape's default icon when there's no content, scaled to the icon box", () => {
    const geometry = getShapeGeometry("maptiler", "m");
    const box = CONTENT_METRICS.m.icon;
    const { canvas } = drawMarkerCanvas({ shape: "maptiler", size: "m", ...colors }, { pixelRatio: 1 });
    const ctx = bodyContext(canvas);

    expect(callsOf(ctx, "translate")[0].args).toEqual([geometry.content.cx - box / 2, geometry.content.cy - box / 2]);
    expect(callsOf(ctx, "scale")[0].args).toEqual([box / MARKER_ICON_VIEWBOX_SIZE, box / MARKER_ICON_VIEWBOX_SIZE]);

    const fills = callsOf(ctx, "fill");
    const icon = fills[fills.length - 1];
    expect(pathOf(icon)).toBe(getMarkerIconPath("maptiler"));
    expect(icon.fillStyle).toBe(colors.contentColor);
  });

  it("draws text in place of the default icon", () => {
    const geometry = getShapeGeometry("maptiler", "m");
    const { canvas } = drawMarkerCanvas({ shape: "maptiler", size: "m", content: "7" }, { pixelRatio: 1 });
    const ctx = bodyContext(canvas);

    expect(callsOf(ctx, "fill")).toHaveLength(1 + geometry.inner.length);
    expect(callsOf(ctx, "fillText")).toHaveLength(1);
  });

  it("draws nothing over the fill of a shape without a default icon", () => {
    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "m" }, { pixelRatio: 1 });
    const ctx = bodyContext(canvas);

    expect(callsOf(ctx, "fill")).toHaveLength(2);
    expect(callsOf(ctx, "fillText")).toHaveLength(0);
  });
});

//#endregion

//#region xs dot

describe("drawMarkerCanvas xs dot", () => {
  const center = SIZE_PX.xs / 2;

  it("draws an outer-colour disc with the inner-colour disc DOT_RING_PX inside it", () => {
    const { canvas } = drawMarkerCanvas({ shape: "circle", size: "xs", ...colors }, { pixelRatio: 1 });
    const fills = callsOf(bodyContext(canvas), "fill");

    expect(fills.map(pathOf)).toEqual([circlePath(center, center, center), circlePath(center, center, center - DOT_RING_PX)]);
    expect(fills.map((call) => call.fillStyle)).toEqual([colors.outerColor, colors.innerColor]);
  });

  it("swaps an inverted shape's colours back, so the dot keeps the design's ring and centre", () => {
    const base = getAdaptiveColors("");
    const { canvas } = drawMarkerCanvas({ shape: "maptiler", size: "xs" }, { pixelRatio: 1 });
    const fills = callsOf(bodyContext(canvas), "fill");

    expect(fills.map((call) => call.fillStyle)).toEqual([base.outerColor, base.innerColor]);
  });

  it("has no outline or content", () => {
    const result = drawMarkerCanvas({ shape: "circle", size: "xs", outline: 6, content: "AB" }, { pixelRatio: 1 });
    const ctx = bodyContext(result.canvas);

    expect(callsOf(ctx, "stroke")).toHaveLength(0);
    expect(callsOf(ctx, "fillText")).toHaveLength(0);
    // the outline doesn't widen the padding either: soft shadow only
    expect(result.padding).toBe(2);
  });
});

//#endregion

describe("drawMarkerCanvas without a 2D context", () => {
  it("throws", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(() => drawMarkerCanvas({ shape: "circle", size: "m" }, { pixelRatio: 1 })).toThrow("Could not get a 2D context to draw the marker.");
  });
});
