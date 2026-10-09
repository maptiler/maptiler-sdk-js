import type { ShapeGeometry } from "./marker-svg-config";
import { MARKER_FONT_FAMILY, TEXT_CAP_HEIGHT_EM, TEXT_FIT_MARGIN_PX, TEXT_FONT_WEIGHT, TEXT_LETTER_SPACING_EM, TEXT_MIN_FONT_PX } from "./marker-constants";

//#region Types

/** Font size and baseline (px, relative to the content centre) a label is drawn with. */
export type LabelMetrics = { font: number; baseline: number };

//#endregion

//#region Measuring

let context: CanvasRenderingContext2D | null | undefined;

function getContext(): CanvasRenderingContext2D | null {
  if (context === undefined) {
    try {
      context = document.createElement("canvas").getContext("2d");
    } catch {
      context = null;
    }
  }
  return context;
}

/** CSS `font` shorthand of marker text at `px`. */
function fontShorthand(px: number): string {
  return `${String(TEXT_FONT_WEIGHT)} ${String(px)}px ${MARKER_FONT_FAMILY}`;
}

/**
 * Width of `label` at `px`, letter spacing included, or `null` where text can't be measured
 * (no canvas). Canvas measures a hair wider than the SVG renders, which errs on the safe side.
 */
function measureLabel(label: string, px: number): number | null {
  const ctx = getContext();
  if (!ctx) return null;
  ctx.font = fontShorthand(px);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  const advance = ctx.measureText(label).width;
  // spacing sits between glyphs; the one SVG adds after the last glyph isn't ink
  return advance + (label.length - 1) * TEXT_LETTER_SPACING_EM * px;
}

/**
 * Resolves once the marker font used at `px` can measure `label` correctly, or `null` when it
 * already can. Measuring before the font arrives uses a fallback font's widths.
 */
export function whenLabelFontReady(label: string, px: number): Promise<void> | null {
  if (typeof document === "undefined" || !("fonts" in document)) return null;
  const font = fontShorthand(px);
  if (document.fonts.check(font, label)) return null;
  return document.fonts.load(font, label).then(
    () => undefined,
    () => undefined,
  );
}

//#endregion

//#region Fitting

/**
 * Width available to a label of font size `font` whose baseline sits `baseline` px below the
 * content centre. A circular fill narrows towards its top and bottom, so a label is measured
 * against the chord at its farthest edge (the cap line or the baseline); other fills use their width.
 */
function availableWidth(geometry: ShapeGeometry, font: number, baseline: number): number {
  const { w } = geometry.clip;
  if (geometry.inner[0]?.type === "rect") return w - TEXT_FIT_MARGIN_PX;
  const radius = w / 2;
  const offset = Math.max(Math.abs(baseline), Math.abs(baseline - TEXT_CAP_HEIGHT_EM * font));
  return 2 * Math.sqrt(Math.max(radius * radius - offset * offset, 0)) - TEXT_FIT_MARGIN_PX;
}

/**
 * Shrinks a multi-character label that is wider than the fill so it isn't clipped. A label that
 * already fits (and a single character) keeps `nominal`. The baseline scales with the font
 * size, on a whole pixel, so the capitals stay centred.
 * @param label - The text to draw.
 * @param nominal - Font size and baseline of the marker size for this label.
 * @param geometry - Shape the label sits in.
 */
export function fitLabel(label: string, nominal: LabelMetrics, geometry: ShapeGeometry): LabelMetrics {
  if (label.length < 2) return nominal;
  const nominalWidth = measureLabel(label, nominal.font);
  if (!nominalWidth || nominalWidth <= 0) return nominal;
  const widthPerPx = nominalWidth / nominal.font;

  // the room grows as the label shrinks (the caps get shorter), so settle on it in a few steps
  let scale = 1;
  for (let step = 0; step < 4; step++) {
    const room = availableWidth(geometry, nominal.font * scale, nominal.baseline * scale);
    scale = Math.min(1, room / (widthPerPx * nominal.font));
  }
  const font = Math.max(TEXT_MIN_FONT_PX, Math.floor(nominal.font * scale * 10) / 10);
  if (font >= nominal.font) return nominal;
  return { font, baseline: Math.round((nominal.baseline * font) / nominal.font) };
}

//#endregion
