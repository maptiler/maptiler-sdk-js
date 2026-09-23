import { defaultReferenceStyleMap } from '@maptiler/client';
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
export declare const ADAPTIVE_COLORS: {
    base: AdaptiveColorSet;
} & Partial<Record<AdaptiveStyleKey, AdaptiveColorSet>>;
/**
 * Resolves the default marker colours for a given map style.
 *
 * Lookup order: exact style key (version stripped, variant kept) → reference
 * style without variant → `base`, so an unknown style id resolves to `base`.
 * @param styleId - Style id, versioned (`"streets-v4-dark"`) or not (`"streets-dark"`).
 */
export declare function getAdaptiveColors(styleId: string): AdaptiveColorSet;
