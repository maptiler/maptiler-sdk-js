import { defaultReferenceStyleMap } from "@maptiler/client";
import { ADAPTIVE_COLORS } from "./marker-constants";

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
 * Resolves the default marker colours for a given map style.
 *
 * Lookup order: exact style key (version stripped, variant kept) → reference
 * style without variant → `base`, so an unknown style id resolves to `base`.
 * @param styleId - Style id, versioned (`"streets-v4-dark"`) or not (`"streets-dark"`).
 */
export function getAdaptiveColors(styleId: string): AdaptiveColorSet {
  const colors: Record<string, AdaptiveColorSet | undefined> = ADAPTIVE_COLORS;
  const key = normalizeStyleKey(styleId);
  // this is dirty but it's the only way to implement it for now...
  const referenceKey = key.split("-")[0];
  return colors[key] ?? colors[referenceKey] ?? ADAPTIVE_COLORS.base;
}

//#endregion
