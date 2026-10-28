import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeatureCollection } from "geojson";
import { PointLayer } from "../../src/data-layers/PointLayer";
import type { PointLayerCirclesStyling } from "../../src/data-layers/PointLayer";
import { addPoint, type PointLayerOptions } from "../../src/helpers/vectorlayerhelpers";
import { ColorRampCollection } from "../../src/ColorRamp";
import { getAdaptiveColors } from "../../src/Marker/marker-adaptive-colors";
import { createMockStyleMap, type MockStyleMap } from "./mock-style-map";

vi.mock("../../src/Marker/marker-canvas", () => ({
  getMarkerCanvasPadding: vi.fn(() => 6),
  drawMarkerCanvas: vi.fn(() => ({
    canvas: { width: 2, height: 2, getContext: () => ({ getImageData: () => new ImageData(2, 2) }) },
    pixelRatio: 2,
    padding: 0,
  })),
}));

vi.mock("../../src/Marker/marker-text-fit", () => ({
  onLabelFontLoad: vi.fn(() => Promise.resolve()),
}));

const data = (): FeatureCollection => ({
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: { mag: 4.2, name: "a" }, geometry: { type: "Point", coordinates: [0, 0] } }],
});

let frames: FrameRequestCallback[];

function flushFrames() {
  const queued = frames;
  frames = [];
  for (const callback of queued) callback(0);
}

/** A style layer as the mock map stores it. */
type Sublayer = { id: string; type: string; source?: unknown; filter?: unknown; paint?: Record<string, unknown>; layout?: Record<string, unknown> };

const POINTS_ONLY = ["==", ["geometry-type"], "Point"];

/** The `addPoint` options matching circles styling, which uses the data layers' shared names. */
function toAddPointOptions({ color, radius, minRadius, maxRadius, opacity, ...rest }: PointLayerCirclesStyling): Partial<PointLayerOptions> {
  return {
    ...rest,
    pointColor: color as PointLayerOptions["pointColor"],
    ...(radius !== undefined ? { pointRadius: radius as PointLayerOptions["pointRadius"] } : {}),
    ...(minRadius !== undefined ? { minPointRadius: minRadius } : {}),
    ...(maxRadius !== undefined ? { maxPointRadius: maxRadius } : {}),
    ...(opacity !== undefined ? { pointOpacity: opacity as PointLayerOptions["pointOpacity"] } : {}),
  };
}

