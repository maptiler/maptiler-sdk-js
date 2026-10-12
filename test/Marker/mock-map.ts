import { vi } from "vitest";
import { LngLat, Point, type CustomLayerProjectionData, type LngLatLike } from "maplibre-gl";
import type { mat4 } from "gl-matrix";
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

  const transform = {
    getCoveringTilesDetailsProvider: () => ({ allowWorldCopies: () => false }),
    isLocationOccluded: () => false,
  };

  const map = {
    _ownerWindow: undefined,
    // MapLibre v6 Marker reads the transform from `map._camera`
    _camera: { transform },
    terrain: undefined as unknown,
    loaded: () => true,
    isMoving: () => false,
    isStyleLoaded: () => true,
    _getUIString: () => "",
    getCanvasContainer: () => canvasContainer,
    getContainer: () => container,
    getCanvas: () => canvas,
    project: (lngLat: LngLatLike) => {
      const ll = LngLat.convert(lngLat);
      return new Point(400 + ll.lng * 10, 300 - ll.lat * 10);
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

/**
 * Custom layer projection data for a plain mercator frame — `matrix` maps
 * mercator x/y (0..1) and z (mercator units) to clip space.
 */
export function mercatorProjectionData(matrix: mat4): CustomLayerProjectionData {
  const projectionMatrix = matrix as CustomLayerProjectionData["mainMatrix"];
  return {
    mainMatrix: projectionMatrix,
    fallbackMatrix: projectionMatrix,
    projectionTransition: 0,
    tileMercatorCoords: [0, 0, 1, 1],
    clippingPlane: [0, 0, 0, 0],
    clipAntimeridian: false,
  };
}
