/**
 * @packageDocumentation
 * Turns a {@link PolygonLayerStyle} into the sublayers `PolygonLayer` draws,
 * bottom first: a glow along the edges when on, the fill, and an outline
 * along the edges when on. Pure functions only.
 *
 * Ported from the `addPolygon` helper's spec logic, and kept as a copy rather
 * than shared, so `addPolygon` stays frozen. Defaults are the helper's, except
 * that `color` has none yet (the layer requires it, or a `pattern`), and the
 * zoom range is the data layers' (`0`–`24`) rather than the helper's (`0`–`23`).
 * The glow is new.
 */

import type { DataDrivenPropertyValueSpecification, ExpressionSpecification } from "maplibre-gl";
import type { SublayerSpecification } from "../DataLayer";
import { resolveColor, resolveDash, resolveNumber, scaleWidth } from "../style";
import type { DataLayerGlow } from "../types";
import type { PolygonLayerOutline, PolygonLayerStyle } from "./types";

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

/** The glow's colour when the polygons have a pattern but no colour. */
const FALLBACK_GLOW_COLOR = "#FFFFFF";

const DEFAULT_OUTLINE = {
  color: "#FFFFFF",
  width: 1,
  opacity: 1,
  blur: 0,
  position: "center",
  dash: false,
  cap: "butt",
  join: "round",
} as const satisfies PolygonLayerOutline;

const DEFAULT_GLOW_WIDTH = 6;
const DEFAULT_GLOW_OPACITY = 1;

/**
 * Fills in `addPolygon`'s defaults, and the glow's. `color` and `pattern`
 * have none. An outline or glow that's on comes back as an object with every
 * value set — the glow's colour being the fill's unless set — and one that's
 * off as `false`.
 * @param style - Style as set by the user.
 * @returns A copy of `style` with the defaults filled in.
 */
export function resolvePolygonStyle(style: PolygonLayerStyle): PolygonLayerStyle {
  return {
    ...style,
    opacity: style.opacity ?? 1,
    outline: resolveOutline(style.outline),
    glow: resolveGlow(style),
  };
}

function resolveOutline(outline: PolygonLayerStyle["outline"]): false | PolygonLayerOutline {
  if (!outline) return false;
  return { ...DEFAULT_OUTLINE, ...(outline === true ? {} : outline) };
}

function resolveGlow(style: PolygonLayerStyle): false | DataLayerGlow {
  if (!style.glow) return false;
  const set = style.glow === true ? {} : style.glow;
  const width = set.width ?? DEFAULT_GLOW_WIDTH;
  return { color: set.color ?? style.color ?? FALLBACK_GLOW_COLOR, width, opacity: set.opacity ?? DEFAULT_GLOW_OPACITY, blur: set.blur ?? width };
}

//#endregion

//#region Layers

/** Ids of the polygon sublayers. */
export function getPolygonLayerIds(layerId: string) {
  return {
    glow: `${layerId}-glow`,
    fill: `${layerId}-fill`,
    outline: `${layerId}-outline`,
  };
}

/**
 * Builds the polygon sublayers, bottom first: the glow when on, the fill, then
 * the outline when on. `DataLayer.addSublayer` adds the geometry filter.
 * @param style - Resolved style (see {@link resolvePolygonStyle}).
 * @param context - Ids, the zoom range fade and the pattern image.
 */
export function buildPolygonLayers(style: PolygonLayerStyle, context: PolygonRenderContext): SublayerSpecification[] {
  const ids = getPolygonLayerIds(context.layerId);
  const fade = (opacity: DataDrivenPropertyValueSpecification<number>) => context.fadeOpacity(opacity as number | ExpressionSpecification);
  const layers: SublayerSpecification[] = [];

  const glow = resolveGlow(style);
  if (glow) {
    const spread = resolveNumber(glow.width ?? DEFAULT_GLOW_WIDTH);
    layers.push({
      id: ids.glow,
      type: "line",
      source: context.sourceId,
      layout: { "line-join": "round" },
      paint: {
        "line-color": resolveColor(glow.color ?? FALLBACK_GLOW_COLOR, style.property),
        // centred on the edge, so twice the spread reaches `spread` outside — or the spread itself, when it can't be doubled
        "line-width": scaleWidth(spread, 2) ?? spread,
        "line-opacity": fade(resolveNumber(glow.opacity ?? DEFAULT_GLOW_OPACITY)),
        "line-blur": resolveNumber(glow.blur ?? glow.width ?? DEFAULT_GLOW_WIDTH),
      },
    });
  }

  layers.push({
    id: ids.fill,
    type: "fill",
    source: context.sourceId,
    paint: {
      // without a colour, the pattern fills — or, should it fail to load, MapLibre's default black
      ...(style.color !== undefined && { "fill-color": resolveColor(style.color, style.property) }),
      "fill-opacity": fade(resolveNumber(style.opacity ?? 1)),
      ...(context.patternImageId !== undefined && { "fill-pattern": context.patternImageId }),
    },
  });

  const outline = resolveOutline(style.outline);
  if (outline) {
    const width = resolveNumber(outline.width ?? DEFAULT_OUTLINE.width);
    const dash = resolveDash(outline.dash);
    layers.push({
      id: ids.outline,
      type: "line",
      source: context.sourceId,
      layout: {
        "line-join": outline.join ?? DEFAULT_OUTLINE.join,
        "line-cap": outline.cap ?? DEFAULT_OUTLINE.cap,
      },
      paint: {
        "line-color": resolveColor(outline.color ?? DEFAULT_OUTLINE.color, style.property),
        "line-width": width,
        "line-opacity": fade(resolveNumber(outline.opacity ?? DEFAULT_OUTLINE.opacity)),
        "line-blur": resolveNumber(outline.blur ?? DEFAULT_OUTLINE.blur),
        "line-offset": resolveOutlineOffset(outline.position ?? DEFAULT_OUTLINE.position, width),
        // an unset `line-dasharray` must be left out, as `undefined` hides the line
        ...(dash && { "line-dasharray": dash }),
      },
    });
  }

  return layers;
}

/**
 * `line-offset` putting the outline inside, outside or centred on the edge:
 * half its width one way or the other, as in `addPolygon`. A width reading the
 * zoom other than at its top level can't be halved, so it warns and centres
 * the outline instead.
 */
function resolveOutlineOffset(position: "center" | "inside" | "outside", width: DataDrivenPropertyValueSpecification<number>): DataDrivenPropertyValueSpecification<number> {
  if (position === "center") return 0;
  const offset = scaleWidth(width, position === "inside" ? 0.5 : -0.5);
  if (offset !== undefined) return offset;

  console.warn(`PolygonLayer: an outline width reading the zoom other than at its top level can't be offset, so the outline is centred rather than ${position}.`);
  return 0;
}

//#endregion
