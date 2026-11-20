import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeatureCollection } from "geojson";
import { PolygonLayer, type PolygonLayerStyle } from "../../src/data-layers/PolygonLayer";
import { createMockStyleMap, type MockStyleMap } from "./mock-style-map";

const data = (): FeatureCollection => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { population: 1000 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
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
const PATTERN_URL = "https://example.com/hatch.png";

describe("PolygonLayer", () => {
  let mock: MockStyleMap;
  let loadImage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
    mock = createMockStyleMap();
    // patterns load through the map, which the mock leaves out
    loadImage = vi.fn(() => Promise.resolve({ data: { width: 8, height: 8 } }));
    Object.assign(mock.map, { loadImage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function addPolygonLayer(style: PolygonLayerStyle = { color: "#3366ff" }, options: Partial<ConstructorParameters<typeof PolygonLayer>[0]> = {}) {
    const layer = new PolygonLayer({ data: data(), style, ...options });
    mock.map.addLayer(layer);
    return layer;
  }

  const sublayer = (layer: PolygonLayer, name: string) => mock.map.getLayer(`${layer.id}-${name}`) as Sublayer;
  const paintOf = (layer: PolygonLayer, name = "fill") => sublayer(layer, name).paint ?? {};
  const layoutOf = (layer: PolygonLayer, name: string) => sublayer(layer, name).layout ?? {};
  const patternIdOf = (layer: PolygonLayer) => `${layer.id}-pattern:${PATTERN_URL}`;

  describe("sublayers", () => {
    it("draws one fill sublayer, of lines and polygons", () => {
      const layer = addPolygonLayer();

      expect(layer.mode).toBe("fill");
      expect(layer.getSublayerIds()).toEqual([`${layer.id}-fill`]);
      expect(sublayer(layer, "fill")).toMatchObject({ type: "fill", source: layer.getSourceId(), filter: LINES_AND_POLYGONS });
      expect(paintOf(layer)).toEqual({ "fill-color": "#3366ff", "fill-opacity": 1 });
    });

    it("puts the glow beneath the fill, and the outline above it", () => {
      const layer = addPolygonLayer({ color: "#3366ff", outline: true, glow: true });
      expect(layer.getSublayerIds()).toEqual([`${layer.id}-glow`, `${layer.id}-fill`, `${layer.id}-outline`]);
    });
  });

  describe("color and pattern", () => {
    it("requires one of them", () => {
      expect(() => new PolygonLayer({ data: data(), style: {} as PolygonLayerStyle })).toThrow("`style.color` or `style.pattern` is required");
      expect(() => new PolygonLayer({ data: data(), style: { pattern: PATTERN_URL } })).not.toThrow();
    });

    it("keeps whichever is the only one set when reset, but resets either when both are", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const colorOnly = addPolygonLayer();
      colorOnly.setStyle({ color: undefined });
      expect(colorOnly.getStyle().color).toBe("#3366ff");
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"color" is required'));

      const both = addPolygonLayer({ color: "#3366ff", pattern: PATTERN_URL });
      both.setStyle({ color: undefined });
      expect(both.getStyle().color).toBeUndefined();
      expect(both.getStyle().pattern).toBe(PATTERN_URL);
    });

    it("interpolates a property's values", () => {
      const layer = addPolygonLayer({ color: ["interpolate", ["linear"], ["get", "population"], 0, "#000", 2000, "#fff"] });
      expect(paintOf(layer)["fill-color"]).toEqual(["interpolate", ["linear"], ["get", "population"], 0, "#000", 2000, "#fff"]);
    });
  });

  describe("pattern", () => {
    it("fills with the pattern's image, through the map's image resolver", async () => {
      const layer = addPolygonLayer({ pattern: PATTERN_URL });

      expect(paintOf(layer)).toEqual({ "fill-opacity": 1, "fill-pattern": patternIdOf(layer) });
      expect(mock.resolvers).toHaveLength(1);

      await mock.resolvers[0](patternIdOf(layer));
      expect(loadImage).toHaveBeenCalledWith(PATTERN_URL);
      expect(mock.images.has(patternIdOf(layer))).toBe(true);
    });

    it("loads each pattern once, and ignores other layers' images", async () => {
      const layer = addPolygonLayer({ pattern: PATTERN_URL });

      await Promise.all([mock.resolvers[0](patternIdOf(layer)), mock.resolvers[0](patternIdOf(layer)), mock.resolvers[0]("someone-else:image")]);
      expect(loadImage).toHaveBeenCalledTimes(1);
    });

    it("falls back to the colour when the pattern fails to load", async () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
      loadImage.mockRejectedValueOnce(new Error("404"));
      const layer = addPolygonLayer({ color: "#3366ff", pattern: PATTERN_URL });

      await mock.resolvers[0](patternIdOf(layer));
      flushFrames();

      expect(error).toHaveBeenCalledWith(expect.stringContaining("couldn't load the pattern image"), expect.any(Error));
      expect(paintOf(layer)).toEqual({ "fill-color": "#3366ff", "fill-opacity": 1 });
    });

    it("unregisters its resolver and removes its images when removed", async () => {
      const layer = addPolygonLayer({ pattern: PATTERN_URL });
      await mock.resolvers[0](patternIdOf(layer));

      mock.map.removeLayer(layer.id);

      expect(mock.resolvers).toHaveLength(0);
      expect(mock.images.has(patternIdOf(layer))).toBe(false);
    });
  });

  describe("outline", () => {
    it("is off by default", () => {
      expect(addPolygonLayer().getStyle().outline).toBe(false);
    });

    it("centres a 1px white line on the edge by default", () => {
      const layer = addPolygonLayer({ color: "#3366ff", outline: true });

      expect(layer.getStyle().outline).toEqual({ color: "#FFFFFF", width: 1, opacity: 1, blur: 0, position: "center", dash: false, cap: "butt", join: "round" });
      expect(paintOf(layer, "outline")).toEqual({ "line-color": "#FFFFFF", "line-width": 1, "line-opacity": 1, "line-blur": 0, "line-offset": 0 });
      expect(layoutOf(layer, "outline")).toMatchObject({ "line-join": "round", "line-cap": "butt" });
    });

    it("moves inside or outside the edge by half its width", () => {
      expect(paintOf(addPolygonLayer({ color: "#3366ff", outline: { width: 4, position: "inside" } }), "outline")["line-offset"]).toBe(2);
      expect(paintOf(addPolygonLayer({ color: "#3366ff", outline: { width: 4, position: "outside" } }), "outline")["line-offset"]).toBe(-2);
    });

    it("halves each output of a zoom-ramped width", () => {
      const layer = addPolygonLayer({
        color: "#3366ff",
        outline: {
          position: "inside",
          width: [
            { zoom: 4, value: 2 },
            { zoom: 12, value: 6 },
          ],
        },
      });
      expect(paintOf(layer, "outline")["line-offset"]).toEqual(["interpolate", ["linear"], ["zoom"], 4, 1, 12, 3]);
    });

    it("centres the outline, with a warning, when its width reads the zoom below the top level", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const layer = addPolygonLayer({ color: "#3366ff", outline: { position: "outside", width: ["*", 2, ["interpolate", ["linear"], ["zoom"], 0, 1, 10, 2]] } });

      expect(paintOf(layer, "outline")["line-offset"]).toBe(0);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("so the outline is centred rather than outside"));
    });

    it("dashes the outline", () => {
      const layer = addPolygonLayer({ color: "#3366ff", outline: { dash: "dotted", cap: "round" } });

      expect(paintOf(layer, "outline")["line-dasharray"]).toEqual([0.5, 2]);
      expect(layoutOf(layer, "outline")["line-cap"]).toBe("round");
    });
  });

  describe("glow", () => {
    it("is off by default", () => {
      expect(addPolygonLayer().getStyle().glow).toBe(false);
    });

    it("takes the fill's colour, and reaches its width outside the edge", () => {
      const layer = addPolygonLayer({ color: "#3366ff", glow: true });

      expect(layer.getStyle().glow).toEqual({ color: "#3366ff", width: 6, opacity: 1, blur: 6 });
      expect(paintOf(layer, "glow")).toEqual({ "line-color": "#3366ff", "line-width": 12, "line-opacity": 1, "line-blur": 6 });
      expect(layoutOf(layer, "glow")).toMatchObject({ "line-join": "round" });
    });

    it("is white for a pattern without a colour", () => {
      const layer = addPolygonLayer({ pattern: PATTERN_URL, glow: true });
      expect(paintOf(layer, "glow")["line-color"]).toBe("#FFFFFF");
    });

    it("keeps a width it can't double as it is", () => {
      const width = ["*", 2, ["interpolate", ["linear"], ["zoom"], 0, 1, 10, 2]];
      const layer = addPolygonLayer({ color: "#3366ff", glow: { width: width as never, blur: 3 } });
      expect(paintOf(layer, "glow")).toMatchObject({ "line-width": width, "line-blur": 3 });
    });
  });

  describe("updates", () => {
    it("restyles the sublayers in place", () => {
      const layer = addPolygonLayer({ color: "#3366ff", outline: true });
      mock.map.addLayer.mockClear();

      layer.setStyle({ opacity: 0.5, outline: { position: "inside", width: 2 } });
      flushFrames();

      expect(mock.map.addLayer).not.toHaveBeenCalled();
      expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-fill`, "fill-opacity", 0.5);
      expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-outline`, "line-offset", 1);
    });

    it("rebuilds the sublayers when the outline turns on", () => {
      const layer = addPolygonLayer();

      layer.setStyle({ outline: true });
      flushFrames();

      expect(layer.getSublayerIds()).toEqual([`${layer.id}-fill`, `${layer.id}-outline`]);
    });

    it("fades the fill's opacity at the edges of its zoom range", () => {
      const layer = addPolygonLayer({ color: "#3366ff", opacity: 0.6 }, { minzoom: 0, maxzoom: 8, fade: 1 });
      expect(paintOf(layer)["fill-opacity"]).toEqual(["interpolate", ["linear"], ["zoom"], 7, 0.6, 8, 0]);
    });
  });
});
