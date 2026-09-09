import maplibregl from "maplibre-gl";
import type { mat4 } from "gl-matrix";
import type { AltitudeReference } from "./types";

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

/**
 * `matrix` is column-major, OpenGL convention: element `matrix[col * 4 + row]`.
 * clip = matrix * [x, y, z, 1] — only the x, y and w rows are needed since
 * we're projecting a single point, not building a full transform.
 *
 * Mercator only: under globe projection this same matrix instead projects a
 * unit-sphere planet, not flat mercator tile space, and `MercatorCoordinate`
 * stops meaning the same thing to it — this function would silently return
 * plausible-looking but wrong screen positions. Guard on
 * `map.getProjection?.().type !== 'mercator'` before relying on any of this
 * if the app supports globe.
 */
export function projectLngLatAltitude(lngLat: maplibregl.LngLat, altitudeMeters: number, matrix: mat4, map: maplibregl.Map): ScreenPoint | null {
  const mercator = maplibregl.MercatorCoordinate.fromLngLat(lngLat, altitudeMeters);

  const clipX = matrix[0] * mercator.x + matrix[4] * mercator.y + matrix[8] * mercator.z + matrix[12];
  const clipY = matrix[1] * mercator.x + matrix[5] * mercator.y + matrix[9] * mercator.z + matrix[13];
  const clipW = matrix[3] * mercator.x + matrix[7] * mercator.y + matrix[11] * mercator.z + matrix[15];

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
 */
export function computeAltitudeProjection(
  lngLat: maplibregl.LngLat,
  altitudeMeters: number,
  matrix: mat4,
  map: maplibregl.Map,
  relativeTo: AltitudeReference,
): { groundBase: ScreenPoint; elevated: ScreenPoint } | null {
  const nativeElevation = map.getTerrain() ? (map.queryTerrainElevation(lngLat) ?? 0) : 0;
  const groundBase = projectLngLatAltitude(lngLat, nativeElevation, matrix, map);
  const targetElevation = relativeTo === "ground" ? nativeElevation + altitudeMeters : altitudeMeters;
  const elevated = projectLngLatAltitude(lngLat, targetElevation, matrix, map);
  if (!groundBase || !elevated) return null;
  return { groundBase, elevated };
}
