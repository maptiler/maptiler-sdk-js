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

  // IDENTITY's z-column (matrix[8], matrix[9], matrix[11]) is all zero, so it can't catch a
  // broken worldZ term. These use a matrix with a nonzero z-column to prove altitude is wired
  // into clipY/clipW, not just passed through and then dropped.
  it("applies the matrix's z-column so altitude changes the projected screen y", () => {
    const zToY: mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0.001, 0, 0, 0, 0, 0, 1] as unknown as mat4;
    const map = mockMap({ clientWidth: 800, clientHeight: 600 });
    const base = projectLngLatAltitude(new maplibregl.LngLat(0, 0), 0, zToY, map);
    const elevated = projectLngLatAltitude(new maplibregl.LngLat(0, 0), 100, zToY, map);
    expect(base!.y).toBeCloseTo(300);
    // ndcY increases with altitude here, and DOM y is flipped from NDC y, so higher altitude moves the point up (smaller y)
    expect(elevated!.y).toBeCloseTo(270);
    expect(elevated!.y).toBeLessThan(base!.y);
  });

  it("applies the matrix's z-column so altitude changes clip-space W (depth)", () => {
    const zToW: mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0.001, 0, 0, 0, 1] as unknown as mat4;
    const map = mockMap();
    const near = projectLngLatAltitude(new maplibregl.LngLat(0, 0), 0, zToW, map);
    const far = projectLngLatAltitude(new maplibregl.LngLat(0, 0), 500, zToW, map);
    expect(near!.depth).toBeCloseTo(1);
    expect(far!.depth).toBeCloseTo(1.5);
  });
});

//#endregion

//#region computeAltitudeProjection

describe("computeAltitudeProjection", () => {
  it("uses 0 native elevation when terrain is off", () => {
    // terrainElevation is nonzero to prove terrain-off forces nativeElevation to 0
    // regardless of what queryTerrainElevation would have reported.
    const map = mockMap({ terrain: false, terrainElevation: 999 });
    const result = computeAltitudeProjection(new maplibregl.LngLat(0, 0), 10, IDENTITY, map, "ground");
    expect(result).not.toBeNull();
    expect(result!.groundBase.y).toBeCloseTo(300); // world y unaffected, unchanged from ground
    expect(result!.belowGround).toBe(false);
    const spy = map.transform.getMatrixForModel as unknown as ReturnType<typeof vi.fn>;
    expect(spy).toHaveBeenNthCalledWith(1, expect.anything(), 0); // groundBase: nativeElevation
    expect(spy).toHaveBeenNthCalledWith(2, expect.anything(), 10); // elevated: nativeElevation(0) + altitude(10)
  });

  it("adds altitude on top of terrain elevation when relativeTo is 'ground' and terrain is on", () => {
    const map = mockMap({ terrain: true, terrainElevation: 100 });
    const result = computeAltitudeProjection(new maplibregl.LngLat(0, 0), 10, IDENTITY, map, "ground");
    expect(result).not.toBeNull();
    expect(result!.belowGround).toBe(false);
    const spy = map.transform.getMatrixForModel as unknown as ReturnType<typeof vi.fn>;
    expect(spy).toHaveBeenNthCalledWith(1, expect.anything(), 100); // groundBase: nativeElevation
    expect(spy).toHaveBeenNthCalledWith(2, expect.anything(), 110); // elevated: nativeElevation(100) + altitude(10)
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
    // Asserting the actual elevation fed to getMatrixForModel (rather than just belowGround)
    // catches a missing `?? 0` fallback: without it this would be NaN, not 0.
    const spy = map.transform.getMatrixForModel as unknown as ReturnType<typeof vi.fn>;
    expect(spy).toHaveBeenNthCalledWith(1, expect.anything(), 0); // groundBase: nativeElevation falls back to 0
    expect(spy).toHaveBeenNthCalledWith(2, expect.anything(), 5); // elevated: nativeElevation(0) + altitude(5)
  });

  it("returns null when either projection is behind the camera", () => {
    const negativeW: mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1] as unknown as mat4;
    const map = mockMap();
    const result = computeAltitudeProjection(new maplibregl.LngLat(0, 0), 10, negativeW, map, "ground");
    expect(result).toBeNull();
  });
});

//#endregion
