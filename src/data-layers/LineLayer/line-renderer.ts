/**
 * @packageDocumentation
 * Turns a {@link LineLayerStyle} into the sublayers `LineLayer` draws: the
 * lines, over a casing when `outline` is on. Pure functions only.
 *
 * Ported from the `addPolyline` helper's spec logic, and kept as a copy rather
 * than shared, so `addPolyline` stays frozen. Defaults are the helper's, except
 * that `color` has none yet (the layer requires it), and the zoom range is the
 * data layers' (`0`–`24`) rather than the helper's (`0`–`23`).
 *
 * One deliberate difference: `addPolyline` draws its casing as a solid line
 * wider than the line, beneath it. Here the casing is two strokes, either side
 * of a gap as wide as the line (`line-gap-width`), so:
 *
 * - it hugs a width of any kind — data-driven, or an expression reading the
 *   zoom — which a sum of the two widths can't, as `["zoom"]` can't be nested;
 * - a translucent line shows the map through it rather than the casing.
 */

import type { DataDrivenPropertyValueSpecification, ExpressionSpecification } from "maplibre-gl";
import type { PropertyValues } from "../../helpers/vectorlayerhelpers";
import { rampedPropertyValueWeight } from "../../helpers/stylehelper";
import type { SublayerSpecification } from "../DataLayer";
import { resolveColor, resolveDashArray, resolveNumber } from "../style";
import type { LineLayerStyle } from "./types";

//#region Types

/** Everything besides style that the line sublayers depend on. */
export type LineRenderContext = {
  /** Id of the `LineLayer` — the sublayers' ids derive from it (see {@link getLineLayerIds}). */
  layerId: string;
  /** Id of the GeoJSON source the sublayers draw, which may be shared with other data layers. */
  sourceId: string;
  /** Adds the layer's fade at the edges of its zoom range — see `DataLayer.fadeOpacity`. */
  fadeOpacity: (opacity: number | ExpressionSpecification) => number | ExpressionSpecification;
};

//#endregion

//#region Style

const DEFAULT_WIDTH = 3;
const DEFAULT_OUTLINE_COLOR = "#FFFFFF";

/**
 * Fills in `addPolyline`'s defaults. `color` has none.
 * @param style - Style as set by the user.
 * @returns A copy of `style` with the defaults filled in.
 */
export function resolveLineStyle(style: LineLayerStyle): LineLayerStyle {
  return {
    ...style,
    width: style.width ?? DEFAULT_WIDTH,
    opacity: style.opacity ?? 1,
    blur: style.blur ?? 0,
    gapWidth: style.gapWidth ?? 0,
    cap: style.cap ?? "round",
    join: style.join ?? "round",
    outline: style.outline ?? false,
    outlineColor: style.outlineColor ?? DEFAULT_OUTLINE_COLOR,
    outlineWidth: style.outlineWidth ?? 1,
    outlineOpacity: style.outlineOpacity ?? 1,
    outlineBlur: style.outlineBlur ?? 0,
  };
}

//#endregion

//#region Layers

/** Ids of the line sublayers. */
export function getLineLayerIds(layerId: string) {
  return {
    casing: `${layerId}-casing`,
    line: `${layerId}-line`,
  };
}

/**
 * Builds the line sublayers, bottom first: the casing when `outline` is on,
 * then the lines. `DataLayer.addSublayer` adds the geometry filter.
 * @param style - Resolved style (see {@link resolveLineStyle}).
 * @param context - Ids and the zoom range fade.
 */
export function buildLineLayers(style: LineLayerStyle, context: LineRenderContext): SublayerSpecification[] {
  const ids = getLineLayerIds(context.layerId);
  const width = resolveWidth(style);
  const layout = {
    "line-join": style.join ?? "round",
    "line-cap": style.cap ?? "round",
  } as const;

  const layers: SublayerSpecification[] = [];

  if (style.outline) {
    layers.push({
      id: ids.casing,
      type: "line",
      source: context.sourceId,
      layout,
      paint: {
        "line-color": resolveColor(style.outlineColor ?? DEFAULT_OUTLINE_COLOR, undefined),
        "line-width": resolveNumber(style.outlineWidth ?? 1),
        "line-gap-width": width,
        "line-opacity": context.fadeOpacity(resolveNumber(style.outlineOpacity ?? 1) as number | ExpressionSpecification),
        "line-blur": resolveNumber(style.outlineBlur ?? 0),
      },
    });
  }

  layers.push({
    id: ids.line,
    type: "line",
    source: context.sourceId,
    layout,
    paint: {
      "line-color": resolveColor(style.color, style.property),
      "line-width": width,
      "line-opacity": context.fadeOpacity(resolveNumber(style.opacity ?? 1) as number | ExpressionSpecification),
      "line-blur": resolveNumber(style.blur ?? 0),
      "line-gap-width": resolveNumber(style.gapWidth ?? 0),
      // an unset `line-dasharray` must be left out, as `undefined` hides the line
      ...(style.dashArray !== undefined && { "line-dasharray": resolveDashArray(style.dashArray) }),
    },
  });

  return layers;
}

/**
 * `line-width`:
 *
 * | `width`                    | Result                                                                 |
 * | -------------------------- | ---------------------------------------------------------------------- |
 * | unset                      | `3`                                                                    |
 * | number or expression       | as is                                                                  |
 * | `ZoomNumberValues`         | interpolated over the zoom                                             |
 * | `PropertyValues`, `property` set   | interpolated over `property`'s value                           |
 * | `PropertyValues`, `property` unset | `3`, with a warning — there's no value to read the mapping at  |
 */
function resolveWidth(style: LineLayerStyle): DataDrivenPropertyValueSpecification<number> {
  const { width = DEFAULT_WIDTH, property } = style;
  if (!isPropertyValues(width)) return resolveNumber(width);
  if (property) return rampedPropertyValueWeight(width, property);

  console.warn("LineLayer: a `PropertyValues` `width` needs `property`, so the default width is used.");
  return DEFAULT_WIDTH;
}

/** Tells `PropertyValues` (`{ propertyValue, value }[]`) from `ZoomNumberValues` by the first entry. */
function isPropertyValues(value: unknown): value is PropertyValues {
  return Array.isArray(value) && typeof value[0] === "object" && value[0] !== null && "propertyValue" in value[0];
}

//#endregion
