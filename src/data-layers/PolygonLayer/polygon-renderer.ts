/**
 * @packageDocumentation
 * Turns a {@link PolygonLayerStyle} into the sublayers `PolygonLayer` draws:
 * a fill, and a line along its edge when `outline` is on. Pure functions only.
 *
 * Ported from the `addPolygon` helper's spec logic, and kept as a copy rather
 * than shared, so `addPolygon` stays frozen. Defaults are the helper's, except
 * that `color` has none yet (the layer requires it, or a `pattern`), and the
 * zoom range is the data layers' (`0`–`24`) rather than the helper's (`0`–`23`).
 */

import type { DataDrivenPropertyValueSpecification, ExpressionSpecification } from "maplibre-gl";
import type { ZoomNumberValues } from "../../helpers/vectorlayerhelpers";
import type { SublayerSpecification } from "../DataLayer";
import { isExpression, resolveColor, resolveDashArray, resolveNumber, usesZoom } from "../style";
import type { DataLayerNumber } from "../types";
import type { PolygonLayerStyle } from "./types";

//#region Types

/** Everything besides style that the polygon sublayers depend on. */
export type PolygonRenderContext = {
  /** Id of the `PolygonLayer` — the sublayers' ids derive from it (see {@link getPolygonLayerIds}). */
  layerId: string;
  /** Id of the GeoJSON source the sublayers draw, which may be shared with other data layers. */
  sourceId: string;
  /** Adds the layer's fade at the edges of its zoom range — see `DataLayer.fadeOpacity`. */
  fadeOpacity: (opacity: number | ExpressionSpecification) => number | ExpressionSpecification;
  /** Id of the loaded pattern image to fill with — unset to fill with `color`, as when `pattern` is unset or failed to load. */
  patternImageId?: string;
};

//#endregion

//#region Style

const DEFAULT_OUTLINE_COLOR = "#FFFFFF";

/**
 * Fills in `addPolygon`'s defaults. `color` and `pattern` have none.
 * @param style - Style as set by the user.
 * @returns A copy of `style` with the defaults filled in.
 */
export function resolvePolygonStyle(style: PolygonLayerStyle): PolygonLayerStyle {
  return {
    ...style,
    opacity: style.opacity ?? 1,
    outline: style.outline ?? false,
    outlineColor: style.outlineColor ?? DEFAULT_OUTLINE_COLOR,
    outlineWidth: style.outlineWidth ?? 1,
    outlineOpacity: style.outlineOpacity ?? 1,
    outlineBlur: style.outlineBlur ?? 0,
    outlinePosition: style.outlinePosition ?? "center",
    outlineCap: style.outlineCap ?? "butt",
    outlineJoin: style.outlineJoin ?? "round",
  };
}

//#endregion

//#region Layers

/** Ids of the polygon sublayers. */
export function getPolygonLayerIds(layerId: string) {
  return {
    fill: `${layerId}-fill`,
    outline: `${layerId}-outline`,
  };
}

/**
 * Builds the polygon sublayers, bottom first: the fill, then the outline when
 * `outline` is on. `DataLayer.addSublayer` adds the geometry filter.
 * @param style - Resolved style (see {@link resolvePolygonStyle}).
 * @param context - Ids, the zoom range fade and the pattern image.
 */
export function buildPolygonLayers(style: PolygonLayerStyle, context: PolygonRenderContext): SublayerSpecification[] {
  const ids = getPolygonLayerIds(context.layerId);

  const layers: SublayerSpecification[] = [
    {
      id: ids.fill,
      type: "fill",
      source: context.sourceId,
      paint: {
        // without a colour, the pattern fills — or, should it fail to load, MapLibre's default black
        ...(style.color !== undefined && { "fill-color": resolveColor(style.color, style.property) }),
        "fill-opacity": context.fadeOpacity(resolveNumber(style.opacity ?? 1) as number | ExpressionSpecification),
        ...(context.patternImageId !== undefined && { "fill-pattern": context.patternImageId }),
      },
    },
  ];

  if (style.outline) {
    const outlineWidth = style.outlineWidth ?? 1;

    layers.push({
      id: ids.outline,
      type: "line",
      source: context.sourceId,
      layout: {
        "line-join": style.outlineJoin ?? "round",
        "line-cap": style.outlineCap ?? "butt",
      },
      paint: {
        "line-color": resolveColor(style.outlineColor ?? DEFAULT_OUTLINE_COLOR, undefined),
        "line-width": resolveNumber(outlineWidth),
        "line-opacity": context.fadeOpacity(resolveNumber(style.outlineOpacity ?? 1) as number | ExpressionSpecification),
        "line-blur": resolveNumber(style.outlineBlur ?? 0),
        "line-offset": resolveOutlineOffset(style.outlinePosition ?? "center", outlineWidth),
        // an unset `line-dasharray` must be left out, as `undefined` hides the line
        ...(style.outlineDashArray !== undefined && { "line-dasharray": resolveDashArray(style.outlineDashArray) }),
      },
    });
  }

  return layers;
}

/**
 * `line-offset` putting the outline inside, outside or centred on the edge:
 * half its width one way or the other, as in `addPolygon`.
 *
 * MapLibre allows `["zoom"]` only at the top level of an interpolation, so an
 * expression width that reads the zoom can't be halved. It warns and centres
 * the outline instead.
 */
function resolveOutlineOffset(position: "center" | "inside" | "outside", width: DataLayerNumber): DataDrivenPropertyValueSpecification<number> {
  if (position === "center") return 0;
  const factor = position === "inside" ? 0.5 : -0.5;

  if (typeof width === "number") return factor * width;
  if (!isExpression(width)) {
    return resolveNumber((width as ZoomNumberValues).map(({ zoom, value }) => ({ zoom, value: factor * value })));
  }
  if (!usesZoom(width)) return ["*", factor, width];

  console.warn(`PolygonLayer: an \`outlineWidth\` expression reading the zoom can't be offset, so the outline is centred rather than ${position}.`);
  return 0;
}

//#endregion
