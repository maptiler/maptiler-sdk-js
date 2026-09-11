// This module is pure math — no DOM, no MapLibre subclassing, no side
// effects. Everything here is called once per marker per render frame (see
// MarkerManager's altitude render loop), so it stays allocation-light and
// free of anything that would need cleanup.
import maplibregl from "maplibre-gl";
import type { mat4 } from "gl-matrix";
import type { AltitudeReference } from "./types";

//#region ScreenPoint

/** A screen-space position in CSS pixels, DOM convention (+y down). */
export interface ScreenPoint {
  x: number;
  y: number;
  /**
   * Clip-space W for this point — proportional to distance from the camera
   * along the view direction. Larger = farther away. Only meaningful for
   * *ordering* points against each other from the same frame/matrix, not as
   * a physical distance (it's not in meters, and its scale depends on the
   * projection matrix).
   */
  depth: number;
}

//#endregion

//#region projectLngLatAltitude

/**
 * `matrix` is column-major, OpenGL convention: element `matrix[col * 4 + row]`.
 * clip = matrix * [x, y, z, 1] — only the x, y and w rows are needed since
 * we're projecting a single point, not building a full transform.
 *
 * Projection-agnostic: `map.transform.getMatrixForModel(lngLat, altitude)`
 * (the same primitive maptiler-3d-js uses to place 3D models correctly under
 * both projections) returns a matrix whose translation column is the world
 * point for `lngLat`/`altitude` in whatever space the active projection
 * uses — flat mercator tile space under mercator, a point on the unit-sphere
 * planet under globe — which is exactly the space `matrix` (the custom
 * layer's `mainMatrix`) expects either way. Under mercator this translation
 * column is numerically identical to `MercatorCoordinate.fromLngLat`, so
 * this is a superset of the old mercator-only math, not a behaviour change
 * for it.
 */
export function projectLngLatAltitude(lngLat: maplibregl.LngLat, altitudeMeters: number, matrix: mat4, map: maplibregl.Map): ScreenPoint | null {
  const model = map.transform.getMatrixForModel(lngLat, altitudeMeters);
  const worldX = model[12];
  const worldY = model[13];
  const worldZ = model[14];

  const clipX = matrix[0] * worldX + matrix[4] * worldY + matrix[8] * worldZ + matrix[12];
  const clipY = matrix[1] * worldX + matrix[5] * worldY + matrix[9] * worldZ + matrix[13];
  const clipW = matrix[3] * worldX + matrix[7] * worldY + matrix[11] * worldZ + matrix[15];

  // Point projects behind the camera — there is no sane screen position for it.
  if (clipW <= 0) return null;

  // Perspective divide: clip space -> normalized device coordinates (-1..1 on both axes).
  const ndcX = clipX / clipW;
  const ndcY = clipY / clipW;

  // clientWidth/clientHeight are CSS pixels; the canvas's own width/height
  // attributes are the (possibly devicePixelRatio-scaled) backing store —
  // using those instead would place everything wrong by the DPR factor on retina.
  const cssWidth = map.getCanvas().clientWidth;
  const cssHeight = map.getCanvas().clientHeight;

  return {
    x: (ndcX * 0.5 + 0.5) * cssWidth,
    // NDC's Y axis points up (+1 = top); the DOM's points down (+y = down) — flipped here.
    y: (1 - (ndcY * 0.5 + 0.5)) * cssHeight,
    depth: clipW,
  };
}

//#endregion

//#region computeAltitudeProjection

/**
 * Two points, through the same matrix/frame:
 *
 * - `groundBase` — mercator Z = `nativeElevation`, the terrain height at
 *   `lngLat` whenever the *map* has terrain enabled, 0 otherwise. This is
 *   NOT gated on `relativeTo` — it's what MapLibre's own `Marker` positions
 *   itself at natively (`this._pos = this._map.project(this._lngLat)`,
 *   and `Map.prototype.project` internally calls
 *   `this.transform.locationToScreenPoint(lngLat, this.style && this.terrain)`
 *   — it passes the map's terrain through unconditionally). MapLibre has no
 *   concept of a per-marker altitude reference: whenever the map has
 *   terrain, EVERY marker's native position already sits on it, regardless
 *   of what this specific marker's `relativeTo` is set to. Every pixel
 *   offset this SDK writes gets added on top of that already-elevated
 *   native `_pos`, so our own offset has to be measured from this same
 *   baseline, or the two double up (`relativeTo: "ground"`) or fight
 *   (`relativeTo: "sea"`, where MapLibre still elevates the base natively
 *   even though the *target* shouldn't be terrain-relative at all).
 * - `elevated` — mercator Z = `nativeElevation + altitudeMeters` under
 *   `relativeTo: "ground"` (both terms are the *same* terrain query, so this
 *   just means "however high MapLibre already put it, plus the user's
 *   meters"), or plain `altitudeMeters` under `relativeTo: "sea"` (absolute,
 *   deliberately ignoring `nativeElevation` — this is what makes the
 *   resulting delta *subtract* the terrain height back out, undoing
 *   MapLibre's native elevation to land at a true sea-level position).
 *
 * The ground-line's visual "ground" endpoint is the same `groundBase` point
 * — there's only one ground (the real terrain surface, or sea level when
 * there's no terrain), and it's also exactly what the offset is measured
 * from, so no second projection or separate point is needed for it.
 *
 * `queryTerrainElevation` returns `null` when terrain isn't enabled/loaded,
 * treated as 0.
 *
 * `belowGround` — `targetElevation < nativeElevation` — is mode-agnostic for
 * free: under `"ground"` it only trips with a negative `altitudeMeters`
 * (tunneling below whatever terrain/sea level it's relative to); under
 * `"sea"` it trips whenever the absolute altitude is lower than the real
 * terrain surface there, e.g. `0` over a hill. DOM markers aren't
 * depth-tested against the terrain mesh, so without this a marker "below
 * ground" would render right through the hillside instead of being hidden
 * by it.
 */
export function computeAltitudeProjection(
  lngLat: maplibregl.LngLat,
  altitudeMeters: number,
  matrix: mat4,
  map: maplibregl.Map,
  relativeTo: AltitudeReference,
): { groundBase: ScreenPoint; elevated: ScreenPoint; belowGround: boolean } | null {
  // 0 whenever the map has no terrain (or it hasn't loaded for this
  // lngLat yet) — see the doc comment above for why this ignores `relativeTo`.
  const nativeElevation = map.getTerrain() ? (map.queryTerrainElevation(lngLat) ?? 0) : 0;

  // Where MapLibre's own marker _pos already sits — the baseline every
  // pixel offset this SDK writes has to be measured from.
  const groundBase = projectLngLatAltitude(lngLat, nativeElevation, matrix, map);

  // Where the marker should actually end up, in mercator Z terms — see the
  // `elevated` bullet in the doc comment for the two branches.
  const targetElevation = relativeTo === "ground" ? nativeElevation + altitudeMeters : altitudeMeters;
  const elevated = projectLngLatAltitude(lngLat, targetElevation, matrix, map);

  // Either point can come back null if it's behind the camera this frame —
  // bail out rather than return a partially-valid result.
  if (!groundBase || !elevated) return null;

  return { groundBase, elevated, belowGround: targetElevation < nativeElevation };
}

//#endregion
