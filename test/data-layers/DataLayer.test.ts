import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExpressionSpecification, FilterSpecification } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import type { SourceSpecification } from "maplibre-gl";
import type { Map as SDKMap } from "../../src/Map";
import { config } from "../../src/config";
import { DataLayer, type DataLayerConstructorOptions, type SublayerSpecification } from "../../src/data-layers/DataLayer";
import { createMockStyleMap, type MockStyleMap } from "./mock-style-map";

//#region Test Layer

type TestStyling = {
  color?: string;
  halo?: boolean;
};

/** Two paint-path props and one structural one (`halo` adds a sublayer, so needs a rebuild). */
class TestLayer extends DataLayer<TestStyling, "circles"> {
  constructor(options: DataLayerConstructorOptions<TestStyling>) {
    super("test-layer", "circles", options);
  }

  protected addSublayers(map: SDKMap): void {
    const styling = this.resolveStyling();
    if (styling.halo) {
      this.addSublayer(map, { id: `${this.id}-halo`, type: "circle", source: this.getSourceId(), paint: { "circle-color": styling.color } });
    }
    this.addSublayer(map, { id: `${this.id}-circle`, type: "circle", source: this.getSourceId(), paint: { "circle-color": styling.color } });
  }

  protected applyStyling(changed: Set<keyof TestStyling>): boolean {
    if (changed.has("halo")) return false;
    const styling = this.resolveStyling();
    for (const id of this.getSublayerIds()) this.map?.setPaintProperty(id, "circle-color", styling.color);
    return true;
  }

  protected resolveStyling(): TestStyling {
    return { color: "#ff0000", halo: false, ...this.styling };
  }
}

type SyncStyling = {
  color?: string;
  radius?: number;
  sortKey?: number;
  onlyLarge?: boolean;
  outline?: boolean;
  heatmap?: boolean;
};

/** Styles through `syncSublayers`, as real layers do: the specs are rebuilt from the styling, and synced onto the live sublayers. */
class SyncTestLayer extends DataLayer<SyncStyling, "circles"> {
  constructor(options: DataLayerConstructorOptions<SyncStyling>) {
    super("sync-test-layer", "circles", options);
  }

  /** The sublayer specs for the current styling, bottom first. `outline` adds a sublayer, `heatmap` retypes the main one. */
  private buildSpecs(): SublayerSpecification[] {
    const styling = this.resolveStyling();
    const source = this.getSourceId();
    const specs: SublayerSpecification[] = [];

    if (styling.outline) specs.push({ id: `${this.id}-outline`, type: "circle", source, paint: { "circle-color": "#000000" } });

    if (styling.heatmap) {
      specs.push({ id: `${this.id}-main`, type: "heatmap", source });
    } else {
      specs.push({
        id: `${this.id}-main`,
        type: "circle",
        source,
        paint: { "circle-color": styling.color, ...(styling.radius !== undefined && { "circle-radius": styling.radius }) },
        layout: { "circle-sort-key": styling.sortKey },
        ...(styling.onlyLarge && { filter: [">", ["get", "size"], 10] }),
      });
    }

    return specs;
  }

  protected addSublayers(map: SDKMap): void {
    for (const spec of this.buildSpecs()) this.addSublayer(map, spec);
  }

  protected applyStyling(): boolean {
    return this.syncSublayers(this.buildSpecs());
  }

  protected resolveStyling(): SyncStyling {
    return { color: "#ff0000", sortKey: 0, ...this.styling };
  }
}

const POINTS_ONLY: ExpressionSpecification = ["==", ["geometry-type"], "Point"];

/** A test layer drawing points only, with its circle sublayer filtered to features that have `mag` while `halo` is on. */
class PointsOnlyTestLayer extends TestLayer {
  protected override readonly geometryFilter = POINTS_ONLY;

