// Pure math, no DOM/MapLibre side effects — called every frame per marker.
import maplibregl from "maplibre-gl";
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

/** Projects `lngLat`/`altitudeMeters` to a screen point via `matrix` (mainMatrix). Uses `getMatrixForModel` so it works under both mercator and globe. */
export function projectLngLatAltitude(lngLat: maplibregl.LngLat, altitudeMeters: number, matrix: mat4, map: maplibregl.Map): ScreenPoint | null {
  const model = map.transform.getMatrixForModel(lngLat, altitudeMeters);
  const worldX = model[12];
  const worldY = model[13];
  const worldZ = model[14];

  const clipX = matrix[0] * worldX + matrix[4] * worldY + matrix[8] * worldZ + matrix[12];
  const clipY = matrix[1] * worldX + matrix[5] * worldY + matrix[9] * worldZ + matrix[13];
  const clipW = matrix[3] * worldX + matrix[7] * worldY + matrix[11] * worldZ + matrix[15];

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

//#region computeAltitudeProjection

/**
 * `groundBase` — MapLibre's own native marker position (terrain height, or 0 without terrain).
 * `elevated` — the target: `nativeElevation + altitudeMeters` under `"ground"`, or plain `altitudeMeters` under `"sea"`.
 * `belowGround` — `elevated` under `groundBase`, for fading markers DOM can't depth-test against terrain.
 */
export function computeAltitudeProjection(
  lngLat: maplibregl.LngLat,
  altitudeMeters: number,
  matrix: mat4,
  map: maplibregl.Map,
  relativeTo: AltitudeReference,
): { groundBase: ScreenPoint; elevated: ScreenPoint; belowGround: boolean } | null {
  const nativeElevation = map.getTerrain() ? (map.queryTerrainElevation(lngLat) ?? 0) : 0;
  const groundBase = projectLngLatAltitude(lngLat, nativeElevation, matrix, map);

  const targetElevation = relativeTo === "ground" ? nativeElevation + altitudeMeters : altitudeMeters;
  const elevated = projectLngLatAltitude(lngLat, targetElevation, matrix, map);

  if (!groundBase || !elevated) return null; // behind camera this frame

  return { groundBase, elevated, belowGround: targetElevation < nativeElevation };
}

//#endregion
