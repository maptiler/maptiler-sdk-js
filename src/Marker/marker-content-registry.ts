//#region Types

/**
 * Produces the SVG glyph for a built-in content type.
 * The returned element must be designed in a {@link GLYPH_VIEWBOX_SIZE}-unit
 * square — it is scaled and centered into the shape's content circle.
 * Leave `fill` unset to inherit the marker content color.
 */
export type MarkerContentTypeFactory = () => SVGElement;

/**
 * Produces marker content from template parameters.
 * May return a string (rendered as marker text), an `HTMLElement` (rendered
 * in a foreignObject sized to the content circle), or an `SVGElement`
 * (treated like a content-type glyph, designed in a
 * {@link GLYPH_VIEWBOX_SIZE}-unit square).
 */
export type MarkerTemplateFactory = (params?: Record<string, number | string>) => string | HTMLElement | SVGElement;

//#endregion

//#region Registries

/** Design-space size (units) for content-type and SVG template glyphs. */
export const GLYPH_VIEWBOX_SIZE = 24;

const SVG_NS = "http://www.w3.org/2000/svg";

function glyphPath(d: string): SVGElement {
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  return path;
}

const CONTENT_TYPES = new Map<string, MarkerContentTypeFactory>([
  ["star", () => glyphPath("M12 2 L14.9 8.6 L22 9.2 L16.6 13.9 L18.2 21 L12 17.3 L5.8 21 L7.4 13.9 L2 9.2 L9.1 8.6 Z")],
  [
    "heart",
    () => glyphPath("M12 21 C 5 14, 2 10.5, 2 7.5 C 2 4.5, 4.5 3, 6.75 3 C 8.75 3, 10.75 4, 12 6 C 13.25 4, 15.25 3, 17.25 3 C 19.5 3, 22 4.5, 22 7.5 C 22 10.5, 19 14, 12 21 Z"),
  ],
  ["plus", () => glyphPath("M10 4 H14 V10 H20 V14 H14 V20 H10 V14 H4 V10 H10 Z")],
  ["dot", () => glyphPath("M12 5 A7 7 0 1 0 12 19 A7 7 0 1 0 12 5 Z")],
]);

const TEMPLATES = new Map<string, MarkerTemplateFactory>();

/**
 * Registers (or overrides) a built-in content type usable via the marker
 * `contentType` option.
 * @param name - Identifier passed as `contentType`.
 * @param factory - Glyph factory, see {@link MarkerContentTypeFactory}.
 */
export function registerMarkerContentType(name: string, factory: MarkerContentTypeFactory): void {
  CONTENT_TYPES.set(name, factory);
}

/** Returns the factory for a content type, or `undefined` when unknown. */
export function getMarkerContentType(name: string): MarkerContentTypeFactory | undefined {
  return CONTENT_TYPES.get(name);
}

/**
 * Registers (or overrides) a template factory usable via the marker
 * `template` / `templateParams` options.
 * @param name - Identifier passed as `template`.
 * @param factory - Template factory, see {@link MarkerTemplateFactory}.
 */
export function registerMarkerTemplate(name: string, factory: MarkerTemplateFactory): void {
  TEMPLATES.set(name, factory);
}

/** Returns the factory for a template, or `undefined` when unknown. */
export function getMarkerTemplate(name: string): MarkerTemplateFactory | undefined {
  return TEMPLATES.get(name);
}

//#endregion
