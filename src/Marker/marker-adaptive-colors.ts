import { defaultReferenceStyleMap } from "@maptiler/client";
import { ADAPTIVE_COLORS, INVERTED_COLOR_SHAPES } from "./marker-constants";

//#region Types

/**
 * Unversioned reference-style key, matching the reference styles of
 * `MapStyle` from `@maptiler/client` (e.g. `MapStyle.STREETS` → `"streets"`).
 */
export type ReferenceStyleKey = Lowercase<keyof typeof defaultReferenceStyleMap>;

/**
 * Style key the marker colours can target: an unversioned reference-style id,
 * optionally with a variant suffix (e.g. `"streets"`, `"streets-dark"`).
 * Versioned style ids (`"streets-v4-dark"`) are normalised to this form by
 * {@link getAdaptiveColors}.
 */
export type AdaptiveStyleKey = ReferenceStyleKey | `${ReferenceStyleKey}-${string}`;

//#endregion

//#region Palette

/** The colours of each marker part for one map style. */
export type AdaptiveColorSet = {
  /** Fill of the inner area. */
  innerColor: string;
  /** Fill of the outer body / border. */
  outerColor: string;
  /** Colour of the content (text, glyph). */
  contentColor: string;
  /** Stroke of the outline (only visible when an outline width is set). */
  outlineColor: string;
};

//#endregion

//#region Resolution

/**
 * Normalises a style id to an {@link AdaptiveStyleKey} by dropping the
 * version segment — e.g. `"streets-v4-dark"` → `"streets-dark"`.
 */
function normalizeStyleKey(styleId: string): string {
  return styleId.toLowerCase().replace(/-v\d+/, "");
}

/**
 * Resolves the default marker colours for a given map style and shape.
 *
 * Lookup order: exact style key (version stripped, variant kept) → reference
 * style without variant → `base`, so an unknown style id resolves to `base`.
 * Shapes in {@link INVERTED_COLOR_SHAPES} get the style's colours swapped: the
 * accent colour on the body and the mark, the body colour on the inner fill.
 * @param styleId - Style id, versioned (`"streets-v4-dark"`) or not (`"streets-dark"`).
 * @param shape - Marker shape key; omit for the colours of an ordinary shape.
 */
export function getAdaptiveColors(styleId: string, shape?: string): AdaptiveColorSet {
  const colors: Record<string, AdaptiveColorSet | undefined> = ADAPTIVE_COLORS;
  const key = normalizeStyleKey(styleId);
  // this is dirty but it's the only way to implement it for now...
  const referenceKey = key.split("-")[0];
  const set = colors[key] ?? colors[referenceKey] ?? ADAPTIVE_COLORS.base;
  if (shape === undefined || !INVERTED_COLOR_SHAPES.includes(shape)) return set;
  return { innerColor: set.outerColor, outerColor: set.innerColor, contentColor: set.innerColor, outlineColor: set.outlineColor };
}

//#endregion
