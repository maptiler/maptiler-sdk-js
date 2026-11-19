import { getAdaptiveColorsForStyle, type AdaptiveColorSet } from "../adaptive-colors";
import { INVERTED_COLOR_SHAPES } from "./marker-constants";

//#region Resolution

/**
 * Resolves the default marker colours for a given map style and shape.
 *
 * The style's colours come from {@link getAdaptiveColorsForStyle}.
 * Shapes in {@link INVERTED_COLOR_SHAPES} get the style's colours swapped: the
 * accent colour on the body and the mark, the body colour on the inner fill.
 * @param styleId - Style id, versioned (`"streets-v4-dark"`) or not (`"streets-dark"`).
 * @param shape - Marker shape key; omit for the colours of an ordinary shape.
 */
export function getAdaptiveColors(styleId: string, shape?: string): AdaptiveColorSet {
  const set = getAdaptiveColorsForStyle(styleId);
  if (shape === undefined || !INVERTED_COLOR_SHAPES.includes(shape)) return set;
  return { innerColor: set.outerColor, outerColor: set.innerColor, contentColor: set.innerColor, outlineColor: set.outlineColor };
}

//#endregion
