/**
 * @packageDocumentation
 * Turns a {@link HeatmapLayerStyle} into the MapLibre `heatmap` layer that
 * `HeatmapLayer` draws. Pure functions only: no map, no state — the
 * layer passes in its ids and its zoom range fade, and adds or syncs what
 * comes back.
 *
 * Ported from the `addHeatmap` helper's spec logic, and kept as a copy rather
 * than shared, so `addHeatmap` stays frozen. For the same options, the layer
 * built here matches `addHeatmap`'s (the parity tests in
 * `test/data-layers/HeatmapLayer.test.ts` check it), with two deliberate
 * differences:
 *
 * - `property` alone weights the points by its value. `addHeatmap` ignores
 *   `property` without a `weight`.
 * - Any opacity is faded at the edges of the layer's zoom range, where
 *   `addHeatmap` only fades its default one.
 *
 * Each style value takes one of these forms, resolved in this order:
 *
 * 1. A number — used as is.
 * 2. A MapLibre expression — passed through as is. The user owns it.
 * 3. `ZoomNumberValues` (`{ zoom, value }[]`) — an interpolation over the zoom.
 * 4. `PropertyValues` (`{ propertyValue, value }[]`) — an interpolation over
 *    `property`'s value, for `weight` and `radius` only. Without `property`
 *    there's nothing to read, so it warns and falls back (see
 *    {@link resolveWeight} and {@link resolveRadius}).
 */

import type { DataDrivenPropertyValueSpecification, ExpressionSpecification, PropertyValueSpecification } from "maplibre-gl";
import type { ColorRamp } from "../../ColorRamp";
import type { PropertyValues, ZoomNumberValues } from "../../helpers/vectorlayerhelpers";
import { heatmapIntensityFromColorRamp, radiusDrivenByPropertyHeatmap, rampedOptionsToLayerPaintSpec, rampedPropertyValueWeight } from "../../helpers/stylehelper";
import type { SublayerSpecification } from "../DataLayer";
import { isExpression } from "../style";
import type { HeatmapLayerStyle } from "./types";

//#region Types

/** Everything besides style that the heatmap layer depends on. */
export type HeatmapRenderContext = {
  /** Id of the `HeatmapLayer` — the sublayer's id derives from it (see {@link getHeatmapLayerId}). */
  layerId: string;
  /** Id of the GeoJSON source the sublayer draws, which may be shared with other data layers. */
  sourceId: string;
  /** Adds the layer's fade at the edges of its zoom range — see `DataLayer.fadeOpacity`. */
  fadeOpacity: (opacity: number | ExpressionSpecification) => number | ExpressionSpecification;
};

//#endregion

//#region Constants

/**
 * `intensity` when unset, as in `addHeatmap`. Rises with the zoom to offset
 * the points spreading apart on screen, so the heatmap looks alike at every zoom.
 */
const DEFAULT_INTENSITY: ZoomNumberValues = [
  { zoom: 0, value: 0.01 },
  { zoom: 4, value: 0.2 },
  { zoom: 16, value: 1 },
];

/**
 * `radius` (px) when unset and `zoomCompensation` is on, as in `addHeatmap`:
 * fractions of 50 px growing to the full 50 px at zoom 16, so each point
 * covers about the same ground at every zoom.
 */
const DEFAULT_RADIUS: ZoomNumberValues = [
  { zoom: 0, value: 50 * 0.025 },
  { zoom: 2, value: 50 * 0.05 },
  { zoom: 4, value: 50 * 0.1 },
  { zoom: 8, value: 50 * 0.25 },
  { zoom: 16, value: 50 },
];

/** `radius` (px) when unset and `zoomCompensation` is off — the same at every zoom. */
const DEFAULT_FIXED_RADIUS = 10;

//#endregion

//#region Style

