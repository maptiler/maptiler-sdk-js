import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExpressionSpecification, FilterSpecification } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import type { SourceSpecification } from "maplibre-gl";
import type { Map as SDKMap } from "../../src/Map";
import { config } from "../../src/config";
import { DataLayer, type DataLayerConstructorOptions, type SublayerSpecification } from "../../src/data-layers/DataLayer";
import { moveLayerWithSublayers, resolveBeforeId } from "../../src/data-layers/registry";
import { createMockStyleMap, type MockStyleMap } from "./mock-style-map";

//#region Test Layer

type TestStyle = {
  color?: string;
  halo?: boolean;
};

/** Two paint-path props and one structural one (`halo` adds a sublayer, so needs a rebuild). */
class TestLayer extends DataLayer<TestStyle, "circles"> {
  constructor(options: DataLayerConstructorOptions<TestStyle>) {
    super("test-layer", "circles", options);
  }

  protected addSublayers(map: SDKMap): void {
    const style = this.resolveStyle();
    if (style.halo) {
      this.addSublayer(map, { id: `${this.id}-halo`, type: "circle", source: this.getSourceId(), paint: { "circle-color": style.color } });
    }
    this.addSublayer(map, { id: `${this.id}-circle`, type: "circle", source: this.getSourceId(), paint: { "circle-color": style.color } });
  }

  protected applyStyle(changed: Set<keyof TestStyle>): boolean {
    if (changed.has("halo")) return false;
    const style = this.resolveStyle();
    for (const id of this.getSublayerIds()) this.map?.setPaintProperty(id, "circle-color", style.color);
    return true;
  }

  protected resolveStyle(): TestStyle {
    return { color: "#ff0000", halo: false, ...this.style };
  }
}

type SyncStyle = {
  color?: string;
  radius?: number;
  sortKey?: number;
  onlyLarge?: boolean;
  outline?: boolean;
  heatmap?: boolean;
};

/** Styles through `syncSublayers`, as real layers do: the specs are rebuilt from the style, and synced onto the live sublayers. */
class SyncTestLayer extends DataLayer<SyncStyle, "circles"> {
  constructor(options: DataLayerConstructorOptions<SyncStyle>) {
    super("sync-test-layer", "circles", options);
  }

  /** The sublayer specs for the current style, bottom first. `outline` adds a sublayer, `heatmap` retypes the main one. */
  private buildSpecs(): SublayerSpecification[] {
    const style = this.resolveStyle();
    const source = this.getSourceId();
    const specs: SublayerSpecification[] = [];

    if (style.outline) specs.push({ id: `${this.id}-outline`, type: "circle", source, paint: { "circle-color": "#000000" } });

    if (style.heatmap) {
      specs.push({ id: `${this.id}-main`, type: "heatmap", source });
    } else {
      specs.push({
        id: `${this.id}-main`,
        type: "circle",
        source,
        paint: { "circle-color": style.color, ...(style.radius !== undefined && { "circle-radius": style.radius }) },
        layout: { "circle-sort-key": style.sortKey },
        ...(style.onlyLarge && { filter: [">", ["get", "size"], 10] }),
      });
    }

    return specs;
  }

  protected addSublayers(map: SDKMap): void {
    for (const spec of this.buildSpecs()) this.addSublayer(map, spec);
  }

  protected applyStyle(): boolean {
    return this.syncSublayers(this.buildSpecs());
  }

  protected resolveStyle(): SyncStyle {
    return { color: "#ff0000", sortKey: 0, ...this.style };
  }
}

const POINTS_ONLY: ExpressionSpecification = ["==", ["geometry-type"], "Point"];

/** A test layer drawing points only, with its circle sublayer filtered to features that have `mag` while `halo` is on. */
class PointsOnlyTestLayer extends TestLayer {
  protected override readonly geometryFilter = POINTS_ONLY;

  protected override addSublayers(map: SDKMap): void {
    const filter: FilterSpecification | undefined = this.resolveStyle().halo ? ["has", "mag"] : undefined;
    this.addSublayer(map, { id: `${this.id}-circle`, type: "circle", source: this.getSourceId(), ...(filter ? { filter } : {}) });
  }

  protected override applyStyle(): boolean {
    const filter: FilterSpecification | undefined = this.resolveStyle().halo ? ["has", "mag"] : undefined;
    return this.syncSublayers([{ id: `${this.id}-circle`, type: "circle", source: this.getSourceId(), ...(filter ? { filter } : {}) }]);
  }
}

/** A test layer whose `color` is required, so has no default to reset to. */
class RequiredColorTestLayer extends TestLayer {
  protected override isRequiredStyleKey(key: keyof TestStyle): boolean {
    return key === "color";
  }
}

const emptyData = (): FeatureCollection => ({ type: "FeatureCollection", features: [] });

const DATASET_ID = "0b1c6a2e-4f3d-4c8b-9a7e-2d5f8e1c3b4a";

//#endregion

//#region Frames

let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;

