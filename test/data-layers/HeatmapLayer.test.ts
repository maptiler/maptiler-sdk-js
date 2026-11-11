import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import type { FeatureCollection } from "geojson";
import { HeatmapLayer, type HeatmapLayerStyle } from "../../src/data-layers/HeatmapLayer";
import { PointLayer } from "../../src/data-layers/PointLayer";
import { addHeatmap, type HeatmapLayerOptions } from "../../src/helpers/vectorlayerhelpers";
import { ColorRampCollection } from "../../src/ColorRamp";
import { createMockStyleMap, type MockStyleMap } from "./mock-style-map";

const data = (): FeatureCollection => ({
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: { mag: 4.2 }, geometry: { type: "Point", coordinates: [0, 0] } }],
});

let frames: FrameRequestCallback[];

function flushFrames() {
  const queued = frames;
  frames = [];
  for (const callback of queued) callback(0);
}

/** A style layer as the mock map stores it. */
type Sublayer = { id: string; type: string; source?: unknown; filter?: unknown; paint?: Record<string, unknown> };

const POINTS_ONLY = ["==", ["geometry-type"], "Point"];

/** The `addHeatmap` options matching heatmap style, which uses the data layers' shared names. */
function toAddHeatmapOptions({ color, ...rest }: HeatmapLayerStyle): Partial<HeatmapLayerOptions> {
  return { ...rest, colorRamp: color } as Partial<HeatmapLayerOptions>;
}

