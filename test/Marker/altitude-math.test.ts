import { describe, expect, it, vi } from "vitest";
import type { mat4 } from "gl-matrix";
import { LngLat, type Map as MLMap } from "maplibre-gl";
import { computeAltitudeProjection, projectLngLatAltitude } from "../../src/Marker/altitude-math";
import { mercatorProjectionData } from "./mock-map";

/** Earth's circumference at the equator — meters per mercator unit there, so `altitude / EQUATOR_CIRCUMFERENCE` is a mercator z at lat 0. */
const EQUATOR_CIRCUMFERENCE = 2 * Math.PI * 6371008.8;

/**
 * Maps mercator (0.5, 0.5) — lngLat (0, 0) — to the clip-space origin, with y
 * flipped so north is up, like a real map. W is 1, so clip space is NDC.
 */
const CENTERED: mat4 = [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, -0.5, 0.5, 0, 1] as unknown as mat4;

/** {@link CENTERED} with `column` (an index into the z-column) scaled so 1 meter of altitude at the equator adds 0.001. */
function withZColumn(column: 9 | 11): mat4 {
  const matrix = [...(CENTERED as unknown as number[])];
  matrix[column] = 0.001 * EQUATOR_CIRCUMFERENCE;
  return matrix as unknown as mat4;
}

/** Projects 1 meter of altitude to 0.001 of NDC y — so on a 600px canvas, y = 300 - 0.3 * elevation. */
const Z_TO_Y = withZColumn(9);

const NEGATIVE_W: mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1] as unknown as mat4;

function mockMap(options: { clientWidth?: number; clientHeight?: number; terrain?: boolean; terrainElevation?: number | null } = {}) {
  const { clientWidth = 800, clientHeight = 600, terrain = false, terrainElevation = 0 } = options;
  return {
    getCanvas: () => ({ clientWidth, clientHeight }),
    getTerrain: () => terrain,
    queryTerrainElevation: vi.fn(() => terrainElevation),
  } as unknown as MLMap;
}

/** Screen y that {@link Z_TO_Y} projects `elevation` meters at lngLat (0, 0) to, on a 600px canvas. */
function screenYForElevation(elevation: number): number {
  return 300 - 0.3 * elevation;
}

//#region projectLngLatAltitude