/** Runs every queued animation frame, as the browser would on the next frame. */
function flushFrames() {
  const queued = [...frames.values()];
  frames.clear();
  for (const callback of queued) callback(0);
}

//#endregion

describe("DataLayer", () => {
  let mock: MockStyleMap;

  beforeEach(() => {
    frames = new Map();
    nextFrame = 1;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.set(nextFrame, callback);
      return nextFrame++;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    mock = createMockStyleMap();
    mock.map.addLayer({ id: "base", type: "background" });
    mock.map.addLayer({ id: "labels", type: "background" });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** Routes the mock's `addLayer` and `moveLayer` through the data layer registry, as the SDK map's do. */
  function routeThroughRegistry() {
    const add = mock.map.addLayer.getMockImplementation() as (layer: { id: string }, beforeId?: string) => unknown;
    const move = mock.map.moveLayer.getMockImplementation() as (id: string, beforeId?: string) => unknown;
    mock.map.addLayer.mockImplementation((layer: { id: string }, beforeId?: string) => add(layer, resolveBeforeId(mock.map, beforeId, layer.id)));
    mock.map.moveLayer.mockImplementation((id: string, beforeId?: string) => {
      moveLayerWithSublayers(mock.map, id, beforeId, move);
      return mock.map;
    });
  }

  function addLayer(options: Partial<DataLayerConstructorOptions<TestStyle>> = {}, beforeId?: string) {
    const layer = new TestLayer({ data: emptyData(), ...options });
    mock.map.addLayer(layer, beforeId);
    return layer;
  }

  //#region Adding

  describe("adding", () => {
    it("adds its source and sublayers directly beneath the controller", () => {
      const layer = addLayer({}, "labels");

      expect(mock.sources.has(layer.getSourceId())).toBe(true);
      expect(mock.map.getLayersOrder()).toEqual(["base", `${layer.id}-circle`, layer.id, "labels"]);
      expect(layer.getSublayerIds()).toEqual([`${layer.id}-circle`]);
    });

    it("applies the visibility and zoom range given at construction to its sublayers", () => {
      const layer = addLayer({ visible: false, minzoom: 3, maxzoom: 12 });
      const sublayer = mock.map.getLayer(`${layer.id}-circle`) as { layout: { visibility: string }; minzoom: number; maxzoom: number };

      expect(sublayer.layout.visibility).toBe("none");
      expect([sublayer.minzoom, sublayer.maxzoom]).toEqual([3, 12]);
    });

    it("builds from changes made before it was added, without touching a map", () => {
      const layer = new TestLayer({ data: emptyData() });
      layer.setStyle({ color: "#00ff00" }).setVisible(false);
      expect(frames.size).toBe(0);

      mock.map.addLayer(layer);
      const sublayer = mock.map.getLayer(`${layer.id}-circle`) as { paint: Record<string, unknown>; layout: Record<string, unknown> };

      expect(sublayer.paint["circle-color"]).toBe("#00ff00");
      expect(sublayer.layout.visibility).toBe("none");
    });

    it("uses the given id", () => {
      const layer = addLayer({ id: "my-layer" });
      expect(layer.id).toBe("my-layer");
      expect(mock.map.getLayer("my-layer")).toBe(layer);
    });
  });

  //#endregion

  //#region Updates

  describe("updates", () => {
    it("batches changes into one flush per frame, applying the last data", () => {
      const layer = addLayer();
      const source = mock.sources.get(layer.getSourceId());
      const last = emptyData();

      layer.setData(emptyData()).setData(emptyData()).setData(last);
      expect(source?.setData).not.toHaveBeenCalled();
      expect(frames.size).toBe(1);

      flushFrames();
      expect(source?.setData).toHaveBeenCalledTimes(1);
      expect(source?.setData).toHaveBeenCalledWith(last);
      expect(layer.getData()).toBe(last);
    });

    it("applies paint-path style in place, without rebuilding", () => {
      const layer = addLayer();
      mock.map.addSource.mockClear();

      layer.setStyle({ color: "#0000ff" });
      flushFrames();

      expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-circle`, "circle-color", "#0000ff");
      expect(mock.map.addSource).not.toHaveBeenCalled();
      expect(layer.getStyle().color).toBe("#0000ff");
    });

    it("rebuilds for structural style, keeping sublayers beneath the controller", () => {
      const layer = addLayer({}, "labels");

      layer.setStyle({ halo: true });
      flushFrames();

      expect(mock.map.getLayersOrder()).toEqual(["base", `${layer.id}-halo`, `${layer.id}-circle`, layer.id, "labels"]);
      expect(layer.getSublayerIds()).toEqual([`${layer.id}-halo`, `${layer.id}-circle`]);
    });

    it("resets a style key set to undefined to its default", () => {
      const layer = addLayer({ style: { color: "#00ff00" } });

      layer.setStyle({ color: undefined });
      flushFrames();

      expect(layer.getStyle().color).toBe("#ff0000");
      expect(mock.map.setPaintProperty).toHaveBeenLastCalledWith(`${layer.id}-circle`, "circle-color", "#ff0000");
    });

    it("keeps a required style key set to undefined, with a warning", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const layer = new RequiredColorTestLayer({ data: emptyData(), style: { color: "#00ff00" } });
      mock.map.addLayer(layer);

      layer.setStyle({ color: undefined, halo: true });
      flushFrames();

      expect(layer.getStyle().color).toBe("#00ff00");
      expect(layer.getStyle().halo).toBe(true);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"color" is required'));
      warn.mockRestore();
    });

    it("sets visibility and zoom range on every sublayer", () => {
      const layer = addLayer({ style: { halo: true } });

      layer.setVisible(false).setZoomRange(2, 10);
      flushFrames();

      for (const id of layer.getSublayerIds()) {
        expect(mock.map.setLayoutProperty).toHaveBeenCalledWith(id, "visibility", "none");
        expect(mock.map.setLayerZoomRange).toHaveBeenCalledWith(id, 2, 10);
      }
      expect(layer.isVisible()).toBe(false);
      expect(layer.getZoomRange()).toEqual([2, 10]);
    });

    it("hides sublayers added by a rebuild while the layer is hidden", () => {
      const layer = addLayer();

      layer.setVisible(false);
      flushFrames();
      layer.setStyle({ halo: true });
      flushFrames();

      const halo = mock.map.getLayer(`${layer.id}-halo`) as { layout: { visibility: string } };
      expect(halo.layout.visibility).toBe("none");
    });
  });

  //#endregion

  //#region Syncing Sublayers

  describe("syncing sublayers", () => {
    function addSyncLayer(style: SyncStyle = {}) {
      const layer = new SyncTestLayer({ data: emptyData(), style });
      mock.map.addLayer(layer, "labels");
      mock.map.addSource.mockClear();
      mock.map.setPaintProperty.mockClear();
      mock.map.setLayoutProperty.mockClear();
      mock.map.setFilter.mockClear();
      return layer;
    }

    it("applies a changed paint property in place, leaving the rest alone", () => {
      const layer = addSyncLayer({ radius: 4 });

      layer.setStyle({ color: "#00ff00" });
      flushFrames();

      expect(mock.map.setPaintProperty.mock.calls).toEqual([[`${layer.id}-main`, "circle-color", "#00ff00"]]);
      expect(mock.map.setLayoutProperty).not.toHaveBeenCalled();
      expect(mock.map.addSource).not.toHaveBeenCalled();
    });

    it("resets a paint property that is no longer set", () => {
      const layer = addSyncLayer({ radius: 4 });

      layer.setStyle({ radius: undefined });
      flushFrames();

      expect(mock.map.setPaintProperty.mock.calls).toEqual([[`${layer.id}-main`, "circle-radius", undefined]]);
    });

    it("applies a changed layout property in place, without touching visibility", () => {
      const layer = addSyncLayer();
      layer.setVisible(false);
      flushFrames();
      mock.map.setLayoutProperty.mockClear();

      layer.setStyle({ sortKey: 2 });
      flushFrames();

      expect(mock.map.setLayoutProperty.mock.calls).toEqual([[`${layer.id}-main`, "circle-sort-key", 2]]);
      expect((mock.map.getLayer(`${layer.id}-main`) as { layout: { visibility: string } }).layout.visibility).toBe("none");
    });

    it("sets a filter, and clears it with null", () => {
      const layer = addSyncLayer();

      layer.setStyle({ onlyLarge: true });
      flushFrames();
      layer.setStyle({ onlyLarge: undefined });
      flushFrames();

      expect(mock.map.setFilter.mock.calls).toEqual([
        [`${layer.id}-main`, [">", ["get", "size"], 10]],
        [`${layer.id}-main`, null],
      ]);
    });

    it("makes no calls when the specs haven't changed", () => {
      const layer = addSyncLayer({ color: "#00ff00" });

      layer.setStyle({ color: "#00ff00" });
      flushFrames();

      expect(mock.map.setPaintProperty).not.toHaveBeenCalled();
      expect(mock.map.setLayoutProperty).not.toHaveBeenCalled();
      expect(mock.map.setFilter).not.toHaveBeenCalled();
    });

    it("rebuilds when a sublayer is added or removed, keeping the order beneath the controller", () => {
      const layer = addSyncLayer();

      layer.setStyle({ outline: true });
      flushFrames();

      expect(mock.map.addSource).toHaveBeenCalledTimes(1);
      expect(mock.map.getLayersOrder()).toEqual(["base", `${layer.id}-outline`, `${layer.id}-main`, layer.id, "labels"]);

      layer.setStyle({ outline: undefined });
      flushFrames();

      expect(mock.map.addSource).toHaveBeenCalledTimes(2);
      expect(mock.map.getLayersOrder()).toEqual(["base", `${layer.id}-main`, layer.id, "labels"]);
    });

    it("rebuilds when a sublayer changes type", () => {
      const layer = addSyncLayer();

      layer.setStyle({ heatmap: true });
      flushFrames();

      expect(mock.map.addSource).toHaveBeenCalledTimes(1);
      expect((mock.map.getLayer(`${layer.id}-main`) as { type: string }).type).toBe("heatmap");
    });

    it("syncs against the specs of the last rebuild", () => {
      const layer = addSyncLayer();
      layer.setStyle({ outline: true });
      flushFrames();
      mock.map.setPaintProperty.mockClear();

      layer.setStyle({ color: "#0000ff" });
      flushFrames();

      expect(mock.map.addSource).toHaveBeenCalledTimes(1);
      expect(mock.map.setPaintProperty.mock.calls).toEqual([[`${layer.id}-main`, "circle-color", "#0000ff"]]);
    });
  });

  //#endregion

  //#region Source Data

  describe("source data", () => {
    let apiKey: string;

    beforeEach(() => {
      apiKey = config.apiKey;
      config.apiKey = "test-key";
    });

    afterEach(() => {
      config.apiKey = apiKey;
      config.useEuEndpoints = false;
    });

    const sourceData = (layer: TestLayer) => (mock.sources.get(layer.getSourceId())?.spec as (SourceSpecification & { data?: unknown }) | undefined)?.data;

    it("hands GeoJSON to the source unchanged", () => {
      const data = emptyData();
      const layer = addLayer({ data });

      expect(sourceData(layer)).toBe(data);
    });

    it("hands a URL to the source unchanged", () => {
      const layer = addLayer({ data: "https://example.com/points.geojson" });

      expect(sourceData(layer)).toBe("https://example.com/points.geojson");
    });

    it("turns a dataset UUID into its MapTiler Cloud URL, keeping the UUID as the layer's data", () => {
      const layer = addLayer({ data: DATASET_ID });

      expect(sourceData(layer)).toBe(`https://api.maptiler.com/data/${DATASET_ID}/features.json?key=test-key`);
      expect(layer.getData()).toBe(DATASET_ID);
    });

    it("uses the EU host for a dataset UUID when EU endpoints are on", () => {
      config.useEuEndpoints = true;
      const layer = addLayer({ data: DATASET_ID });

      expect(sourceData(layer)).toBe(`https://api.maptiler.eu/data/${DATASET_ID}/features.json?key=test-key`);
    });

    it("resolves a dataset UUID passed to setData", () => {
      const layer = addLayer();

      layer.setData(DATASET_ID);
      flushFrames();

      expect(mock.sources.get(layer.getSourceId())?.setData).toHaveBeenCalledWith(`https://api.maptiler.com/data/${DATASET_ID}/features.json?key=test-key`);
    });
  });

  //#endregion

  //#region Geometry Filter

  describe("geometry filter", () => {
    it("leaves sublayers unfiltered without one", () => {
      const layer = addLayer();
      expect(mock.map.getLayer(`${layer.id}-circle`)).not.toHaveProperty("filter");
    });

    it("applies the geometry filter to an unfiltered sublayer", () => {
      const layer = new PointsOnlyTestLayer({ data: emptyData() });
      mock.map.addLayer(layer);

      expect((mock.map.getLayer(`${layer.id}-circle`) as { filter: unknown }).filter).toEqual(POINTS_ONLY);
    });

    it("combines the geometry filter with a sublayer's own filter", () => {
      const layer = new PointsOnlyTestLayer({ data: emptyData(), style: { halo: true } });
      mock.map.addLayer(layer);

      expect((mock.map.getLayer(`${layer.id}-circle`) as { filter: unknown }).filter).toEqual(["all", POINTS_ONLY, ["has", "mag"]]);
    });

    it("keeps the geometry filter when a sublayer's own filter changes in place", () => {
      const layer = new PointsOnlyTestLayer({ data: emptyData() });
      mock.map.addLayer(layer);

      layer.setStyle({ halo: true });
      flushFrames();
      expect(mock.map.setFilter).toHaveBeenLastCalledWith(`${layer.id}-circle`, ["all", POINTS_ONLY, ["has", "mag"]]);

      layer.setStyle({ halo: false });
      flushFrames();
      expect(mock.map.setFilter).toHaveBeenLastCalledWith(`${layer.id}-circle`, POINTS_ONLY);
    });
  });

  //#endregion

  //#region Shared Source

  describe("shared source", () => {
    it("draws another layer's source, added once", () => {
      const first = addLayer();
      const second = addLayer({ data: first });

      expect(second.getSourceId()).toBe(first.getSourceId());
      expect(mock.map.addSource).toHaveBeenCalledTimes(1);
      expect((mock.map.getLayer(`${second.id}-circle`) as { source: string }).source).toBe(first.getSourceId());
    });

    it("adds the source for whichever layer is added first", () => {
      const first = new TestLayer({ data: emptyData() });
      const second = new TestLayer({ data: first });

      mock.map.addLayer(second);
      expect(mock.sources.has(first.getSourceId())).toBe(true);
      mock.map.addLayer(first);
      expect(mock.map.addSource).toHaveBeenCalledTimes(1);
    });

    it("keeps the source while any layer drawing it is on the map, in either order", () => {
      for (const removeFirstLayerFirst of [true, false]) {
        const first = addLayer();
        const second = addLayer({ data: first });
        const [removed, kept] = removeFirstLayerFirst ? [first, second] : [second, first];

        mock.map.removeLayer(removed.id);
        expect(mock.sources.has(first.getSourceId())).toBe(true);
        expect(kept.getSublayerIds()).toHaveLength(1);

        mock.map.removeLayer(kept.id);
        expect(mock.sources.has(first.getSourceId())).toBe(false);
      }
    });

    it("shares the data, updating the source once from either layer", () => {
      const first = addLayer();
      const second = addLayer({ data: first });
      const source = mock.sources.get(first.getSourceId());
      const next = emptyData();

      second.setData(next);
      flushFrames();

      expect(source?.setData).toHaveBeenCalledTimes(1);
      expect(source?.setData).toHaveBeenCalledWith(next);
      expect(first.getData()).toBe(next);
      expect(second.getData()).toBe(next);
    });

    it("updates the source through a layer on the map when the one set isn't", () => {
      const first = new TestLayer({ data: emptyData() });
      const second = addLayer({ data: first });
      const next = emptyData();

      first.setData(next);
      flushFrames();

      expect(mock.sources.get(first.getSourceId())?.setData).toHaveBeenCalledWith(next);
      expect(second.getData()).toBe(next);
    });

    it("fires the data events on every layer sharing the source", () => {
      const first = addLayer();
      const second = addLayer({ data: first });
      const events: string[] = [];
      first.on("data", () => events.push("first"));
      second.on("data", () => events.push("second"));

      mock.fire("sourcedataloading", { sourceId: first.getSourceId() });
      mock.fire("sourcedata", { sourceId: first.getSourceId(), sourceDataType: "content", isSourceLoaded: true });

      expect(events).toEqual(["first", "second"]);
    });

    it("rebuilds both layers on one source after a style change", () => {
      const first = addLayer({}, "labels");
      const second = addLayer({ data: first }, "labels");

      mock.setStyle(["base", "labels"], { diff: false });
      mock.setStyle(["base", "labels"], { diff: true });

      expect(mock.sources.has(first.getSourceId())).toBe(true);
      expect(mock.map.getLayersOrder()).toEqual(["base", `${first.id}-circle`, first.id, `${second.id}-circle`, second.id, "labels"]);
    });

    it("rebuilds one layer without touching the other's source", () => {
      const first = addLayer();
      const second = addLayer({ data: first });
      mock.map.removeSource.mockClear();

      second.setStyle({ halo: true });
      flushFrames();

      expect(mock.map.removeSource).not.toHaveBeenCalled();
      expect(first.getSublayerIds()).toHaveLength(1);
    });
  });

  //#endregion

  //#region Data Events

  describe("data events", () => {
    function collectDataEvents(layer: TestLayer) {
      const events: string[] = [];
      layer.on("dataloading", () => events.push("dataloading"));
      layer.on("data", () => events.push("data"));
      layer.on("error", (e) => events.push(`error:${e.error.message}`));
      return events;
    }

    /** The `sourcedata*` sequence MapLibre fires for a GeoJSON load that ends with tiles reloading. */
    function fireLoad(sourceId: string, tiles = 2) {
      mock.fire("sourcedataloading", { sourceId });
      mock.fire("sourcedata", { sourceId, sourceDataType: "metadata", isSourceLoaded: true });
      mock.fire("sourcedata", { sourceId, sourceDataType: "content", isSourceLoaded: false });
      for (let i = 0; i < tiles; i++) mock.fire("sourcedataloading", { sourceId, tile: {} });
      for (let i = 0; i < tiles; i++) mock.fire("sourcedata", { sourceId, tile: {}, isSourceLoaded: i === tiles - 1 });
    }

    it("fires one dataloading and one data per load, ignoring tile loads and the early metadata event", () => {
      const layer = addLayer();
      const events = collectDataEvents(layer);

      fireLoad(layer.getSourceId(), 5);

      expect(events).toEqual(["dataloading", "data"]);
    });

    it("fires data on the content event when there are no tiles to reload", () => {
      const layer = addLayer();
      const events = collectDataEvents(layer);

      mock.fire("sourcedataloading", { sourceId: layer.getSourceId() });
      mock.fire("sourcedata", { sourceId: layer.getSourceId(), sourceDataType: "metadata", isSourceLoaded: true });
      mock.fire("sourcedata", { sourceId: layer.getSourceId(), sourceDataType: "content", isSourceLoaded: true });

      expect(events).toEqual(["dataloading", "data"]);
    });

    it("fires a single dataloading for a load that restarts before it finishes", () => {
      const layer = addLayer();
      const events = collectDataEvents(layer);

      mock.fire("sourcedataloading", { sourceId: layer.getSourceId() });
      mock.fire("sourcedataloading", { sourceId: layer.getSourceId() });
      fireLoad(layer.getSourceId());

      expect(events).toEqual(["dataloading", "data"]);
    });

    it("fires nothing for tile loads outside a data load, such as after panning", () => {
      const layer = addLayer();
      fireLoad(layer.getSourceId());
      const events = collectDataEvents(layer);

      mock.fire("sourcedataloading", { sourceId: layer.getSourceId(), tile: {} });
      mock.fire("sourcedata", { sourceId: layer.getSourceId(), tile: {}, isSourceLoaded: true });
      mock.fire("sourcedata", { sourceId: layer.getSourceId(), sourceDataType: "metadata", isSourceLoaded: true });

      expect(events).toEqual([]);
    });

    it("ends a load with error, after which the next load reports normally", () => {
      const layer = addLayer();
      const events = collectDataEvents(layer);

      mock.fire("sourcedataloading", { sourceId: layer.getSourceId() });
      mock.fire("error", { sourceId: layer.getSourceId(), error: new Error("failed") });
      fireLoad(layer.getSourceId());

      expect(events).toEqual(["dataloading", "error:failed", "dataloading", "data"]);
    });

    it("ignores other sources' events", () => {
      const layer = addLayer();
      const events = collectDataEvents(layer);

      fireLoad("some-other-source");
      mock.fire("error", { sourceId: "some-other-source", error: new Error("not ours") });

      expect(events).toEqual([]);
    });

    it("stops reporting once removed, and off() detaches a listener", () => {
      const layer = addLayer();
      const events = collectDataEvents(layer);
      const listener = vi.fn();
      layer.on("dataloading", listener).off("dataloading", listener);

      mock.map.removeLayer(layer.id);
      fireLoad(layer.getSourceId());

      expect(events).toEqual([]);
      expect(listener).not.toHaveBeenCalled();
    });

    describe("raised inside addLayer", () => {
      /** Makes addSource start a load right away, as MapLibre's GeoJSON source does. */
      beforeEach(() => {
        const addSource = mock.map.addSource.getMockImplementation();
        if (!addSource) throw new Error("addSource has no implementation");
        mock.map.addSource.mockImplementation((id: string, spec: SourceSpecification) => {
          const result: unknown = addSource(id, spec);
          mock.fire("sourcedataloading", { sourceId: id });
          return result;
        });
      });

      it("reaches a listener attached right after addLayer, once addLayer has returned", async () => {
        const layer = addLayer();
        const events = collectDataEvents(layer);
        expect(events).toEqual([]);

        await Promise.resolve();
        expect(events).toEqual(["dataloading"]);

        mock.fire("sourcedata", { sourceId: layer.getSourceId(), sourceDataType: "content", isSourceLoaded: true });
        expect(events).toEqual(["dataloading", "data"]);
      });

      it("keeps events that follow before then in order behind it", async () => {
        const layer = addLayer();
        const events = collectDataEvents(layer);

        mock.fire("sourcedata", { sourceId: layer.getSourceId(), sourceDataType: "content", isSourceLoaded: true });
        expect(events).toEqual([]);

        await Promise.resolve();
        expect(events).toEqual(["dataloading", "data"]);
      });

      it("drops them if the layer is removed before then", async () => {
        const layer = addLayer();
        const events = collectDataEvents(layer);

        mock.map.removeLayer(layer.id);
        await Promise.resolve();

        expect(events).toEqual([]);
      });

      it("reports the reload after a full setStyle the same way", async () => {
        const layer = addLayer();
        await Promise.resolve();
        const events = collectDataEvents(layer);

        mock.setStyle(["base"], { diff: false });
        expect(events).toEqual([]);

        await Promise.resolve();
        expect(events).toEqual(["dataloading"]);
      });
    });
  });

  //#endregion

  //#region Pointer Events

  describe("pointer events", () => {
    it("forwards pointer events from its sublayers", () => {
      const layer = addLayer();
      const onClick = vi.fn();
      layer.on("click", onClick);

      mock.fireOnLayer("click", `${layer.id}-circle`, { features: [{ id: 1 }] });

      expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ type: "click", features: [{ id: 1 }] }));
    });

    it("rebinds pointer events to the new sublayers after a rebuild", () => {
      const layer = addLayer();
      const onClick = vi.fn();
      layer.on("click", onClick);

      layer.setStyle({ halo: true });
      flushFrames();
      mock.fireOnLayer("click", `${layer.id}-halo`);

      expect(onClick).toHaveBeenCalledTimes(1);
      // one listener per pointer event type, not one per build
      expect(mock.layerListenerCount()).toBe(4);
    });
  });

  //#endregion

  //#region Style Changes

  describe("style changes", () => {
    it("moves the controller back beneath its layer after a diffed setStyle, and rebuilds beneath it", () => {
      const layer = addLayer({ style: { color: "#00ff00" } }, "labels");

      mock.setStyle(["base", "water", "labels", "top"], { diff: true });

      expect(mock.map.getLayersOrder()).toEqual(["base", "water", `${layer.id}-circle`, layer.id, "labels", "top"]);
      expect(mock.sources.has(layer.getSourceId())).toBe(true);
      const sublayer = mock.map.getLayer(`${layer.id}-circle`) as { paint: Record<string, unknown> };
      expect(sublayer.paint["circle-color"]).toBe("#00ff00");
    });

    it("moves the controller to the top after a diffed setStyle without its layer", () => {
      const layer = addLayer({}, "labels");

      mock.setStyle(["base", "water"], { diff: true });

      expect(mock.map.getLayersOrder()).toEqual(["base", "water", `${layer.id}-circle`, layer.id]);
    });

    it("re-adds itself beneath its layer after a full setStyle", () => {
      const layer = addLayer({ visible: false }, "labels");

      mock.setStyle(["base", "labels"], { diff: false });

      expect(mock.map.getLayersOrder()).toEqual(["base", `${layer.id}-circle`, layer.id, "labels"]);
      const sublayer = mock.map.getLayer(`${layer.id}-circle`) as { layout: { visibility: string } };
      expect(sublayer.layout.visibility).toBe("none");
    });

    it("keeps a single set of map listeners across style changes", () => {
      addLayer();

      mock.setStyle(["base"], { diff: false });
      mock.setStyle(["base"], { diff: true });
      mock.setStyle(["base"], { diff: false });

      expect(mock.listenerCount("style.load")).toBe(1);
      expect(mock.listenerCount("sourcedata")).toBe(1);
    });
  });

  //#endregion

  //#region Change Events

  describe("change events", () => {
    it("fires stylechange once per flush, after the map shows it, with every key set", () => {
      const layer = addLayer();
      const listener = vi.fn();
      layer.on("stylechange", listener);

      layer.setStyle({ color: "#0000ff" }).setStyle({ halo: true });
      expect(listener).not.toHaveBeenCalled();

      flushFrames();
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ type: "stylechange", target: layer, keys: ["color", "halo"], style: { color: "#0000ff", halo: true } });
      expect(mock.map.getLayer(`${layer.id}-halo`)).toBeDefined();
    });

    it("fires zoomrangechange and visibilitychange with the new values", () => {
      const layer = addLayer();
      const onZoomRange = vi.fn();
      const onVisibility = vi.fn();
      layer.on("zoomrangechange", onZoomRange).on("visibilitychange", onVisibility);

      layer.setZoomRange(2, 10, 1).setVisible(false);
      flushFrames();

      expect(onZoomRange).toHaveBeenCalledWith({ type: "zoomrangechange", target: layer, minzoom: 2, maxzoom: 10, fade: 1 });
      expect(onVisibility).toHaveBeenCalledWith({ type: "visibilitychange", target: layer, visible: false });
    });

    it("doesn't fire for display state set back to what it was", () => {
      const layer = addLayer({ minzoom: 2, maxzoom: 10 });
      const onZoomRange = vi.fn();
      const onVisibility = vi.fn();
      layer.on("zoomrangechange", onZoomRange).on("visibilitychange", onVisibility);

      layer.setVisible(false).setVisible(true).setZoomRange(2, 10);
      flushFrames();

      expect(onZoomRange).not.toHaveBeenCalled();
      expect(onVisibility).not.toHaveBeenCalled();
    });

    it("doesn't fire for changes made before the layer was added", () => {
      const layer = new TestLayer({ data: emptyData() });
      const listener = vi.fn();
      layer.on("stylechange", listener).on("visibilitychange", listener).on("zoomrangechange", listener);

      layer.setStyle({ color: "#00ff00" }).setVisible(false).setZoomRange(1, 5);
      mock.map.addLayer(layer);
      flushFrames();

      expect(listener).not.toHaveBeenCalled();
    });

    it.each([
      ["a diffed", true],
      ["a full", false],
    ])("still fires for changes made just before %s map.setStyle()", (_, diff) => {
      const layer = addLayer();
      const listener = vi.fn();
      layer.on("stylechange", listener).on("visibilitychange", listener).on("zoomrangechange", listener);

      layer.setStyle({ color: "#0000ff" }).setVisible(false).setZoomRange(2, 10);
      mock.setStyle(["base"], { diff });
      flushFrames();

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: "stylechange", keys: ["color"] }));
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: "visibilitychange", visible: false }));
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: "zoomrangechange", minzoom: 2, maxzoom: 10 }));
    });

    it("drops the events of a flush cancelled by removal", () => {
      const layer = addLayer();
      const listener = vi.fn();
      layer.on("visibilitychange", listener);

      layer.setVisible(false);
      mock.map.removeLayer(layer.id);
      flushFrames();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  //#endregion

  //#region Add & Remove Events

  describe("add and remove events", () => {
    it("fires add and remove with the map", () => {
      const layer = new TestLayer({ data: emptyData() });
      const onAdd = vi.fn();
      const onRemove = vi.fn();
      layer.on("add", onAdd).on("remove", onRemove);

      mock.map.addLayer(layer);
      expect(onAdd).toHaveBeenCalledWith({ type: "add", target: layer, map: mock.map });
      // sublayers are in place by the time it fires
      expect(mock.map.getLayer(`${layer.id}-circle`)).toBeDefined();

      mock.map.removeLayer(layer.id);
      expect(onRemove).toHaveBeenCalledWith({ type: "remove", target: layer, map: mock.map });
    });

    it("fires remove when the map is removed", () => {
      const layer = addLayer();
      const onRemove = vi.fn();
      layer.on("remove", onRemove);

      mock.fire("remove");

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("doesn't fire add, remove or move when it puts itself back after setStyle", () => {
      const layer = addLayer({}, "labels");
      const listener = vi.fn();
      layer.on("add", listener).on("remove", listener).on("move", listener);
      routeThroughRegistry();

      mock.setStyle(["base", "labels"], { diff: false });
      mock.setStyle(["base", "labels"], { diff: true });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  //#endregion

  //#region Moving

  describe("moving", () => {
    beforeEach(routeThroughRegistry);

    const moveLayer = (id: string, beforeId?: string) => {
      mock.map.moveLayer(id, beforeId);
    };

    it("moves a data layer together with its sublayers, and fires move", () => {
      const layer = addLayer({ style: { halo: true } });
      const onMove = vi.fn();
      layer.on("move", onMove);

      moveLayer(layer.id, "labels");

      expect(mock.map.getLayersOrder()).toEqual(["base", `${layer.id}-halo`, `${layer.id}-circle`, layer.id, "labels"]);
      expect(onMove).toHaveBeenCalledWith({ type: "move", target: layer, beforeId: "labels" });
    });

    it("moves a data layer to the top without a beforeId", () => {
      const layer = addLayer({}, "base");

      moveLayer(layer.id);

      expect(mock.map.getLayersOrder()).toEqual(["base", "labels", `${layer.id}-circle`, layer.id]);
    });

    it("places a layer moved or added before a data layer beneath its sublayers", () => {
      const below = addLayer();
      const layer = addLayer({ style: { halo: true } });

      moveLayer(below.id, layer.id);
      mock.map.addLayer({ id: "plain", type: "background" }, layer.id);

      expect(mock.map.getLayersOrder()).toEqual(["base", "labels", `${below.id}-circle`, below.id, "plain", `${layer.id}-halo`, `${layer.id}-circle`, layer.id]);
    });

    it("leaves other layers' moves as they were", () => {
      const layer = addLayer();
      const onMove = vi.fn();
      layer.on("move", onMove);

      moveLayer("base");

      expect(mock.map.getLayersOrder()).toEqual(["labels", `${layer.id}-circle`, layer.id, "base"]);
      expect(onMove).not.toHaveBeenCalled();
    });

    it("keeps its new position across a full setStyle", () => {
      const layer = addLayer();

      moveLayer(layer.id, "labels");
      mock.setStyle(["base", "labels"], { diff: false });

      expect(mock.map.getLayersOrder()).toEqual(["base", `${layer.id}-circle`, layer.id, "labels"]);
    });

    it("remembers a data layer above it by its id, not its sublayer, across a full setStyle", () => {
      const above = addLayer();
      const layer = addLayer();

      moveLayer(layer.id, above.id);
      mock.setStyle(["base", "labels"], { diff: false });

      // both rebuild — whichever goes first, this one ends up beneath the other's sublayers
      expect(mock.map.getLayersOrder()).toEqual(["base", "labels", `${layer.id}-circle`, layer.id, `${above.id}-circle`, above.id]);
    });
  });

  //#endregion

  //#region Removing

  describe("removing", () => {
    it("removes its source and sublayers and unbinds from the map", () => {
      const layer = addLayer({ style: { halo: true } });

      mock.map.removeLayer(layer.id);

      expect(mock.map.getLayersOrder()).toEqual(["base", "labels"]);
      expect(mock.sources.size).toBe(0);
      expect(mock.listenerCount("style.load")).toBe(0);
      expect(mock.layerListenerCount()).toBe(0);
      expect(layer.getSublayerIds()).toEqual([]);
    });

    it("drops a pending flush when removed", () => {
      const layer = addLayer();
      const source = mock.sources.get(layer.getSourceId());

      layer.setData(emptyData());
      mock.map.removeLayer(layer.id);
      flushFrames();

      expect(source?.setData).not.toHaveBeenCalled();
    });

    it("stops touching the map once the map is removed", () => {
      const layer = addLayer();

      mock.fire("remove");
      layer.setData(emptyData()).setStyle({ halo: true });

      expect(frames.size).toBe(0);
    });

    it("can be added again after removal", () => {
      const layer = addLayer();

      mock.map.removeLayer(layer.id);
      mock.map.addLayer(layer);

      expect(mock.map.getLayersOrder()).toEqual(["base", "labels", `${layer.id}-circle`, layer.id]);
      expect(mock.listenerCount("sourcedata")).toBe(1);
    });
  });

  //#endregion
});
