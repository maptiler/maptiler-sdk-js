import { BUILT_IN_MARKER_ICONS } from "./marker-icons";

//#region Types

/**
 * Produces marker content from template parameters.
 * May return a string (rendered as marker text), an `HTMLElement` (rendered
 * in a foreignObject sized to the content circle), or an `SVGElement`
 * (treated like a content-type glyph, designed in a
 * `GLYPH_VIEWBOX_SIZE`-unit square).
 */
export type MarkerTemplateFactory = (params?: Record<string, number | string>) => string | HTMLElement | SVGElement;

//#endregion

//#region Registries

const ICONS = new Map<string, string>(Object.entries(BUILT_IN_MARKER_ICONS));

/**
 * Registers (or overrides) an icon usable via the marker `icon` option.
 * Built-in icons ({@link MARKER_ICON_NAMES}) are registered up front.
 * @param name - Identifier passed as `icon`.
 * @param source - SVG markup, drawn in the content colour and scaled from its viewBox to each size's icon box.
 */
export function registerMarkerIcon(name: string, source: string): void {
  ICONS.set(name, source);
}

/** Returns the SVG markup of an icon, or `undefined` when unknown. */
export function getMarkerIcon(name: string): string | undefined {
  return ICONS.get(name);
}

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
