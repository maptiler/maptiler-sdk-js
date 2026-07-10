import { defaultReferenceStyleMap } from "@maptiler/client";

//#region Types

/**
 * Unversioned reference-style key, matching the reference styles of
 * `MapStyle` from `@maptiler/client` (e.g. `MapStyle.STREETS` → `"streets"`).
 */
export type ReferenceStyleKey = Lowercase<keyof typeof defaultReferenceStyleMap>;

/**
 * Style key an adaptive colour can target: an unversioned reference-style id,
 * optionally with a variant suffix (e.g. `"streets"`, `"streets-dark"`).
 * Versioned style ids (`"streets-v4-dark"`) are normalised to this form by
 * {@link getAdaptiveBgColor}.
 */
export type AdaptiveStyleKey = ReferenceStyleKey | `${ReferenceStyleKey}-${string}`;

/** A named colour with per-map-style background variants. */
export type AdaptiveColor = {
  /** Human-readable display name. */
  name: string;
  /**
   * Background colour per map style. `base` doubles as the fallback for
   * styles without a dedicated entry.
   */
  bgColors: { base: string } & Partial<Record<AdaptiveStyleKey, string>>;
};

//#endregion

//#region Palette

export const ADAPTIVE_COLORS = {
  blue: {
    name: "Blue",
    bgColors: {
      base: "hsl(223, 100%, 65%)",
      "base-dark": "hsl(223, 100%, 75%)",
      streets: "hsl(215, 100%, 45%)",
      "streets-dark": "hsl(215, 100%, 65%)",
      hybrid: "hsl(210, 100%, 45%)",
      dataviz: "hsl(208, 100%, 55%)",
      "dataviz-dark": "hsl(208, 100%, 65%)",
      topo: "hsl(215, 100%, 55%)",
    },
  },
  red: {
    name: "Red",
    bgColors: {
      base: "hsl(358, 100%, 65%)",
      "base-dark": "hsl(358, 100%, 75%)",
      streets: "hsl(350, 100%, 45%)",
      "streets-dark": "hsl(350, 100%, 55%)",
      hybrid: "hsl(0, 100%, 45%)",
      dataviz: "hsl(3, 100%, 55%)",
      "dataviz-dark": "hsl(3, 100%, 65%)",
      topo: "hsl(5, 100%, 45%)",
    },
  },
  green: {
    name: "Green",
    bgColors: {
      base: "hsl(145, 100%, 30%)",
      "base-dark": "hsl(145, 100%, 40%)",
      streets: "hsl(149, 100%, 35%)",
      "streets-dark": "hsl(149, 100%, 45%)",
      hybrid: "hsl(155, 100%, 40%)",
      dataviz: "hsl(160, 100%, 35%)",
      "dataviz-dark": "hsl(160, 100%, 45%)",
      topo: "hsl(145, 100%, 25%)",
    },
  },
} satisfies Record<string, AdaptiveColor>;

/** Name of a built-in adaptive colour. */
export type AdaptiveColorName = keyof typeof ADAPTIVE_COLORS;

//#endregion

//#region Resolution

/**
 * Resolves a marker `color` option value to its {@link AdaptiveColor}
 * definition: built-in palette names are looked up, definitions pass through.
 * Returns `undefined` for names unknown at runtime (untyped callers).
 */
export function resolveAdaptiveColor(color: AdaptiveColorName | AdaptiveColor): AdaptiveColor | undefined {
  return typeof color === "string" ? (ADAPTIVE_COLORS[color] as AdaptiveColor | undefined) : color;
}

/**
 * Normalises a style id to an {@link AdaptiveStyleKey} by dropping the
 * version segment — e.g. `"streets-v4-dark"` → `"streets-dark"`.
 */
function normalizeStyleKey(styleId: string): string {
  return styleId.toLowerCase().replace(/-v\d+/, "");
}

/**
 * Resolves the background colour of an adaptive colour for a given map style.
 *
 * Lookup order: exact style key (version stripped, variant kept) → reference
 * style without variant → `base`.
 * @param color - Adaptive colour definition.
 * @param styleId - Style id, versioned (`"streets-v4-dark"`) or not (`"streets-dark"`).
 */
export function getAdaptiveBgColor(color: AdaptiveColor, styleId: string): string {
  const bgColors: Record<string, string | undefined> = color.bgColors;
  const key = normalizeStyleKey(styleId);
  const referenceKey = key.split("-")[0];
  return bgColors[key] ?? bgColors[referenceKey] ?? color.bgColors.base;
}

//#endregion
