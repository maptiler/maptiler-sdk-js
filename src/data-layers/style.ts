import type { DataDrivenPropertyValueSpecification, ExpressionSpecification } from "maplibre-gl";
import { latest as styleSpec } from "@maplibre/maplibre-gl-style-spec";
import type { ColorRamp, RgbaColor } from "../ColorRamp";
import { dashArrayMaker, paintColorOptionsToPaintSpec, rampedOptionsToLayerPaintSpec } from "../helpers/stylehelper";
import type { DataLayerColor, DataLayerDashArray, DataLayerNumber } from "./types";

// Style helpers shared by the data layers. Internal — not exported from the package.

/** Keeps Point and MultiPoint features — `geometry-type` reports both as `"Point"`. */
export const POINT_GEOMETRY_FILTER: ExpressionSpecification = ["==", ["geometry-type"], "Point"];

/**
 * Keeps lines and polygons, single or multi — what `LineLayer` and
 * `PolygonLayer` draw, each in its own way: a line layer draws a polygon's
 * rings, and a fill layer fills a line as a ring closed back to its start.
 */
export const LINE_AND_POLYGON_GEOMETRY_FILTER: ExpressionSpecification = ["!=", ["geometry-type"], "Point"];

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

/** The zoom limits of a layer's range, as the style spec sets them — a range ending at one has nothing to fade from. */
export const MIN_ZOOM = styleSpec.layer.minzoom.minimum;
export const MAX_ZOOM = styleSpec.layer.maxzoom.maximum;

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

//#region Values

/** A number as is, a zoom ramp as an interpolation over the zoom, an expression as is. */
export function resolveNumber(value: DataLayerNumber): DataDrivenPropertyValueSpecification<number> {
  if (typeof value === "number" || isExpression(value)) return value;
  return rampedOptionsToLayerPaintSpec(value);
}

/**
 * A colour as MapLibre takes it:
 *
 * | `color`                       | Result                                                                          |
 * | ----------------------------- | ------------------------------------------------------------------------------- |
 * | CSS colour or expression      | as is                                                                           |
 * | `ZoomStringValues`            | interpolated over the zoom                                                      |
 * | `ColorRamp`, `property` set   | interpolated over `property`'s value, a missing value reading the ramp's start  |
 * | `ColorRamp`, `property` unset | the ramp's lowest colour                                                        |
 *
 * A `ColorRamp`'s alpha carries over, so a ramp can fade features out.
 */
export function resolveColor(color: DataLayerColor, property: string | undefined): DataDrivenPropertyValueSpecification<string> {
  if (typeof color === "string" || isExpression(color)) return color;

  const ramp = colorRampOf(color);
  if (!ramp) return paintColorOptionsToPaintSpec(color as Exclude<DataLayerColor, ColorRamp | string | ExpressionSpecification>);

  const stops = ramp.getRawColorStops().sort((a, b) => a.value - b.value);
  if (!property || stops.length === 1) return toCssColor(stops[0].color);
  return ["interpolate", ["linear"], ["to-number", ["get", property], stops[0].value], ...stops.flatMap((stop) => [stop.value, toCssColor(stop.color)])];
}

/** A dash pattern as MapLibre takes it — the string shorthand turned into numbers. */
export function resolveDashArray(dashArray: DataLayerDashArray): number[] {
  return typeof dashArray === "string" ? dashArrayMaker(dashArray) : dashArray;
}

/** `color` when it's a `ColorRamp` — told from a zoom ramp by its methods, as both are arrays of objects. */
function colorRampOf(color: DataLayerColor): ColorRamp | undefined {
  return Array.isArray(color) && typeof (color as Partial<ColorRamp>).getRawColorStops === "function" ? (color as ColorRamp) : undefined;
}

function toCssColor([r, g, b, a = 255]: RgbaColor): string {
  return `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(a / 255)})`;
}

//#endregion
