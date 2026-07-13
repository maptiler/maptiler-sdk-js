//#region Types

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

/** Design-space size (units) for SVG template glyphs. */
export const GLYPH_VIEWBOX_SIZE = 24;

// TODO(icons): built-in icon registry backing the marker `icon` option.

const TEMPLATES = new Map<string, MarkerTemplateFactory>();

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