/**
 * Fills in `addHeatmap`'s defaults for `radius`, `intensity` and
 * `zoomCompensation`. `color` has no default yet, so the `HeatmapLayer`
 * constructor requires it. `weight` and `opacity` are left unset, as their
 * defaults depend on other keys and are resolved when the layer is built.
 *
 * @param style - Style as set by the user.
 * @returns A copy of `style` with the defaults filled in. `style` itself is unchanged.
 */
export function resolveHeatmapStyle(style: HeatmapLayerStyle): HeatmapLayerStyle {
  const zoomCompensation = style.zoomCompensation ?? true;
  return {
    ...style,
    radius: style.radius ?? (zoomCompensation ? DEFAULT_RADIUS : DEFAULT_FIXED_RADIUS),
    intensity: style.intensity ?? DEFAULT_INTENSITY,
    zoomCompensation,
  };
}

/**
 * Prepares `color` for `heatmap-color`, which reads the ramp along the density, from `0` to `1`:
 *
 * - The ramp is scaled to `[0, 1]`, so a ramp over any range (e.g. `0`–`100`) works.
 * - It's given a transparent start unless it already has one, so areas with
 *   no points show the map beneath rather than the ramp's first colour.
 *
 * @param color - The user's ramp. It's never changed: `scale()` returns a copy,
 *   which is then made transparent, as `transparentStart()` changes the colours it's given.
 * @returns A new ramp over `[0, 1]` with a transparent start.
 */
export function normalizeHeatmapRamp(color: ColorRamp): ColorRamp {
  const scaled = color.scale(0, 1);
  return scaled.hasTransparentStart() ? scaled : scaled.transparentStart();
}

//#endregion

//#region Layers

/**
 * Id of the heatmap sublayer: the layer's id with a `-heatmap` suffix.
 * @param layerId - Id of the `HeatmapLayer`.
 */
export function getHeatmapLayerId(layerId: string): string {
  return `${layerId}-heatmap`;
}

/**
 * Builds the heatmap sublayer. `DataLayer.addSublayer` adds the points-only
 * filter when it adds the sublayer to the map.
 *
 * @param style - Resolved style (see {@link resolveHeatmapStyle}).
 * @param context - Ids and the zoom range fade.
 * @returns The one `heatmap` sublayer, in an array as data layers can have several.
 */
export function buildHeatmapLayers(style: HeatmapLayerStyle, context: HeatmapRenderContext): SublayerSpecification[] {
  return [
    {
      id: getHeatmapLayerId(context.layerId),
      type: "heatmap",
      source: context.sourceId,
      paint: {
        "heatmap-weight": resolveWeight(style),
        "heatmap-intensity": resolveIntensity(style),
        "heatmap-color": heatmapIntensityFromColorRamp(normalizeHeatmapRamp(style.color)),
        "heatmap-radius": resolveRadius(style),
        "heatmap-opacity": resolveOpacity(style, context),
      },
    },
  ];
}

/**
 * `heatmap-weight`: how much each point adds to the density.
 *
 * | `weight`         | `property` | Result                                                         |
 * | ---------------- | ---------- | -------------------------------------------------------------- |
 * | number or expression | any    | `weight` as is                                                 |
 * | `PropertyValues` | set        | interpolated over `property`'s value                           |
 * | `PropertyValues` | unset      | `1`, with a warning — there's no value to read the mapping at   |
 * | unset            | set        | `property`'s value, missing or negative values counting as `0`  |
 * | unset            | unset      | `1` — every point weighs the same                              |
 */
function resolveWeight(style: HeatmapLayerStyle): DataDrivenPropertyValueSpecification<number> {
  const { weight, property } = style;

  if (typeof weight === "number" || isExpression(weight)) return weight;
  if (weight !== undefined) {
    if (property) return rampedPropertyValueWeight(weight, property);
    console.warn("HeatmapLayer: a `PropertyValues` `weight` needs `property`, so every point weighs 1.");
    return 1;
  }
  // a missing or negative value would subtract from the density
  return property ? ["max", 0, ["to-number", ["get", property], 0]] : 1;
}

