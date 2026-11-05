import { vi, type Mock } from "vitest";
import type { CustomLayerInterface, LayerSpecification, MissingStyleImageResolver, SourceSpecification } from "maplibre-gl";
import type { Map as SDKMap } from "../../src/Map";

type StyleLayer = LayerSpecification | CustomLayerInterface;
type Listener = (event: unknown) => void;
type MockSource = { spec: SourceSpecification; setData: Mock };

/** The map methods the fake implements — typed loosely, as the inferred `vi.fn` types are too large to emit. */
type MockMapMethod =
  | "addLayer"
  | "removeLayer"
  | "moveLayer"
  | "getLayer"
  | "getLayersOrder"
  | "addSource"
  | "removeSource"
  | "getSource"
  | "setPaintProperty"
  | "setLayoutProperty"
  | "setFilter"
  | "setLayerZoomRange"
  | "hasImage"
  | "addImage"
  | "removeImage"
  | "addMissingStyleImageResolver"
  | "removeMissingStyleImageResolver"
  | "getStyleId"
  | "on"
  | "off";

export type MockMap = Record<MockMapMethod, Mock>;

export type MockStyleMap = {
  map: MockMap;
  asSDKMap: () => SDKMap;
  sources: Map<string, MockSource>;
  images: Map<string, unknown>;
  resolvers: MissingStyleImageResolver[];
  setStyleId: (id: string | undefined) => void;
  fire: (type: string, event?: object) => void;
  fireOnLayer: (type: string, layerId: string, event?: object) => void;
  listenerCount: (type: string) => number;
  layerListenerCount: () => number;
  setStyle: (layerIds: string[], options: { diff: boolean }) => void;
};

/**
 * A minimal in-memory fake of the style side of `SDKMap` — layer order,
 * sources, images, property setters and a real event bus — enough for
 * `DataLayer` and `PointLayer` to add, update and rebuild themselves without
 * WebGL. Custom layers get `onAdd` / `onRemove` called as MapLibre does.
 */
