// Pure math, no DOM/MapLibre side effects — called every frame per marker.
import { MercatorCoordinate, type CustomLayerProjectionData, type LngLat, type Map as MLMap } from "maplibre-gl";
import type { mat4 } from "gl-matrix";
import type { AltitudeReference } from "./types";

//#region ScreenPoint

/** A screen-space position in CSS pixels, DOM convention (+y down). */
export interface ScreenPoint {
  x: number;
  y: number;
  /** Clip-space W — proportional to camera distance. For ordering points against each other, not a real distance. */
  depth: number;
}

//#endregion

//#region projectLngLatAltitude

/** Mean Earth radius in meters — the sphere MapLibre's globe is rendered on (`GLOBE_RADIUS` in its shaders). */
const GLOBE_RADIUS = 6371008.8;

/**
 * Projects `lngLat`/`altitudeMeters` to a screen point using the projection data MapLibre hands to custom layers each frame.
 * A JS port of MapLibre's `projectTileFor3D` shader function, so it works under mercator, globe, and mid-morph between the two.
 */
export function projectLngLatAltitude(lngLat: LngLat, altitudeMeters: number, projectionData: CustomLayerProjectionData, map: MLMap): ScreenPoint | null {
  const { mainMatrix, fallbackMatrix, projectionTransition } = projectionData;
  const mercator = MercatorCoordinate.fromLngLat(lngLat, altitudeMeters);

  // Flat (mercator) position: custom layer matrices take mercator x/y in 0..1 and z in mercator units.
  // Under plain mercator `fallbackMatrix` is the same as `mainMatrix`.
  let [clipX, clipY, clipW] = transformPoint(fallbackMatrix, mercator.x, mercator.y, mercator.z);

  if (projectionTransition > 0) {
    // Globe position: `mainMatrix` takes points on the unit sphere, scaled out by the altitude.
    const [sphereX, sphereY, sphereZ] = mercatorToUnitSphere(mercator.x, mercator.y);
    const scale = 1 + altitudeMeters / GLOBE_RADIUS;
    const globe = transformPoint(mainMatrix, sphereX * scale, sphereY * scale, sphereZ * scale);

    if (projectionTransition > 0.999) {
      [clipX, clipY, clipW] = globe;
    } else {
      clipX += (globe[0] - clipX) * projectionTransition;
      clipY += (globe[1] - clipY) * projectionTransition;
      clipW += (globe[2] - clipW) * projectionTransition;
    }
  }

  if (clipW <= 0) return null; // behind camera

  const ndcX = clipX / clipW;
  const ndcY = clipY / clipW;

  // CSS pixels, not the DPR-scaled canvas backing store.
  const cssWidth = map.getCanvas().clientWidth;
  const cssHeight = map.getCanvas().clientHeight;

  // NDC axes both run -1..1 with the origin at screen center. `* 0.5 + 0.5`
  // rescales that to 0..1, then `* cssWidth`/`cssHeight` turns the 0..1
  // fraction into a pixel offset from the top-left corner — which is also
  // why Y gets flipped first: NDC's +1 is the top of the screen, but DOM's
  // pixel Y grows downward, so "near the top" must map to a small y, not a
  // large one.
  return {
    x: (ndcX * 0.5 + 0.5) * cssWidth,
    y: (1 - (ndcY * 0.5 + 0.5)) * cssHeight,
    depth: clipW,
  };
}

//#endregion

//#region Projection Helpers

/** `matrix * [x, y, z, 1]`, returning clip-space x, y and w (z is not needed). */
function transformPoint(matrix: mat4, x: number, y: number, z: number): [number, number, number] {
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15],
  ];
}

/** Mercator x/y (0..1) to a point on the unit sphere, matching MapLibre's `projectToSphere` shader function. */
function mercatorToUnitSphere(x: number, y: number): [number, number, number] {
  const sphericalX = x * Math.PI * 2 + Math.PI;
  const t = Math.exp(Math.PI - y * Math.PI * 2);
  const t2 = t * t;
  const sinY = (t2 - 1) / (t2 + 1);
  const cosY = (2 * t) / (t2 + 1);
  return [Math.sin(sphericalX) * cosY, sinY, Math.cos(sphericalX) * cosY];
}

//#endregion

//#region computeAltitudeProjection

/**
 * `groundBase` — MapLibre's own native marker position (terrain height, or 0 without terrain).
 * `elevated` — the target: `nativeElevation + altitudeMeters` under `"ground"`, or plain `altitudeMeters` under `"sea"`.
 * `belowGround` — `elevated` under `groundBase`, for fading markers DOM can't depth-test against terrain.
 */
export function computeAltitudeProjection(
  lngLat: LngLat,
  altitudeMeters: number,
  projectionData: CustomLayerProjectionData,
  map: MLMap,
  relativeTo: AltitudeReference,
): { groundBase: ScreenPoint; elevated: ScreenPoint; belowGround: boolean } | null {
  const nativeElevation = map.getTerrain() ? (map.queryTerrainElevation(lngLat) ?? 0) : 0;
  const groundBase = projectLngLatAltitude(lngLat, nativeElevation, projectionData, map);

  const targetElevation = relativeTo === "ground" ? nativeElevation + altitudeMeters : altitudeMeters;
  const elevated = projectLngLatAltitude(lngLat, targetElevation, projectionData, map);

  if (!groundBase || !elevated) return null; // behind camera this frame

  return { groundBase, elevated, belowGround: targetElevation < nativeElevation };
}

//#endregion
