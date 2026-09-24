import { defaultReferenceStyleMap } from "@maptiler/client";

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

/**
 * Default marker colours per map style. `base` doubles as the fallback for
 * styles without a dedicated entry.
 * TODO: outline (and outer / content on light styles) are placeholders — the former global defaults — until the designs specify them per style.
 */
export const ADAPTIVE_COLORS: { base: AdaptiveColorSet } & Partial<Record<AdaptiveStyleKey, AdaptiveColorSet>> = {
  base: { innerColor: "#4D7FFF", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  "base-dark": { innerColor: "#80A4FF", outerColor: "#292929", contentColor: "#292929", outlineColor: "transparent" },
  streets: { innerColor: "#0060E5", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  "streets-dark": { innerColor: "#4D97FF", outerColor: "#292929", contentColor: "#292929", outlineColor: "transparent" },
  hybrid: { innerColor: "#0073E5", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  dataviz: { innerColor: "#1A94FF", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  "dataviz-dark": { innerColor: "#4DACFF", outerColor: "#292929", contentColor: "#292929", outlineColor: "transparent" },
  topo: { innerColor: "#1A79FF", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
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