describe("PointLayer", () => {
  let mock: MockStyleMap;

  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
    mock = createMockStyleMap({ styleId: "streets-v2" });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  //#region Circles

  describe("circles mode", () => {
    const styling = { color: "#e63946" };

    it("is the default mode", () => {
      const layer = new PointLayer({ data: data(), styling });
      mock.map.addLayer(layer);

      expect(layer.mode).toBe("circles");
      expect(layer.getSublayerIds()).toEqual([`${layer.id}-point`]);
      expect(mock.sources.get(layer.getSourceId())?.spec).toMatchObject({ type: "geojson", cluster: false });
    });

    it("clusters through collisionBehaviour, with cluster, point and count label sublayers", () => {
      const layer = new PointLayer({ data: data(), styling, collisionBehaviour: "cluster" });
      mock.map.addLayer(layer);

      expect(mock.sources.get(layer.getSourceId())?.spec).toMatchObject({ cluster: true });
      expect(layer.getSublayerIds()).toEqual([`${layer.id}-cluster`, `${layer.id}-point`, `${layer.id}-label`]);
    });

    it("rebuilds the source when clustering is switched, and not for the same value", () => {
      const layer = new PointLayer({ data: data(), styling });
      mock.map.addLayer(layer);

      layer.setCollisionBehaviour("always-show");
      expect(frames).toHaveLength(0);

      layer.setCollisionBehaviour("cluster");
      flushFrames();

      expect(layer.getCollisionBehaviour()).toBe("cluster");
      expect(mock.sources.get(layer.getSourceId())?.spec).toMatchObject({ cluster: true });
      expect(layer.getSublayerIds()).toContain(`${layer.id}-cluster`);
    });

    it("requires a colour", () => {
      expect(() => new PointLayer({ data: data(), styling: {} as PointLayerCirclesStyling })).toThrow("`styling.color` is required");
    });

    it("keeps its colour when reset, with a warning", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const layer = new PointLayer({ data: data(), styling });
      mock.map.addLayer(layer);

      layer.setStyling({ color: undefined });
      flushFrames();

      expect(layer.getStyling().color).toBe("#e63946");
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"color" is required'));
      warn.mockRestore();
    });

    it("draws points only, on every sublayer", () => {
      const layer = new PointLayer({ data: data(), styling, collisionBehaviour: "cluster" });
      mock.map.addLayer(layer);

      const filters = layer.getSublayerIds().map((id) => (mock.map.getLayer(id) as Sublayer).filter);
      expect(filters).toEqual([
        ["all", POINTS_ONLY, ["has", "point_count"]],
        ["all", POINTS_ONLY, ["!", ["has", "point_count"]]],
        ["all", POINTS_ONLY, ["has", "point_count"]],
      ]);
    });

    it("passes colour, radius and opacity expressions through as they are", () => {
      const color = ["match", ["get", "name"], "a", "#ff0000", "#0000ff"];
      const radius = ["*", 2, ["get", "mag"]];
      const opacity = ["interpolate", ["linear"], ["zoom"], 0, 0.2, 10, 1];
      const layer = new PointLayer({ data: data(), styling: { color, radius, opacity, property: "mag" } as PointLayerCirclesStyling });
      mock.map.addLayer(layer);

      const paint = (mock.map.getLayer(`${layer.id}-point`) as Sublayer).paint;
      expect(paint?.["circle-color"]).toEqual(color);
      expect(paint?.["circle-radius"]).toEqual(radius);
      expect(paint?.["circle-opacity"]).toEqual(opacity);
    });

    it("keeps a radius expression over the ramp-driven radius", () => {
      const radius = ["*", 2, ["get", "mag"]];
      const layer = new PointLayer({ data: data(), styling: { color: ColorRampCollection.TURBO.scale(1, 7), property: "mag", radius } as PointLayerCirclesStyling });
      mock.map.addLayer(layer);

      expect((mock.map.getLayer(`${layer.id}-point`) as Sublayer).paint?.["circle-radius"]).toEqual(radius);
    });

    const textColorOf = (layer: PointLayer) => (mock.map.getLayer(`${layer.id}-label`) as Sublayer).paint?.["text-color"] as unknown[];

    it("hides labels where the circle is too small to hold them", () => {
      const layer = new PointLayer({ data: data(), styling: { ...styling, property: "mag", showLabel: true, radius: 6, labelSize: 12, zoomCompensation: false } });
      mock.map.addLayer(layer);

      expect(textColorOf(layer)).toEqual(["case", [">=", ["-", ["*", 2, 6], 2], 12], "#fff", "rgba(0, 0, 0, 0)"]);
    });

    it("checks a zoom-dependent radius at each stop of its zoom ramp", () => {
      const layer = new PointLayer({ data: data(), styling: { ...styling, property: "mag", showLabel: true, radius: 6, labelSize: 12 } });
      mock.map.addLayer(layer);

      const radius = (mock.map.getLayer(`${layer.id}-point`) as Sublayer).paint?.["circle-radius"] as unknown[];
      const [, , zoomInput, ...stops] = radius;
      const textColor = textColorOf(layer);

      expect(zoomInput).toEqual(["zoom"]);
      expect(textColor.slice(0, 2)).toEqual(["step", ["zoom"]]);
      // one case per ramp stop: the first is the step's base, the rest follow their zoom
      expect(textColor[2]).toEqual(["case", [">=", ["-", ["*", 2, stops[1]], 2], 12], "#fff", "rgba(0, 0, 0, 0)"]);
      expect(textColor.slice(3).filter((_, i) => i % 2 === 0)).toEqual(stops.filter((_, i) => i % 2 === 0).slice(1));
    });

    it("leaves labels unchecked on a zoom-dependent radius expression, which can't be nested", () => {
      const radius = ["step", ["zoom"], 4, 10, 12];
      const layer = new PointLayer({ data: data(), styling: { ...styling, property: "mag", showLabel: true, radius } as PointLayerCirclesStyling });
      mock.map.addLayer(layer);

      expect(textColorOf(layer)).toBe("#fff");
    });

    it("checks a data-driven cluster radius per feature", () => {
      const layer = new PointLayer({ data: data(), styling, collisionBehaviour: "cluster" });
      mock.map.addLayer(layer);

      const radius = (mock.map.getLayer(`${layer.id}-cluster`) as Sublayer).paint?.["circle-radius"];

      expect(textColorOf(layer)).toEqual(["case", [">=", ["-", ["*", 2, radius], 2], 12], "#fff", "rgba(0, 0, 0, 0)"]);
    });

    //#region addPoint Parity

    describe("matches addPoint", () => {
      const ramp = ColorRampCollection.TURBO.scale(1, 7);
      const cases: [string, PointLayerCirclesStyling, boolean][] = [
        ["a plain colour", { color: "#e63946" }, false],
        ["a colour ramp driven by a property", { color: ramp, property: "mag" }, false],
        ["a fixed radius with an outline", { color: "#1d3557", radius: 14, outline: true }, false],
        ["no zoom compensation, map-aligned", { color: "#e63946", zoomCompensation: false, alignOnViewport: false }, false],
        ["a radius range and opacity", { color: ramp, property: "mag", minRadius: 4, maxRadius: 20, opacity: 0.6 }, false],
        ["clusters", { color: "#e63946" }, true],
        ["clusters with a ramp and outline", { color: ramp, outline: true }, true],
      ];

      /** The helper's and the layer's sublayers by role, without ids, sources, visibility, the label colour (which only PointLayer fits to the circle), and the geometry filter (which only PointLayer has). */
      function comparable(layers: Sublayer[]) {
        return layers.map((layer) => {
          const copy: Partial<Sublayer> = { ...layer, layout: { ...layer.layout }, paint: { ...layer.paint } };
          delete copy.id;
          delete copy.source;
          copy.filter = withoutGeometryFilter(copy.filter);
          delete copy.layout?.visibility;
          delete copy.paint?.["text-color"];
          return copy;
        });
      }

      function withoutGeometryFilter(filter: unknown): unknown {
        if (JSON.stringify(filter) === JSON.stringify(POINTS_ONLY)) return undefined;
        const parts = Array.isArray(filter) ? (filter as unknown[]) : [];
        if (parts[0] === "all" && JSON.stringify(parts[1]) === JSON.stringify(POINTS_ONLY)) return parts[2];
        return filter;
      }

      it.each(cases)("with %s", (_, styling, cluster) => {
        const helperMock = createMockStyleMap();
        // the deprecated helper is the reference here
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const ids = addPoint(helperMock.asSDKMap(), { data: data(), ...toAddPointOptions(styling), cluster, minzoom: 0, maxzoom: 23 });
        const helperLayers = [ids.clusterLayerId, ids.pointLayerId, ids.labelLayerId].filter(Boolean).map((id) => helperMock.map.getLayer(id) as Sublayer);
        const helperSource = helperMock.sources.get(ids.pointSourceId)?.spec;

        const layer = new PointLayer({ data: data(), styling, collisionBehaviour: cluster ? "cluster" : "always-show", minzoom: 0, maxzoom: 23 });
        mock.map.addLayer(layer);
        const layerLayers = layer.getSublayerIds().map((id) => mock.map.getLayer(id) as Sublayer);
        const layerSource = mock.sources.get(layer.getSourceId())?.spec;

        expect(comparable(layerLayers)).toEqual(comparable(helperLayers));
        expect(layerSource).toMatchObject({ cluster: (helperSource as { cluster?: boolean }).cluster ?? false });
      });
    });

    //#endregion
  });

  //#endregion

  //#region Markers

  describe("markers mode", () => {
    function addMarkers(options: Partial<ConstructorParameters<typeof PointLayer<"markers">>[0]> = {}) {
      const layer = new PointLayer({ mode: "markers", data: data(), styling: { marker: { shape: "square" }, label: "name" }, ...options });
      mock.map.addLayer(layer);
      return layer;
    }

    const iconImageOf = (layer: PointLayer<"markers">, sublayer: string) => (mock.map.getLayer(`${layer.id}-${sublayer}`) as Sublayer).layout?.["icon-image"] as unknown[];
    const iconImage = (layer: PointLayer<"markers">) => iconImageOf(layer, "marker");
    const prefixOf = (layer: PointLayer<"markers">) => iconImage(layer)[1] as string;

    it("renders one symbol sublayer and registers its image resolver before it", () => {
      // the default, minimize-by-priority, adds a dot layer beneath
      const layer = addMarkers({ collisionBehaviour: "always-show" });

      expect(layer.getSublayerIds()).toEqual([`${layer.id}-marker`]);
      expect(mock.resolvers).toHaveLength(1);
      const resolverOrder = mock.map.addMissingStyleImageResolver.mock.invocationCallOrder[0];
      const sublayerOrder = mock.map.addLayer.mock.invocationCallOrder.at(-1) ?? 0;
      expect(resolverOrder).toBeLessThan(sublayerOrder);
    });

    it("resolves its own images through the map's resolver", async () => {
      const layer = addMarkers();
      const id = `${prefixOf(layer)}a`;

      await mock.resolvers[0](id);

      expect(mock.images.has(id)).toBe(true);
    });

    it("unregisters its resolver and removes its images when removed", async () => {
      const layer = addMarkers();
      const id = `${prefixOf(layer)}a`;
      await mock.resolvers[0](id);

      mock.map.removeLayer(layer.id);

      expect(mock.resolvers).toHaveLength(0);
      expect(mock.images.has(id)).toBe(false);
    });

    it("swaps the image prefix in place when the marker style changes", () => {
      const layer = addMarkers();
      const before = prefixOf(layer);
      mock.map.addSource.mockClear();

      layer.setStyling({ marker: { shape: "circle" } });
      flushFrames();

      expect(prefixOf(layer)).not.toBe(before);
      expect(mock.map.addSource).not.toHaveBeenCalled();
    });

    it("changes only the layer's opacity, keeping its images, for an opacity change", () => {
      const layer = addMarkers();
      const before = prefixOf(layer);

      layer.setStyling({ marker: { shape: "square", opacity: 0.4 } });
      flushFrames();

      expect(prefixOf(layer)).toBe(before);
      expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-marker`, "icon-opacity", 0.4);
    });

    it("redraws for the new style's adaptive colours after setStyle", () => {
      const layer = addMarkers();
      const before = prefixOf(layer);

      mock.setStyleId("dataviz-dark");
      mock.setStyle(["base"], { diff: false });

      expect(prefixOf(layer)).not.toBe(before);
      expect(layer.getStyling().marker?.innerColor).toBe(getAdaptiveColors("dataviz-dark", "square").innerColor);
    });

    it("shares the map's resolver slot with other marker layers", async () => {
      const a = addMarkers();
      const b = addMarkers();

      expect(mock.resolvers).toHaveLength(2);
      mock.map.removeLayer(a.id);
      expect(mock.resolvers).toHaveLength(1);

      const id = `${prefixOf(b)}x`;
      await mock.resolvers[0](id);
      expect(mock.images.has(id)).toBe(true);
    });

    it("labels markers from a property or an expression", () => {
      expect(iconImage(addMarkers({ styling: { label: "name" } }))[2]).toEqual(["to-string", ["get", "name"]]);
      expect(iconImage(addMarkers({ styling: { label: ["get", "mag"] } }))[2]).toEqual(["to-string", ["get", "mag"]]);
    });

    it("clusters the source only under the cluster behaviour", () => {
      expect(mock.sources.get(addMarkers().getSourceId())?.spec).toMatchObject({ cluster: false });
      expect(mock.sources.get(addMarkers({ collisionBehaviour: "cluster" }).getSourceId())?.spec).toMatchObject({ cluster: true });
    });

    it("rebuilds its sublayers for each collision behaviour", () => {
      const layer = addMarkers();
      const sublayers = (behaviour: Parameters<typeof layer.setCollisionBehaviour>[0]) => {
        layer.setCollisionBehaviour(behaviour);
        flushFrames();
        return layer.getSublayerIds().map((id) => id.slice(layer.id.length + 1));
      };

      expect(sublayers("minimize-by-priority")).toEqual(["dot", "marker"]);
      expect(sublayers("cluster")).toEqual(["marker", "cluster"]);
      expect(sublayers("hide-by-priority")).toEqual(["marker"]);
      expect(mock.sources.get(layer.getSourceId())?.spec).toMatchObject({ cluster: false });
    });

    it("resolves its dot and cluster images too", async () => {
      const layer = addMarkers({ collisionBehaviour: "minimize-by-priority" });
      const dotId = (mock.map.getLayer(`${layer.id}-dot`) as Sublayer).layout?.["icon-image"] as string;

      await mock.resolvers[0](dotId);
      layer.setCollisionBehaviour("cluster");
      flushFrames();
      const clusterId = `${iconImageOf(layer, "cluster")[1] as string}12`;
      await mock.resolvers[0](clusterId);

      expect(mock.images.has(dotId)).toBe(true);
      expect(mock.images.has(clusterId)).toBe(true);
    });

    it("updates the sort key in place when the priority changes", () => {
      const layer = addMarkers({ collisionBehaviour: "hide-by-priority" });
      mock.map.addSource.mockClear();

      layer.setStyling({ priority: ["get", "mag"] });
      flushFrames();

      expect(mock.map.setLayoutProperty).toHaveBeenCalledWith(`${layer.id}-marker`, "symbol-sort-key", ["-", ["get", "mag"]]);
      expect(mock.map.addSource).not.toHaveBeenCalled();
    });
  });

  //#endregion
});
