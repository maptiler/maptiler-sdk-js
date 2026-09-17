import { vi } from "vitest";
import maplibregl from "maplibre-gl";
import type { Map as SDKMap } from "../../src/Map";

/**
 * A minimal but functionally real fake of `maplibregl.Map`/`SDKMap`, built to
 * satisfy exactly what `maplibregl.Marker`, `Marker`, and `MarkerManager`
 * touch — real DOM elements and a real (simplified) event bus, so markers
 * genuinely attach/detach/react, without spinning up WebGL.
 */
export function createMockMap() {
  const container = document.createElement("div");
  const canvasContainer = document.createElement("div");
  const canvas = document.createElement("canvas");
  Object.defineProperty(canvas, "clientWidth", { value: 800, configurable: true });
  Object.defineProperty(canvas, "clientHeight", { value: 600, configurable: true });
  container.appendChild(canvasContainer);
  canvasContainer.appendChild(canvas);
  document.body.appendChild(container);

  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  const map = {
    _ownerWindow: undefined,
    transform: {
      getCoveringTilesDetailsProvider: () => ({ allowWorldCopies: () => false }),
      isLocationOccluded: () => false,
      getMatrixForModel: vi.fn(() => new Array(16).fill(0)),
    },
    terrain: undefined as unknown,
    loaded: () => true,
    isMoving: () => false,
    isStyleLoaded: () => true,
    _getUIString: () => "",
    getCanvasContainer: () => canvasContainer,
    getContainer: () => container,
    getCanvas: () => canvas,
    project: (lngLat: maplibregl.LngLatLike) => {
      const ll = maplibregl.LngLat.convert(lngLat);
      return new maplibregl.Point(400 + ll.lng * 10, 300 - ll.lat * 10);
    },
    getBearing: () => 0,
    getPitch: () => 0,
    getStyleId: () => undefined,
    style: { stylesheet: undefined },
    isStyleLoaded_: true,
    addLayer: vi.fn(),
    getLayer: vi.fn(() => undefined),
    removeLayer: vi.fn(),
    triggerRepaint: vi.fn(),
    queryTerrainElevation: vi.fn(() => 0),
    getTerrain: vi.fn(() => null),
    on(type: string, listener: (...args: unknown[]) => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
      return map;
    },
    off(type: string, listener: (...args: unknown[]) => void) {
      listeners.get(type)?.delete(listener);
      return map;
    },
    once(type: string, listener?: (...args: unknown[]) => void) {
      if (!listener) return Promise.resolve();
      const wrapped = (...args: unknown[]) => {
        map.off(type, wrapped);
        listener(...args);
      };
      map.on(type, wrapped);
      return map;
    },
    fire(type: string, ...args: unknown[]) {
      for (const listener of [...(listeners.get(type) ?? [])]) listener(...args);
    },
  };

  return map as unknown as SDKMap;
}

export type MockMap = ReturnType<typeof createMockMap>;
