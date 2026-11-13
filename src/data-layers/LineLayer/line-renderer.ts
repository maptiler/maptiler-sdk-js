/**
 * @packageDocumentation
 * Turns a {@link LineLayerStyle} into the sublayers `LineLayer` draws, bottom
 * first: a glow and an outline when on, then the lines. Pure functions only.
 *
 * Ported from the `addPolyline` helper's spec logic, and kept as a copy rather
 * than shared, so `addPolyline` stays frozen. Defaults are the helper's, except
 * that `color` has none yet (the layer requires it), and the zoom range is the
 * data layers' (`0`–`24`) rather than the helper's (`0`–`23`). The glow is new.
 *
 * The outline and glow are solid lines beneath the lines, as wide as the line
 * plus their width on each side — as `addPolyline`'s outline is, so it shows
 * through the gaps between dashes, and through a translucent line. When the
 * widths can't be added up — both read the zoom, or one reads it other than at
 * its top level, which MapLibre can't nest — they're drawn as two strokes
 * either side of a gap as wide as the line (`line-gap-width`) instead.
 */

import type { DataDrivenPropertyValueSpecification, ExpressionSpecification, LineLayerSpecification } from "maplibre-gl";
import type { PropertyValues } from "../../helpers/vectorlayerhelpers";
import { rampedPropertyValueWeight } from "../../helpers/stylehelper";
import type { SublayerSpecification } from "../DataLayer";
import { resolveColor, resolveDash, resolveNumber, scaleWidth, sumWidths } from "../style";
import type { DataLayerGlow, DataLayerOutline } from "../types";
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

const DEFAULT_OUTLINE: Required<Omit<DataLayerOutline, "color">> & { color: string } = { color: "#FFFFFF", width: 1, opacity: 1, blur: 0 };

const DEFAULT_GLOW_WIDTH = 6;
const DEFAULT_GLOW_OPACITY = 1;

/**
 * Fills in `addPolyline`'s defaults, and the glow's. `color` has none. An
 * outline or glow that's on comes back as an object with every value set — the
 * glow's colour being the line's unless set — and one that's off as `false`.
 * @param style - Style as set by the user.
 * @returns A copy of `style` with the defaults filled in.
 */
export function resolveLineStyle(style: LineLayerStyle): LineLayerStyle {
  return {
    ...style,
    width: style.width ?? DEFAULT_WIDTH,
    opacity: style.opacity ?? 1,
    blur: style.blur ?? 0,
    dash: style.dash ?? false,
    cap: style.cap ?? "round",
    join: style.join ?? "round",
    gapWidth: style.gapWidth ?? 0,
    outline: resolveOutline(style.outline),
    glow: resolveGlow(style.glow, style.color),
  };
}

function resolveOutline(outline: LineLayerStyle["outline"]): false | DataLayerOutline {
  if (!outline) return false;
  return { ...DEFAULT_OUTLINE, ...(outline === true ? {} : outline) };
}

function resolveGlow(glow: LineLayerStyle["glow"], color: LineLayerStyle["color"]): false | DataLayerGlow {
  if (!glow) return false;
  const set = glow === true ? {} : glow;
  const width = set.width ?? DEFAULT_GLOW_WIDTH;
  return { color: set.color ?? color, width, opacity: set.opacity ?? DEFAULT_GLOW_OPACITY, blur: set.blur ?? width };
}

//#endregion

//#region Layers

/** Ids of the line sublayers. */
export function getLineLayerIds(layerId: string) {
  return {
    glow: `${layerId}-glow`,
    outline: `${layerId}-outline`,
    line: `${layerId}-line`,
  };
}

/**
 * Builds the line sublayers, bottom first: the glow and the outline when on,
 * then the lines. `DataLayer.addSublayer` adds the geometry filter.
 * @param style - Resolved style (see {@link resolveLineStyle}).
 * @param context - Ids and the zoom range fade.
 */
export function buildLineLayers(style: LineLayerStyle, context: LineRenderContext): SublayerSpecification[] {
  const ids = getLineLayerIds(context.layerId);
  const width = resolveWidth(style);
  const fade = (opacity: DataDrivenPropertyValueSpecification<number>) => context.fadeOpacity(opacity as number | ExpressionSpecification);
  const layout = {
    "line-join": style.join ?? "round",
    "line-cap": style.cap ?? "round",
  } as const;

  /** A line beneath the lines, `spread` wider on each side. */
  const underlay = (
    id: string,
    spread: DataDrivenPropertyValueSpecification<number>,
    paint: LineLayerSpecification["paint"],
    underlayLayout: LineLayerSpecification["layout"] = layout,
  ): SublayerSpecification => {
    const doubled = scaleWidth(spread, 2);
    const total = doubled === undefined ? undefined : sumWidths(width, doubled);
    return {
      id,
      type: "line",
      source: context.sourceId,
      layout: underlayLayout,
      paint: {
        ...paint,
        // the lines' own width as a gap when the two can't be added up
        ...(total === undefined ? { "line-width": spread, "line-gap-width": width } : { "line-width": total }),
      },
    };
  };

  const layers: SublayerSpecification[] = [];

  const glow = resolveGlow(style.glow, style.color);
  if (glow) {
    layers.push(
      underlay(
        ids.glow,
        resolveNumber(glow.width ?? DEFAULT_GLOW_WIDTH),
        {
          "line-color": resolveColor(glow.color ?? style.color, style.property),
          "line-opacity": fade(resolveNumber(glow.opacity ?? DEFAULT_GLOW_OPACITY)),
          "line-blur": resolveNumber(glow.blur ?? glow.width ?? DEFAULT_GLOW_WIDTH),
        },
        // a halo is round whatever the line's joins and caps — mitred, it spikes at bends, where it also overlaps itself most
        { "line-join": "round", "line-cap": "round" },
      ),
    );
  }

  const outline = resolveOutline(style.outline);
  if (outline) {
    layers.push(
      underlay(ids.outline, resolveNumber(outline.width ?? DEFAULT_OUTLINE.width), {
        "line-color": resolveColor(outline.color ?? DEFAULT_OUTLINE.color, style.property),
        "line-opacity": fade(resolveNumber(outline.opacity ?? DEFAULT_OUTLINE.opacity)),
        "line-blur": resolveNumber(outline.blur ?? DEFAULT_OUTLINE.blur),
      }),
    );
  }

  const dash = resolveDash(style.dash);
  layers.push({
    id: ids.line,
    type: "line",
    source: context.sourceId,
    layout,
    paint: {
      "line-color": resolveColor(style.color, style.property),
      "line-width": width,
      "line-opacity": fade(resolveNumber(style.opacity ?? 1)),
      "line-blur": resolveNumber(style.blur ?? 0),
      "line-gap-width": resolveNumber(style.gapWidth ?? 0),
      // an unset `line-dasharray` must be left out, as `undefined` hides the line
      ...(dash && { "line-dasharray": dash }),
    },
  });

  return layers;
}

/**
 * `line-width`:
 *
 * | `width`                            | Result                                                         |
 * | ---------------------------------- | -------------------------------------------------------------- |
 * | unset                              | `3`                                                            |
 * | number or expression               | as is                                                          |
 * | `ZoomNumberValues`                 | interpolated over the zoom                                     |
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
