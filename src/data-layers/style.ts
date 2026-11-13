import type { DataDrivenPropertyValueSpecification, ExpressionSpecification } from "maplibre-gl";
import { latest as styleSpec } from "@maplibre/maplibre-gl-style-spec";
import type { ColorRamp, RgbaColor } from "../ColorRamp";
import { dashArrayMaker, paintColorOptionsToPaintSpec, rampedOptionsToLayerPaintSpec } from "../helpers/stylehelper";
import type { DataLayerColor, DataLayerDash, DataLayerNumber } from "./types";

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

const DASHED: number[] = [2, 1.5];
const DOTTED: number[] = [0.5, 2];

/** A dash pattern as MapLibre takes it, or `undefined` for a solid line — `line-dasharray` must then be left out, as `undefined` hides the line. */
export function resolveDash(dash: DataLayerDash | undefined): number[] | undefined {
  if (dash === undefined || dash === false) return undefined;
  if (dash === true || dash === "dashed") return DASHED;
  if (dash === "dotted") return DOTTED;
  return typeof dash === "string" ? dashArrayMaker(dash) : dash;
}

/**
 * `width` times `factor`. A width reading the zoom can only be scaled when
 * the zoom is its top-level input, as MapLibre allows `["zoom"]` nowhere else
 * — each output is scaled then.
 * @returns The scaled width, or `undefined` when it can't be scaled.
 */
export function scaleWidth(width: DataDrivenPropertyValueSpecification<number>, factor: number): DataDrivenPropertyValueSpecification<number> | undefined {
  if (typeof width === "number") return width * factor;
  if (!usesZoom(width)) return ["*", factor, width] as ExpressionSpecification;
  return mapZoomCurveOutputs(width, (output) => (typeof output === "number" ? output * factor : ["*", factor, output]));
}

/**
 * `a + b`, for widths of any kind. One of them may read the zoom, as long as
 * the zoom is its top-level input — the other is then added to each of its
 * outputs.
 * @returns The sum, or `undefined` when both read the zoom, or one does other than at its top level.
 */
export function sumWidths(
  a: DataDrivenPropertyValueSpecification<number>,
  b: DataDrivenPropertyValueSpecification<number>,
): DataDrivenPropertyValueSpecification<number> | undefined {
  const add = (x: unknown, y: unknown) => (typeof x === "number" && typeof y === "number" ? x + y : (["+", x, y] as ExpressionSpecification));
  const aUsesZoom = usesZoom(a);
  const bUsesZoom = usesZoom(b);

  if (!aUsesZoom && !bUsesZoom) return add(a, b);
  if (aUsesZoom && !bUsesZoom) return mapZoomCurveOutputs(a, (output) => add(output, b));
  if (bUsesZoom && !aUsesZoom) return mapZoomCurveOutputs(b, (output) => add(a, output));
  return undefined;
}

/**
 * A top-level zoom `interpolate` or `step` with each output mapped — `undefined`
 * for anything else that reads the zoom, which can't be changed without nesting it.
 */
function mapZoomCurveOutputs(curve: unknown, map: (output: unknown) => unknown): ExpressionSpecification | undefined {
  if (!Array.isArray(curve)) return undefined;
  const isZoom = (input: unknown) => Array.isArray(input) && input.length === 1 && input[0] === "zoom";

  if ((curve[0] === "interpolate" || curve[0] === "interpolate-hcl" || curve[0] === "interpolate-lab") && isZoom(curve[2])) {
    const [operator, interpolation, input, ...stops] = curve as unknown[];
    // outputs mustn't read the zoom themselves
    if (stops.some((stop, i) => i % 2 === 1 && usesZoom(stop))) return undefined;
    return [operator, interpolation, input, ...stops.map((stop, i) => (i % 2 === 1 ? map(stop) : stop))] as ExpressionSpecification;
  }
  if (curve[0] === "step" && isZoom(curve[1])) {
    const [operator, input, ...rest] = curve as unknown[];
    if (rest.some((value, i) => i % 2 === 0 && usesZoom(value))) return undefined;
    // the default output, then stop / output pairs
    return [operator, input, ...rest.map((value, i) => (i % 2 === 0 ? map(value) : value))] as ExpressionSpecification;
  }
  return undefined;
}

/** `color` when it's a `ColorRamp` — told from a zoom ramp by its methods, as both are arrays of objects. */
function colorRampOf(color: DataLayerColor): ColorRamp | undefined {
  return Array.isArray(color) && typeof (color as Partial<ColorRamp>).getRawColorStops === "function" ? (color as ColorRamp) : undefined;
}

function toCssColor([r, g, b, a = 255]: RgbaColor): string {
  return `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(a / 255)})`;
}

//#endregion