export function createMockStyleMap(options: { styleId?: string } = {}): MockStyleMap {
  let layers: StyleLayer[] = [];
  const sources = new Map<string, MockSource>();
  const images = new Map<string, unknown>();
  const listeners = new Map<string, Set<Listener>>();
  const layerListeners: { type: string; layerIds: string[]; listener: Listener }[] = [];
  const resolvers: MissingStyleImageResolver[] = [];
  let styleId = options.styleId;

  const indexOf = (id: string) => layers.findIndex((layer) => layer.id === id);

  const map: MockMap = {
    addLayer: vi.fn((layer: StyleLayer, beforeId?: string) => {
      if (indexOf(layer.id) !== -1) throw new Error(`Layer "${layer.id}" already exists`);
      const before = beforeId === undefined ? -1 : indexOf(beforeId);
      if (before === -1) layers.push(layer);
      else layers.splice(before, 0, layer);
      if (layer.type === "custom") (layer as CustomLayerInterface).onAdd?.(map as never, {} as never);
      return map;
    }),
    removeLayer: vi.fn((id: string) => {
      const index = indexOf(id);
      if (index === -1) return map;
      const [layer] = layers.splice(index, 1);
      if (layer.type === "custom") (layer as CustomLayerInterface).onRemove?.(map as never, {} as never);
      return map;
    }),
    moveLayer: vi.fn((id: string, beforeId?: string) => {
      const index = indexOf(id);
      if (index === -1) return map;
      const [layer] = layers.splice(index, 1);
      const before = beforeId === undefined ? -1 : indexOf(beforeId);
      if (before === -1) layers.push(layer);
      else layers.splice(before, 0, layer);
      return map;
    }),
    getLayer: vi.fn((id: string) => layers.find((layer) => layer.id === id)),
    getLayersOrder: vi.fn(() => layers.map((layer) => layer.id)),

    addSource: vi.fn((id: string, spec: SourceSpecification) => {
      if (sources.has(id)) throw new Error(`Source "${id}" already exists`);
      sources.set(id, { spec, setData: vi.fn() });
      return map;
    }),
    removeSource: vi.fn((id: string) => {
      sources.delete(id);
      return map;
    }),
    getSource: vi.fn((id: string) => sources.get(id)),

    setPaintProperty: vi.fn((id: string, key: string, value: unknown) => {
      const layer = map.getLayer(id) as LayerSpecification & { paint?: Record<string, unknown> };
      layer.paint = { ...layer.paint, [key]: value };
      return map;
    }),
    setLayoutProperty: vi.fn((id: string, key: string, value: unknown) => {
      const layer = map.getLayer(id) as LayerSpecification & { layout?: Record<string, unknown> };
      layer.layout = { ...layer.layout, [key]: value };
      return map;
    }),
    setFilter: vi.fn((id: string, filter: unknown) => {
      (map.getLayer(id) as { filter?: unknown }).filter = filter ?? undefined;
      return map;
    }),
    setLayerZoomRange: vi.fn((id: string, minzoom: number, maxzoom: number) => {
      Object.assign(map.getLayer(id) as object, { minzoom, maxzoom });
      return map;
    }),

    hasImage: vi.fn((id: string) => images.has(id)),
    addImage: vi.fn((id: string, image: unknown) => {
      images.set(id, image);
      return map;
    }),
    removeImage: vi.fn((id: string) => {
      images.delete(id);
      return map;
    }),
    addMissingStyleImageResolver: vi.fn((resolver: MissingStyleImageResolver) => {
      if (!resolvers.includes(resolver)) resolvers.push(resolver);
      return map;
    }),
    removeMissingStyleImageResolver: vi.fn((resolver: MissingStyleImageResolver) => {
      const index = resolvers.indexOf(resolver);
      if (index !== -1) resolvers.splice(index, 1);
      return map;
    }),

    getStyleId: vi.fn(() => styleId),

    on: vi.fn((type: string, layerIdsOrListener: string | string[] | Listener, maybeListener?: Listener) => {
      if (typeof layerIdsOrListener === "function") {
        let set = listeners.get(type);
        if (!set) listeners.set(type, (set = new Set()));
        set.add(layerIdsOrListener);
      } else {
        const layerIds = Array.isArray(layerIdsOrListener) ? layerIdsOrListener : [layerIdsOrListener];
        if (maybeListener) layerListeners.push({ type, layerIds, listener: maybeListener });
      }
      return map;
    }),
    off: vi.fn((type: string, layerIdsOrListener: string | string[] | Listener, maybeListener?: Listener) => {
      if (typeof layerIdsOrListener === "function") {
        listeners.get(type)?.delete(layerIdsOrListener);
      } else {
        const index = layerListeners.findIndex((entry) => entry.type === type && entry.listener === maybeListener);
        if (index !== -1) layerListeners.splice(index, 1);
      }
      return map;
    }),
  };

  /** Test-side controls, kept apart from the map's own API. */
  const mock: MockStyleMap = {
    map,
    asSDKMap: () => map as unknown as SDKMap,
    sources,
    images,
    resolvers,

    setStyleId(id: string | undefined) {
      styleId = id;
    },

    /** Fires a map-level event, as MapLibre would. */
    fire(type: string, event: object = {}) {
      for (const listener of [...(listeners.get(type) ?? [])]) listener({ type, ...event });
    },

    /** Fires a pointer event as if over `layerId`. */
    fireOnLayer(type: string, layerId: string, event: object = {}) {
      for (const entry of [...layerListeners]) {
        if (entry.type === type && entry.layerIds.includes(layerId)) entry.listener({ type, ...event });
      }
    },

    listenerCount(type: string) {
      return listeners.get(type)?.size ?? 0;
    },

    layerListenerCount() {
      return layerListeners.length;
    },

    /**
     * Simulates `setStyle()` to a style of plain `layerIds`, then `style.load`.
     * A diffed style keeps custom layers but drops every source and every
     * other layer — and, as MapLibre's diff does, leaves the custom layers
     * beneath the new style's layers. A full rebuild drops everything,
     * without calling `onRemove`.
     */
    setStyle(layerIds: string[], { diff }: { diff: boolean }) {
      const kept = diff ? layers.filter((layer) => layer.type === "custom") : [];
      const base = layerIds.map((id) => ({ id, type: "background" }) as LayerSpecification);
      layers = [...kept, ...base];
      sources.clear();
      images.clear();
      mock.fire("style.load");
    },
  };

  return mock;
}