/**
 * `heatmap-radius`: how far each point's influence reaches, in px.
 *
 * | `radius`           | Result                                                                                   |
 * | ------------------ | ---------------------------------------------------------------------------------------- |
 * | unset              | {@link DEFAULT_RADIUS} over the zoom, or {@link DEFAULT_FIXED_RADIUS} without `zoomCompensation` |
 * | number or expression | `radius` as is                                                                         |
 * | `ZoomNumberValues` | interpolated over the zoom                                                               |
 * | `PropertyValues`, `property` set | interpolated over `property`'s value, and scaled by the zoom unless `zoomCompensation` is off |
 * | `PropertyValues`, `property` unset | {@link DEFAULT_RADIUS} over the zoom, with a warning — there's no value to read the mapping at |
 *
 * The last fallback uses the zoom-driven default whatever `zoomCompensation`
 * says, matching `addHeatmap`.
 */
function resolveRadius(style: HeatmapLayerStyle): DataDrivenPropertyValueSpecification<number> {
  const { radius, property } = style;
  const zoomCompensation = style.zoomCompensation ?? true;

  if (radius === undefined) return zoomCompensation ? rampedOptionsToLayerPaintSpec(DEFAULT_RADIUS) : DEFAULT_FIXED_RADIUS;
  if (typeof radius === "number" || isExpression(radius)) return radius;
  if (!isPropertyValues(radius)) return rampedOptionsToLayerPaintSpec(radius);
  if (property) return radiusDrivenByPropertyHeatmap(radius, property, zoomCompensation);

  console.warn("HeatmapLayer: a `PropertyValues` `radius` needs `property`, so the default radius is used.");
  return rampedOptionsToLayerPaintSpec(DEFAULT_RADIUS);
}

/**
 * `heatmap-intensity`: a multiplier of the density, so the same points can look
 * hotter or cooler. Unset, it's {@link DEFAULT_INTENSITY}. A number or an
 * expression is used as is, and a `ZoomNumberValues` is interpolated over the zoom.
 */
function resolveIntensity(style: HeatmapLayerStyle): PropertyValueSpecification<number> {
  const intensity = style.intensity ?? DEFAULT_INTENSITY;
  if (typeof intensity === "number" || isExpression(intensity)) return intensity;
  return rampedOptionsToLayerPaintSpec(intensity) as PropertyValueSpecification<number>;
}

/**
 * `heatmap-opacity`: `opacity`, or `1` when unset, passed through the layer's
 * zoom range fade so the heatmap fades in after `minzoom` and out before `maxzoom`.
 *
 * MapLibre allows `["zoom"]` only at the top level of an interpolation, so an
 * opacity that already reads the zoom can't be nested inside the fade.
 * `fadeOpacity` keeps such an opacity as is, replacing the fade, which means:
 *
 * - number: faded at the zoom range's edges.
 * - `ZoomNumberValues`: interpolated over the zoom as given, with no fade.
 *   Include the edges in the ramp to fade there.
 * - expression: faded, unless it reads the zoom, in which case it's used as is.
 */
function resolveOpacity(style: HeatmapLayerStyle, context: HeatmapRenderContext): PropertyValueSpecification<number> {
  const { opacity = 1 } = style;
  if (typeof opacity === "number" || isExpression(opacity)) return context.fadeOpacity(opacity) as PropertyValueSpecification<number>;
  return context.fadeOpacity(rampedOptionsToLayerPaintSpec(opacity) as ExpressionSpecification) as PropertyValueSpecification<number>;
}

/**
 * Tells `PropertyValues` (`{ propertyValue, value }[]`) from `ZoomNumberValues`
 * (`{ zoom, value }[]`) by the first entry. An empty array counts as
 * `ZoomNumberValues`, as there's nothing to tell them apart by.
 */
function isPropertyValues(values: ZoomNumberValues | PropertyValues): values is PropertyValues {
  return values.length > 0 && "propertyValue" in values[0];
}

//#endregion