  protected override addSublayers(map: SDKMap): void {
    const filter: FilterSpecification | undefined = this.resolveStyling().halo ? ["has", "mag"] : undefined;
    this.addSublayer(map, { id: `${this.id}-circle`, type: "circle", source: this.getSourceId(), ...(filter ? { filter } : {}) });
  }

  protected override applyStyling(): boolean {
    const filter: FilterSpecification | undefined = this.resolveStyling().halo ? ["has", "mag"] : undefined;
    return this.syncSublayers([{ id: `${this.id}-circle`, type: "circle", source: this.getSourceId(), ...(filter ? { filter } : {}) }]);
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

  function addLayer(options: Partial<DataLayerConstructorOptions<TestStyling>> = {}, beforeId?: string) {
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
      layer.setStyling({ color: "#00ff00" }).setVisible(false);
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

    it("applies paint-path styling in place, without rebuilding", () => {
      const layer = addLayer();
      mock.map.addSource.mockClear();

      layer.setStyling({ color: "#0000ff" });
      flushFrames();

      expect(mock.map.setPaintProperty).toHaveBeenCalledWith(`${layer.id}-circle`, "circle-color", "#0000ff");
      expect(mock.map.addSource).not.toHaveBeenCalled();
      expect(layer.getStyling().color).toBe("#0000ff");
    });

    it("rebuilds for structural styling, keeping sublayers beneath the controller", () => {
      const layer = addLayer({}, "labels");

      layer.setStyling({ halo: true });
      flushFrames();

      expect(mock.map.getLayersOrder()).toEqual(["base", `${layer.id}-halo`, `${layer.id}-circle`, layer.id, "labels"]);
      expect(layer.getSublayerIds()).toEqual([`${layer.id}-halo`, `${layer.id}-circle`]);
    });

    it("resets a styling key set to undefined to its default", () => {
      const layer = addLayer({ styling: { color: "#00ff00" } });

      layer.setStyling({ color: undefined });
      flushFrames();

      expect(layer.getStyling().color).toBe("#ff0000");
      expect(mock.map.setPaintProperty).toHaveBeenLastCalledWith(`${layer.id}-circle`, "circle-color", "#ff0000");
    });

    it("sets visibility and zoom range on every sublayer", () => {
      const layer = addLayer({ styling: { halo: true } });

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
      layer.setStyling({ halo: true });
      flushFrames();

      const halo = mock.map.getLayer(`${layer.id}-halo`) as { layout: { visibility: string } };
      expect(halo.layout.visibility).toBe("none");
    });
  });

  //#endregion

  //#region Syncing Sublayers

