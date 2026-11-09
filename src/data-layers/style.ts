import type { ExpressionSpecification } from "maplibre-gl";

// Style helpers shared by the data layers. Internal — not exported from the package.

/** Keeps Point and MultiPoint features — `geometry-type` reports both as `"Point"`. */
export const POINT_GEOMETRY_FILTER: ExpressionSpecification = ["==", ["geometry-type"], "Point"];

/**
 * Whether a style value is a MapLibre expression, passed through as is.
 * Expressions start with their operator, while zoom ramps, property ramps and
 * `ColorRamp`s are arrays of objects.
 */
export function isExpression(value: unknown): value is ExpressionSpecification {
  return Array.isArray(value) && typeof value[0] === "string";
}

/** Whether an expression reads `["zoom"]` anywhere, which MapLibre only allows as the input of a top-level step / interpolate. */
export function usesZoom(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  if (value.length === 1 && value[0] === "zoom") return true;
  return value.some(usesZoom);
}

/** The map's own zoom limits — a layer's range ending at one has nothing to fade from. */
const MIN_ZOOM = 0;
const MAX_ZOOM = 24;

/**
 * `opacity` faded in over `fade` zooms after `minzoom` and out over `fade`
 * zooms before `maxzoom`, as a top-level zoom interpolation — so `opacity`
 * itself mustn't read the zoom. Edges at the map's own zoom limits don't
 * fade, and a range narrower than its fades fades in and straight back out.
 */
export function fadeAtZoomEdges(opacity: number | ExpressionSpecification, minzoom: number, maxzoom: number, fade: number): number | ExpressionSpecification {
  const fadeIn = minzoom > MIN_ZOOM;
  const fadeOut = maxzoom < MAX_ZOOM;
  if (fade <= 0 || maxzoom <= minzoom || (!fadeIn && !fadeOut)) return opacity;

  const span = Math.min(fade, (maxzoom - minzoom) / (fadeIn && fadeOut ? 2 : 1));
  const stops: (number | ExpressionSpecification)[] = [];
  if (fadeIn) stops.push(minzoom, 0, minzoom + span, opacity);
  // a fade in meeting the fade out shares its stop
  if (fadeOut && !(fadeIn && minzoom + span === maxzoom - span)) stops.push(maxzoom - span, opacity);
  if (fadeOut) stops.push(maxzoom, 0);
  return ["interpolate", ["linear"], ["zoom"], ...stops] as ExpressionSpecification;
}
