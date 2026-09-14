import { describe, expect, it, vi } from "vitest";
import type { mat4 } from "gl-matrix";
import maplibregl from "maplibre-gl";
import { computeAltitudeProjection, projectLngLatAltitude } from "../../src/Marker/altitude-math";

const IDENTITY: mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as unknown as mat4;

/** Builds a fake `maplibregl.Map` where `getMatrixForModel` reports the lngLat/altitude it was given as a "world position", so downstream math can be checked without real geo projection. */
function mockMap(options: { clientWidth?: number; clientHeight?: number; terrain?: boolean; terrainElevation?: number | null } = {}) {
  const { clientWidth = 800, clientHeight = 600, terrain = false, terrainElevation = 0 } = options;
  return {
    transform: {
      getMatrixForModel: vi.fn((lngLat: maplibregl.LngLat, altitude: number) => {
        const model = new Array(16).fill(0);
        model[12] = lngLat.lng;
        model[13] = lngLat.lat;
        model[14] = altitude;
        return model as unknown as mat4;
      }),
    },
    getCanvas: () => ({ clientWidth, clientHeight }),
    getTerrain: () => terrain,
    queryTerrainElevation: vi.fn(() => terrainElevation),
  } as unknown as maplibregl.Map;
}

//#region projectLngLatAltitude

describe("projectLngLatAltitude", () => {
  it("projects a world position at the origin to the screen center", () => {
    const map = mockMap({ clientWidth: 800, clientHeight: 600 });
    const point = projectLngLatAltitude(new maplibregl.LngLat(0, 0), 0, IDENTITY, map);
    expect(point).not.toBeNull();
    expect(point!.x).toBeCloseTo(400);
    expect(point!.y).toBeCloseTo(300);
    expect(point!.depth).toBeCloseTo(1);
  });

  it("moves right/down in screen space for positive world x/y (DOM y is flipped from NDC y)", () => {
    const map = mockMap({ clientWidth: 800, clientHeight: 600 });
    const point = projectLngLatAltitude(new maplibregl.LngLat(1, 1), 0, IDENTITY, map);
    expect(point!.x).toBeGreaterThan(400);
    // NDC y=1 (up) maps to DOM y=0 (top) — positive world y moves screen y *up* (smaller)
    expect(point!.y).toBeLessThan(300);
  });

  it("returns null when the point is behind the camera (clipW <= 0)", () => {
    const negativeW: mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1] as unknown as mat4;
    const map = mockMap();
    const point = projectLngLatAltitude(new maplibregl.LngLat(0, 0), 0, negativeW, map);
    expect(point).toBeNull();
  });

  it("passes lngLat and altitude through to getMatrixForModel", () => {
    const map = mockMap();
    projectLngLatAltitude(new maplibregl.LngLat(12, 34), 56, IDENTITY, map);
    const spy = map.transform.getMatrixForModel as unknown as ReturnType<typeof vi.fn>;
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ lng: 12, lat: 34 }), 56);
  });
});

//#endregion

//#region computeAltitudeProjection

describe("computeAltitudeProjection", () => {
  it("uses 0 native elevation when terrain is off", () => {
    const map = mockMap({ terrain: false });
    const result = computeAltitudeProjection(new maplibregl.LngLat(0, 0), 10, IDENTITY, map, "ground");
    expect(result).not.toBeNull();
    // groundBase's world z came from nativeElevation (0); elevated's world z is nativeElevation + 10
    expect(result!.groundBase.y).toBeCloseTo(300); // world y unaffected, unchanged from ground
    expect(result!.belowGround).toBe(false);
  });

  it("adds altitude on top of terrain elevation when relativeTo is 'ground' and terrain is on", () => {
    const map = mockMap({ terrain: true, terrainElevation: 100 });
    const result = computeAltitudeProjection(new maplibregl.LngLat(0, 0), 10, IDENTITY, map, "ground");
    expect(result).not.toBeNull();
    expect(result!.belowGround).toBe(false);
  });

  it("ignores terrain elevation entirely when relativeTo is 'sea'", () => {
    const map = mockMap({ terrain: true, terrainElevation: 1000 });
    const result = computeAltitudeProjection(new maplibregl.LngLat(0, 0), 10, IDENTITY, map, "sea");
    expect(result).not.toBeNull();
    // target elevation (10) is far below the native terrain elevation (1000) -> below ground
    expect(result!.belowGround).toBe(true);
  });

  it("flags belowGround when the target elevation is under the native elevation", () => {
    const map = mockMap({ terrain: true, terrainElevation: 50 });
    const result = computeAltitudeProjection(new maplibregl.LngLat(0, 0), -10, IDENTITY, map, "ground");
    expect(result!.belowGround).toBe(true);
  });

  it("falls back to elevation 0 when queryTerrainElevation returns null", () => {
    const map = mockMap({ terrain: true, terrainElevation: null as unknown as number });
    const result = computeAltitudeProjection(new maplibregl.LngLat(0, 0), 5, IDENTITY, map, "ground");
    expect(result).not.toBeNull();
    expect(result!.belowGround).toBe(false);
  });

  it("returns null when either projection is behind the camera", () => {
    const negativeW: mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1] as unknown as mat4;
    const map = mockMap();
    const result = computeAltitudeProjection(new maplibregl.LngLat(0, 0), 10, negativeW, map, "ground");
    expect(result).toBeNull();
  });
});

//#endregion