  describe("syncing sublayers", () => {
    function addSyncLayer(styling: SyncStyling = {}) {
      const layer = new SyncTestLayer({ data: emptyData(), styling });
      mock.map.addLayer(layer, "labels");
      mock.map.addSource.mockClear();
      mock.map.setPaintProperty.mockClear();
      mock.map.setLayoutProperty.mockClear();
      mock.map.setFilter.mockClear();
      return layer;
    }

    it("applies a changed paint property in place, leaving the rest alone", () => {
      const layer = addSyncLayer({ radius: 4 });

      layer.setStyling({ color: "#00ff00" });
      flushFrames();

      expect(mock.map.setPaintProperty.mock.calls).toEqual([[`${layer.id}-main`, "circle-color", "#00ff00"]]);
      expect(mock.map.setLayoutProperty).not.toHaveBeenCalled();
      expect(mock.map.addSource).not.toHaveBeenCalled();
    });

    it("resets a paint property that is no longer set", () => {
      const layer = addSyncLayer({ radius: 4 });

      layer.setStyling({ radius: undefined });
      flushFrames();

      expect(mock.map.setPaintProperty.mock.calls).toEqual([[`${layer.id}-main`, "circle-radius", undefined]]);
    });

    it("applies a changed layout property in place, without touching visibility", () => {
      const layer = addSyncLayer();
      layer.setVisible(false);
      flushFrames();
      mock.map.setLayoutProperty.mockClear();

      layer.setStyling({ sortKey: 2 });
      flushFrames();

      expect(mock.map.setLayoutProperty.mock.calls).toEqual([[`${layer.id}-main`, "circle-sort-key", 2]]);
      expect((mock.map.getLayer(`${layer.id}-main`) as { layout: { visibility: string } }).layout.visibility).toBe("none");
    });

    it("sets a filter, and clears it with null", () => {
      const layer = addSyncLayer();

      layer.setStyling({ onlyLarge: true });
      flushFrames();
      layer.setStyling({ onlyLarge: undefined });
      flushFrames();

      expect(mock.map.setFilter.mock.calls).toEqual([
        [`${layer.id}-main`, [">", ["get", "size"], 10]],
        [`${layer.id}-main`, null],
      ]);
    });

    it("makes no calls when the specs haven't changed", () => {
      const layer = addSyncLayer({ color: "#00ff00" });

      layer.setStyling({ color: "#00ff00" });
      flushFrames();

      expect(mock.map.setPaintProperty).not.toHaveBeenCalled();
      expect(mock.map.setLayoutProperty).not.toHaveBeenCalled();
      expect(mock.map.setFilter).not.toHaveBeenCalled();
    });

    it("rebuilds when a sublayer is added or removed, keeping the order beneath the controller", () => {
      const layer = addSyncLayer();

      layer.setStyling({ outline: true });
      flushFrames();

      expect(mock.map.addSource).toHaveBeenCalledTimes(1);
      expect(mock.map.getLayersOrder()).toEqual(["base", `${layer.id}-outline`, `${layer.id}-main`, layer.id, "labels"]);

      layer.setStyling({ outline: undefined });
      flushFrames();

      expect(mock.map.addSource).toHaveBeenCalledTimes(2);
      expect(mock.map.getLayersOrder()).toEqual(["base", `${layer.id}-main`, layer.id, "labels"]);
    });

    it("rebuilds when a sublayer changes type", () => {
      const layer = addSyncLayer();

      layer.setStyling({ heatmap: true });
      flushFrames();

      expect(mock.map.addSource).toHaveBeenCalledTimes(1);
      expect((mock.map.getLayer(`${layer.id}-main`) as { type: string }).type).toBe("heatmap");
    });

    it("syncs against the specs of the last rebuild", () => {
      const layer = addSyncLayer();
      layer.setStyling({ outline: true });
      flushFrames();
      mock.map.setPaintProperty.mockClear();

      layer.setStyling({ color: "#0000ff" });
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
      const layer = new PointsOnlyTestLayer({ data: emptyData(), styling: { halo: true } });
      mock.map.addLayer(layer);

      expect((mock.map.getLayer(`${layer.id}-circle`) as { filter: unknown }).filter).toEqual(["all", POINTS_ONLY, ["has", "mag"]]);
    });

    it("keeps the geometry filter when a sublayer's own filter changes in place", () => {
      const layer = new PointsOnlyTestLayer({ data: emptyData() });
      mock.map.addLayer(layer);

      layer.setStyling({ halo: true });
      flushFrames();
      expect(mock.map.setFilter).toHaveBeenLastCalledWith(`${layer.id}-circle`, ["all", POINTS_ONLY, ["has", "mag"]]);

      layer.setStyling({ halo: false });
      flushFrames();
      expect(mock.map.setFilter).toHaveBeenLastCalledWith(`${layer.id}-circle`, POINTS_ONLY);
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

      layer.setStyling({ halo: true });
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
      const layer = addLayer({ styling: { color: "#00ff00" } }, "labels");

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

  //#region Removing

  describe("removing", () => {
    it("removes its source and sublayers and unbinds from the map", () => {
      const layer = addLayer({ styling: { halo: true } });

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
      layer.setData(emptyData()).setStyling({ halo: true });

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
