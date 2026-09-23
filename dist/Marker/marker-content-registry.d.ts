/**
 * Produces marker content from template parameters.
 * May return a string (rendered as marker text), an `HTMLElement` (rendered
 * in a foreignObject sized to the content circle), or an `SVGElement`
 * (treated like a content-type glyph, designed in a
 * {@link GLYPH_VIEWBOX_SIZE}-unit square).
 */
export type MarkerTemplateFactory = (params?: Record<string, number | string>) => string | HTMLElement | SVGElement;
/** Design-space size (units) for SVG template glyphs. */
export declare const GLYPH_VIEWBOX_SIZE = 24;
/**
 * Registers (or overrides) a template factory usable via the marker
 * `template` / `templateParams` options.
 * @param name - Identifier passed as `template`.
 * @param factory - Template factory, see {@link MarkerTemplateFactory}.
 */
export declare function registerMarkerTemplate(name: string, factory: MarkerTemplateFactory): void;
/** Returns the factory for a template, or `undefined` when unknown. */
export declare function getMarkerTemplate(name: string): MarkerTemplateFactory | undefined;