describe("projectLngLatAltitude", () => {
  it("projects a world position at the origin to the screen center", () => {
    const map = mockMap({ clientWidth: 800, clientHeight: 600 });
    const point = projectLngLatAltitude(new LngLat(0, 0), 0, mercatorProjectionData(CENTERED), map);
    expect(point).not.toBeNull();
    expect(point!.x).toBeCloseTo(400);
    expect(point!.y).toBeCloseTo(300);
    expect(point!.depth).toBeCloseTo(1);
  });

  it("moves right/up in screen space for positive lng/lat (DOM y is flipped from NDC y)", () => {
    const map = mockMap({ clientWidth: 800, clientHeight: 600 });
    const point = projectLngLatAltitude(new LngLat(1, 1), 0, mercatorProjectionData(CENTERED), map);
    expect(point!.x).toBeGreaterThan(400);
    // NDC y=1 (up) maps to DOM y=0 (top) — north moves screen y *up* (smaller)
    expect(point!.y).toBeLessThan(300);
  });

  it("returns null when the point is behind the camera (clipW <= 0)", () => {
    const map = mockMap();
    const point = projectLngLatAltitude(new LngLat(0, 0), 0, mercatorProjectionData(NEGATIVE_W), map);
    expect(point).toBeNull();
  });

  // CENTERED's z-column (matrix[8], matrix[9], matrix[11]) is all zero, so it can't catch a
  // broken z term. These use a matrix with a nonzero z-column to prove altitude is wired
  // into clipY/clipW, not just passed through and then dropped.
  it("applies the matrix's z-column so altitude changes the projected screen y", () => {
    const map = mockMap({ clientWidth: 800, clientHeight: 600 });
    const base = projectLngLatAltitude(new LngLat(0, 0), 0, mercatorProjectionData(Z_TO_Y), map);
    const elevated = projectLngLatAltitude(new LngLat(0, 0), 100, mercatorProjectionData(Z_TO_Y), map);
    expect(base!.y).toBeCloseTo(300);
    // ndcY increases with altitude here, and DOM y is flipped from NDC y, so higher altitude moves the point up (smaller y)
    expect(elevated!.y).toBeCloseTo(270);
    expect(elevated!.y).toBeLessThan(base!.y);
  });

  it("applies the matrix's z-column so altitude changes clip-space W (depth)", () => {
    const zToW = mercatorProjectionData(withZColumn(11));
    const map = mockMap();
    const near = projectLngLatAltitude(new LngLat(0, 0), 0, zToW, map);
    const far = projectLngLatAltitude(new LngLat(0, 0), 500, zToW, map);
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
    const result = computeAltitudeProjection(new LngLat(0, 0), 10, mercatorProjectionData(Z_TO_Y), map, "ground");
    expect(result).not.toBeNull();
    expect(result!.belowGround).toBe(false);
    expect(result!.groundBase.y).toBeCloseTo(screenYForElevation(0)); // groundBase: nativeElevation
    expect(result!.elevated.y).toBeCloseTo(screenYForElevation(10)); // elevated: nativeElevation(0) + altitude(10)
  });

  it("adds altitude on top of terrain elevation when relativeTo is 'ground' and terrain is on", () => {
    const map = mockMap({ terrain: true, terrainElevation: 100 });
    const result = computeAltitudeProjection(new LngLat(0, 0), 10, mercatorProjectionData(Z_TO_Y), map, "ground");
    expect(result).not.toBeNull();
    expect(result!.belowGround).toBe(false);
    expect(result!.groundBase.y).toBeCloseTo(screenYForElevation(100)); // groundBase: nativeElevation
    expect(result!.elevated.y).toBeCloseTo(screenYForElevation(110)); // elevated: nativeElevation(100) + altitude(10)
  });

  it("ignores terrain elevation entirely when relativeTo is 'sea'", () => {
    const map = mockMap({ terrain: true, terrainElevation: 1000 });
    const result = computeAltitudeProjection(new LngLat(0, 0), 10, mercatorProjectionData(Z_TO_Y), map, "sea");
    expect(result).not.toBeNull();
    // target elevation (10) is far below the native terrain elevation (1000) -> below ground
    expect(result!.belowGround).toBe(true);
  });

  it("flags belowGround when the target elevation is under the native elevation", () => {
    const map = mockMap({ terrain: true, terrainElevation: 50 });
    const result = computeAltitudeProjection(new LngLat(0, 0), -10, mercatorProjectionData(Z_TO_Y), map, "ground");
    expect(result!.belowGround).toBe(true);
  });

  it("falls back to elevation 0 when queryTerrainElevation returns null", () => {
    const map = mockMap({ terrain: true, terrainElevation: null as unknown as number });
    const result = computeAltitudeProjection(new LngLat(0, 0), 5, mercatorProjectionData(Z_TO_Y), map, "ground");
    expect(result).not.toBeNull();
    expect(result!.belowGround).toBe(false);
    // Asserting the projected elevations (rather than just belowGround)
    // catches a missing `?? 0` fallback: without it these would be NaN.
    expect(result!.groundBase.y).toBeCloseTo(screenYForElevation(0)); // groundBase: nativeElevation falls back to 0
    expect(result!.elevated.y).toBeCloseTo(screenYForElevation(5)); // elevated: nativeElevation(0) + altitude(5)
  });

  it("returns null when either projection is behind the camera", () => {
    const map = mockMap();
    const result = computeAltitudeProjection(new LngLat(0, 0), 10, mercatorProjectionData(NEGATIVE_W), map, "ground");
    expect(result).toBeNull();
  });
});

//#endregion
