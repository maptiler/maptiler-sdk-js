import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeatureCollection } from "geojson";
import type { Map as SDKMap } from "../../src/Map";
import { DataLayer, type DataLayerConstructorOptions } from "../../src/data-layers/DataLayer";
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

const emptyData = (): FeatureCollection => ({ type: "FeatureCollection", features: [] });

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