describe("HeatmapLayer", () => {
  let mock: MockStyleMap;
  const style = { color: ColorRampCollection.MAGMA };

  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
    mock = createMockStyleMap();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function addHeatmapLayer(layerStyle: HeatmapLayerStyle = style, options: Partial<ConstructorParameters<typeof HeatmapLayer>[0]> = {}) {
    const layer = new HeatmapLayer({ data: data(), style: layerStyle, ...options });
    mock.map.addLayer(layer);
    return layer;
  }

  const paintOf = (layer: HeatmapLayer) => (mock.map.getLayer(`${layer.id}-heatmap`) as Sublayer).paint ?? {};

  it("draws one heatmap sublayer, of points only", () => {
    const layer = addHeatmapLayer();

    expect(layer.mode).toBe("heatmap");
    expect(layer.getSublayerIds()).toEqual([`${layer.id}-heatmap`]);
    expect(mock.map.getLayer(`${layer.id}-heatmap`)).toMatchObject({ type: "heatmap", source: layer.getSourceId(), filter: POINTS_ONLY });
  });

  it("requires a colour, and keeps it when reset", () => {
    expect(() => new HeatmapLayer({ data: data(), style: {} as HeatmapLayerStyle })).toThrow("`style.color` is required");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const layer = addHeatmapLayer();
    layer.setStyle({ color: undefined });
    expect(layer.getStyle().color).toBe(ColorRampCollection.MAGMA);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"color" is required'));
    warn.mockRestore();
  });

  it("reads the colour ramp along the density, scaled to [0, 1] with a transparent start", () => {
    const layer = addHeatmapLayer({ color: ColorRampCollection.TURBO.scale(10, 50) });
    const color = paintOf(layer)["heatmap-color"] as unknown[];

    expect(color.slice(0, 3)).toEqual(["interpolate", ["linear"], ["heatmap-density"]]);
    expect(color[3]).toBe(0);
    expect(color.at(-2)).toBe(1);
    // the transparent start's colour has no alpha left
    expect(color[4]).toMatch(/^#[0-9a-f]{6}00$/i);
  });

  it("weights points by the property's value when no weight is set", () => {
    const layer = addHeatmapLayer({ ...style, property: "mag" });
    expect(paintOf(layer)["heatmap-weight"]).toEqual(["max", 0, ["to-number", ["get", "mag"], 0]]);
  });

  it("passes weight, radius, intensity and opacity expressions through", () => {
    const weight = ["get", "w"];
    const radius = ["*", 3, ["get", "w"]];
    const intensity = ["interpolate", ["linear"], ["zoom"], 0, 0.5, 10, 2];
    const opacity = ["interpolate", ["linear"], ["zoom"], 0, 0.2, 10, 1];
    const layer = addHeatmapLayer({ ...style, weight, radius, intensity, opacity } as HeatmapLayerStyle);

    expect(paintOf(layer)).toMatchObject({ "heatmap-weight": weight, "heatmap-radius": radius, "heatmap-intensity": intensity, "heatmap-opacity": opacity });
  });

  it("restyles in place, without rebuilding", () => {
    const layer = addHeatmapLayer();
    mock.map.addSource.mockClear();

    layer.setStyle({ radius: 20, intensity: 2 });
    flushFrames();

    expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-heatmap`, "heatmap-radius", 20);
    expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-heatmap`, "heatmap-intensity", 2);
    expect(mock.map.addSource).not.toHaveBeenCalled();
  });

  it("refades for a new zoom range", () => {
    const layer = addHeatmapLayer(style, { maxzoom: 10, fade: 1 });
    expect(paintOf(layer)["heatmap-opacity"]).toEqual(["interpolate", ["linear"], ["zoom"], 9, 1, 10, 0]);

    layer.setZoomRange(0, 12);
    flushFrames();

    expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-heatmap`, "heatmap-opacity", ["interpolate", ["linear"], ["zoom"], 11, 1, 12, 0]);
  });

  it("shares its source with a point layer", () => {
    const heatmap = addHeatmapLayer();
    const points = new PointLayer({ data: heatmap, style: { color: "#ff0000" } });
    mock.map.addLayer(points);

    expect(points.getSourceId()).toBe(heatmap.getSourceId());
    expect(mock.sources.size).toBe(1);
  });

  describe("missing colour", () => {
    it.each([
      ["an empty style", { data: data(), style: {} }],
      ["an undefined colour", { data: data(), style: { color: undefined } }],
      ["a null colour", { data: data(), style: { color: null } }],
      ["no style", { data: data() }],
      ["no options", undefined],
    ])("throws for %s, naming the option", (_, options) => {
      expect(() => new HeatmapLayer(options as unknown as ConstructorParameters<typeof HeatmapLayer>[0])).toThrow("`style.color` is required");
    });

    it("throws before the base constructor, so there's no warning about resetting a colour it never had", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

      expect(() => new HeatmapLayer({ data: data(), style: { color: undefined } as unknown as HeatmapLayerStyle })).toThrow();
      expect(warn).not.toHaveBeenCalled();

      warn.mockRestore();
    });
  });

  describe("fallbacks", () => {
    let warn: MockInstance<typeof console.warn>;

    beforeEach(() => {
      warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    const propertyValues = [
      { propertyValue: 0, value: 5 },
      { propertyValue: 8, value: 40 },
    ];

    /** The default radius, over the zoom. */
    const DEFAULT_RADIUS = ["interpolate", ["linear"], ["zoom"], 0, 1.25, 2, 2.5, 4, 5, 8, 12.5, 16, 50];

    it("weighs every point 1, with a warning, for a PropertyValues weight without a property", () => {
      const layer = addHeatmapLayer({ ...style, weight: propertyValues });

      expect(paintOf(layer)["heatmap-weight"]).toBe(1);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("`PropertyValues` `weight` needs `property`"));
    });

    it("uses the default radius, with a warning, for a PropertyValues radius without a property", () => {
      const layer = addHeatmapLayer({ ...style, radius: propertyValues });

      expect(paintOf(layer)["heatmap-radius"]).toEqual(DEFAULT_RADIUS);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("`PropertyValues` `radius` needs `property`"));
    });

    it("uses the zoom-driven default radius for that fallback even without zoom compensation, as addHeatmap does", () => {
      const layer = addHeatmapLayer({ ...style, radius: propertyValues, zoomCompensation: false });

      expect(paintOf(layer)["heatmap-radius"]).toEqual(DEFAULT_RADIUS);
    });

    it("weighs every point 1 without a weight or a property, and doesn't warn", () => {
      const layer = addHeatmapLayer();

      expect(paintOf(layer)["heatmap-weight"]).toBe(1);
      expect(warn).not.toHaveBeenCalled();
    });

    it("warns again when a restyle falls back", () => {
      const layer = addHeatmapLayer({ ...style, property: "mag", weight: propertyValues });
      expect(warn).not.toHaveBeenCalled();

      layer.setStyle({ property: undefined });
      flushFrames();

      expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-heatmap`, "heatmap-weight", 1);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("`PropertyValues` `weight` needs `property`"));
    });

    it("ramps the opacity over the zoom as given, without the zoom range's fade", () => {
      const opacity = [
        { zoom: 2, value: 0.2 },
        { zoom: 8, value: 1 },
      ];
      const layer = addHeatmapLayer({ ...style, opacity }, { minzoom: 1, maxzoom: 10, fade: 1 });

      // an opacity reading the zoom can't be nested in the fade, which also reads it
      expect(paintOf(layer)["heatmap-opacity"]).toEqual(["interpolate", ["linear"], ["zoom"], 2, 0.2, 8, 1]);
    });
  });

  //#region addHeatmap Parity

  describe("matches addHeatmap", () => {
    const cases: [string, HeatmapLayerStyle][] = [
      ["a colour ramp", { color: ColorRampCollection.TURBO }],
      ["a ramp to scale", { color: ColorRampCollection.MAGMA.scale(0, 100) }],
      [
        "a property weight",
        {
          color: ColorRampCollection.TURBO,
          property: "mag",
          weight: [
            { propertyValue: 0, value: 0 },
            { propertyValue: 8, value: 1 },
          ],
        },
      ],
      ["a fixed weight and radius", { color: ColorRampCollection.TURBO, weight: 2, radius: 15 }],
      [
        "a zoom-ramped radius",
        {
          color: ColorRampCollection.TURBO,
          radius: [
            { zoom: 0, value: 2 },
            { zoom: 12, value: 30 },
          ],
        },
      ],
      [
        "a property radius",
        {
          color: ColorRampCollection.TURBO,
          property: "mag",
          weight: [
            { propertyValue: 0, value: 0 },
            { propertyValue: 8, value: 1 },
          ],
          radius: [
            { propertyValue: 0, value: 5 },
            { propertyValue: 8, value: 40 },
          ],
        },
      ],
      [
        "a property radius without zoom compensation",
        {
          color: ColorRampCollection.TURBO,
          property: "mag",
          weight: [
            { propertyValue: 0, value: 0 },
            { propertyValue: 8, value: 1 },
          ],
          radius: [
            { propertyValue: 0, value: 5 },
            { propertyValue: 8, value: 40 },
          ],
          zoomCompensation: false,
        },
      ],
      ["no zoom compensation", { color: ColorRampCollection.TURBO, zoomCompensation: false }],
      ["a fixed intensity and opacity", { color: ColorRampCollection.TURBO, intensity: 0.5, opacity: 0.7 }],
    ];

    it.each(cases)("with %s", (_, layerStyle) => {
      const helperMock = createMockStyleMap();
      // the deprecated helper is the reference here, away from the map's zoom limits, where the layer doesn't fade
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const ids = addHeatmap(helperMock.asSDKMap(), { data: data(), ...toAddHeatmapOptions(layerStyle), minzoom: 2, maxzoom: 20 });
      const helperPaint = (helperMock.map.getLayer(ids.heatmapLayerId) as Sublayer).paint;

      // addHeatmap only fades an unset opacity at the zoom range's edges, while the layer fades any opacity
      const layer = addHeatmapLayer(layerStyle, { minzoom: 2, maxzoom: 20, fade: layerStyle.opacity === undefined ? 0.25 : 0 });

      expect(paintOf(layer)).toEqual(helperPaint);
    });
  });

  //#endregion
});
