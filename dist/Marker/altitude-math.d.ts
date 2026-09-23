import { default as maplibregl } from 'maplibre-gl';
import { mat4 } from 'gl-matrix';
import { AltitudeReference } from './types';
/** A screen-space position in CSS pixels, DOM convention (+y down). */
export interface ScreenPoint {
    x: number;
    y: number;
    /** Clip-space W — proportional to camera distance. For ordering points against each other, not a real distance. */
    depth: number;
}
/** Projects `lngLat`/`altitudeMeters` to a screen point via `matrix` (mainMatrix). Uses `getMatrixForModel` so it works under both mercator and globe. */
export declare function projectLngLatAltitude(lngLat: maplibregl.LngLat, altitudeMeters: number, matrix: mat4, map: maplibregl.Map): ScreenPoint | null;
/**
 * `groundBase` — MapLibre's own native marker position (terrain height, or 0 without terrain).
 * `elevated` — the target: `nativeElevation + altitudeMeters` under `"ground"`, or plain `altitudeMeters` under `"sea"`.
 * `belowGround` — `elevated` under `groundBase`, for fading markers DOM can't depth-test against terrain.
 */
export declare function computeAltitudeProjection(lngLat: maplibregl.LngLat, altitudeMeters: number, matrix: mat4, map: maplibregl.Map, relativeTo: AltitudeReference): {
    groundBase: ScreenPoint;
    elevated: ScreenPoint;
    belowGround: boolean;
} | null;
