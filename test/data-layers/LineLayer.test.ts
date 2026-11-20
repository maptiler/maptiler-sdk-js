import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeatureCollection } from "geojson";
import { LineLayer, type LineLayerStyle } from "../../src/data-layers/LineLayer";
import { createMockStyleMap, type MockStyleMap } from "./mock-style-map";

const data = (): FeatureCollection => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { speed: 30 },
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
    },
  ],
});

let frames: FrameRequestCallback[];

function flushFrames() {
  const queued = frames;
  frames = [];
  for (const callback of queued) callback(0);
}

/** A style layer as the mock map stores it. */
type Sublayer = { id: string; type: string; source?: unknown; filter?: unknown; paint?: Record<string, unknown>; layout?: Record<string, unknown> };

const LINES_AND_POLYGONS = ["!=", ["geometry-type"], "Point"];
const ZOOM_WIDTH = [
  { zoom: 4, value: 2 },
  { zoom: 12, value: 6 },
];

describe("LineLayer", () => {
  let mock: MockStyleMap;

  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
    mock = createMockStyleMap();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function addLineLayer(style: LineLayerStyle = { color: "#3366ff" }, options: Partial<ConstructorParameters<typeof LineLayer>[0]> = {}) {
    const layer = new LineLayer({ data: data(), style, ...options });
    mock.map.addLayer(layer);
    return layer;
  }

  const sublayer = (layer: LineLayer, name: string) => mock.map.getLayer(`${layer.id}-${name}`) as Sublayer;
  const paintOf = (layer: LineLayer, name = "line") => sublayer(layer, name).paint ?? {};
  const layoutOf = (layer: LineLayer, name = "line") => sublayer(layer, name).layout ?? {};

  describe("sublayers", () => {
    it("draws one line sublayer, of lines and polygons, with addPolyline's defaults", () => {
      const layer = addLineLayer();

      expect(layer.mode).toBe("line");
      expect(layer.getSublayerIds()).toEqual([`${layer.id}-line`]);
      expect(sublayer(layer, "line")).toMatchObject({ type: "line", source: layer.getSourceId(), filter: LINES_AND_POLYGONS });
      expect(paintOf(layer)).toEqual({ "line-color": "#3366ff", "line-width": 3, "line-opacity": 1, "line-blur": 0, "line-gap-width": 0 });
      expect(layoutOf(layer)).toMatchObject({ "line-join": "round", "line-cap": "round" });
    });

    it("puts the glow and the outline beneath the lines, in that order", () => {
      const layer = addLineLayer({ color: "#3366ff", outline: true, glow: true });

      expect(layer.getSublayerIds()).toEqual([`${layer.id}-glow`, `${layer.id}-outline`, `${layer.id}-line`]);
      expect(mock.map.getLayersOrder()).toEqual([`${layer.id}-glow`, `${layer.id}-outline`, `${layer.id}-line`, layer.id]);
    });
  });

  describe("color", () => {
    it("is required, and kept when reset", () => {
      expect(() => new LineLayer({ data: data(), style: {} as LineLayerStyle })).toThrow("`style.color` is required");
      expect(() => new LineLayer({ data: data(), style: { color: null } as unknown as LineLayerStyle })).toThrow("`style.color` is required");

      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const layer = addLineLayer();
      layer.setStyle({ color: undefined });
      expect(layer.getStyle().color).toBe("#3366ff");
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"color" is required'));
    });
  });

  describe("width", () => {
    it("interpolates a zoom ramp over the zoom", () => {
      const layer = addLineLayer({ color: "#3366ff", width: ZOOM_WIDTH });
      expect(paintOf(layer)["line-width"]).toEqual(["interpolate", ["linear"], ["zoom"], 4, 2, 12, 6]);
    });

    it("reads property values at the property", () => {
      const layer = addLineLayer({
        color: "#3366ff",
        property: "speed",
        width: [
          { propertyValue: 0, value: 1 },
          { propertyValue: 100, value: 10 },
        ],
      });
      const width = paintOf(layer)["line-width"] as unknown[];

      expect(JSON.stringify(width)).toContain('["get","speed"]');
    });

    it("falls back to the default width for property values without a property, with a warning", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const layer = addLineLayer({ color: "#3366ff", width: [{ propertyValue: 0, value: 1 }] });

      expect(paintOf(layer)["line-width"]).toBe(3);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("needs `property`"));
    });
  });

  describe("dash", () => {
    it("leaves line-dasharray out for a solid line", () => {
      const layer = addLineLayer({ color: "#3366ff", dash: false });
      expect(paintOf(layer)).not.toHaveProperty("line-dasharray");
    });

    it("sets line-dasharray from the shorthands", () => {
      expect(paintOf(addLineLayer({ color: "#3366ff", dash: "dotted" }))["line-dasharray"]).toEqual([0.5, 2]);
      expect(paintOf(addLineLayer({ color: "#3366ff", dash: "__ " }))["line-dasharray"]).toEqual([2, 1]);
    });

    it("leaves the outline solid under dashes", () => {
      const layer = addLineLayer({ color: "#3366ff", dash: true, outline: true });
      expect(paintOf(layer, "outline")).not.toHaveProperty("line-dasharray");
    });
  });

  describe("outline", () => {
    it("is off by default", () => {
      expect(addLineLayer().getStyle().outline).toBe(false);
    });

    it("is as wide as the line plus its width on each side, with the defaults", () => {
      const layer = addLineLayer({ color: "#3366ff", width: 4, outline: true });

      expect(layer.getStyle().outline).toEqual({ color: "#FFFFFF", width: 1, opacity: 1, blur: 0 });
      expect(paintOf(layer, "outline")).toEqual({ "line-color": "#FFFFFF", "line-width": 6, "line-opacity": 1, "line-blur": 0 });
    });

    it("takes values set over its defaults, and the line's joins and caps", () => {
      const layer = addLineLayer({ color: "#3366ff", join: "miter", cap: "butt", outline: { color: "#000000", width: 2 } });

      expect(paintOf(layer, "outline")).toMatchObject({ "line-color": "#000000", "line-width": 7 });
      expect(layoutOf(layer, "outline")).toMatchObject({ "line-join": "miter", "line-cap": "butt" });
    });

    it("adds its width to each output of a zoom-ramped line width", () => {
      const layer = addLineLayer({ color: "#3366ff", width: ZOOM_WIDTH, outline: { width: 1 } });
      expect(paintOf(layer, "outline")["line-width"]).toEqual(["interpolate", ["linear"], ["zoom"], 4, 4, 12, 8]);
    });

    it("draws two strokes either side of the line when both widths read the zoom", () => {
      const layer = addLineLayer({ color: "#3366ff", width: ZOOM_WIDTH, outline: { width: ZOOM_WIDTH } });
      const ramp = ["interpolate", ["linear"], ["zoom"], 4, 2, 12, 6];

      expect(paintOf(layer, "outline")).toMatchObject({ "line-width": ramp, "line-gap-width": ramp });
    });
  });

  describe("glow", () => {
    it("is off by default", () => {
      expect(addLineLayer().getStyle().glow).toBe(false);
    });

    it("takes the line's colour, spreads 6px each side, and fades across its spread", () => {
      const layer = addLineLayer({ color: "#3366ff", glow: true });

      expect(layer.getStyle().glow).toEqual({ color: "#3366ff", width: 6, opacity: 1, blur: 6 });
      expect(paintOf(layer, "glow")).toEqual({ "line-color": "#3366ff", "line-width": 15, "line-opacity": 1, "line-blur": 6 });
    });

    it("blurs across its own width when that's set but its blur isn't", () => {
      const layer = addLineLayer({ color: "#3366ff", glow: { width: 10, color: "#ffcc00" } });
      expect(paintOf(layer, "glow")).toMatchObject({ "line-color": "#ffcc00", "line-width": 23, "line-blur": 10 });
    });

    it("is round whatever the line's joins and caps", () => {
      const layer = addLineLayer({ color: "#3366ff", join: "miter", cap: "butt", glow: true });
      expect(layoutOf(layer, "glow")).toEqual({ "line-join": "round", "line-cap": "round", visibility: "visible" });
    });
  });

  describe("updates", () => {
    it("restyles the sublayers in place", () => {
      const layer = addLineLayer({ color: "#3366ff", outline: true });
      mock.map.addSource.mockClear();
      mock.map.addLayer.mockClear();

      layer.setStyle({ color: "#ff0000", outline: { color: "#000000" } });
      flushFrames();

      expect(mock.map.addLayer).not.toHaveBeenCalled();
      expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-line`, "line-color", "#ff0000");
      expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-outline`, "line-color", "#000000");
    });

    it("rebuilds the sublayers when the outline or glow turns on or off", () => {
      const layer = addLineLayer();

      layer.setStyle({ glow: true });
      flushFrames();
      expect(layer.getSublayerIds()).toEqual([`${layer.id}-glow`, `${layer.id}-line`]);

      layer.setStyle({ glow: false });
      flushFrames();
      expect(layer.getSublayerIds()).toEqual([`${layer.id}-line`]);
      expect(mock.map.getLayer(`${layer.id}-glow`)).toBeUndefined();
    });

    it("adds and removes line-dasharray in place", () => {
      const layer = addLineLayer();

      layer.setStyle({ dash: true });
      flushFrames();
      expect(paintOf(layer)["line-dasharray"]).toEqual([2, 1.5]);

      mock.map.setPaintProperty.mockClear();
      layer.setStyle({ dash: false });
      flushFrames();
      expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-line`, "line-dasharray", undefined);
    });

    it("fades every sublayer's opacity at the edges of its zoom range", () => {
      const layer = addLineLayer({ color: "#3366ff", opacity: 0.8, outline: true, glow: true }, { minzoom: 2, maxzoom: 10, fade: 0.5 });

      expect(paintOf(layer)["line-opacity"]).toEqual(["interpolate", ["linear"], ["zoom"], 2, 0, 2.5, 0.8, 9.5, 0.8, 10, 0]);
      expect(paintOf(layer, "outline")["line-opacity"]).toEqual(["interpolate", ["linear"], ["zoom"], 2, 0, 2.5, 1, 9.5, 1, 10, 0]);
      expect(paintOf(layer, "glow")["line-opacity"]).toEqual(["interpolate", ["linear"], ["zoom"], 2, 0, 2.5, 1, 9.5, 1, 10, 0]);
    });

    it("restyles the opacities in place for a new zoom range", () => {
      const layer = addLineLayer();
      mock.map.addLayer.mockClear();

      layer.setZoomRange(3, 24, 1);
      flushFrames();

      expect(mock.map.addLayer).not.toHaveBeenCalled();
      expect(paintOf(layer)["line-opacity"]).toEqual(["interpolate", ["linear"], ["zoom"], 3, 0, 4, 1]);
    });
  });
});
