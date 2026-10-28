import type { ExpressionSpecification } from "maplibre-gl";

// Styling helpers shared by the data layers. Internal — not exported from the package.

/** Keeps Point and MultiPoint features — `geometry-type` reports both as `"Point"`. */
export const POINT_GEOMETRY_FILTER: ExpressionSpecification = ["==", ["geometry-type"], "Point"];

/**
 * Whether a styling value is a MapLibre expression, passed through as is.
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
