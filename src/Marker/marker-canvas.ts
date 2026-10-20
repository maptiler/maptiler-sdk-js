import type { MapTilerMarkerShape, MarkerStyle } from "./types";
import { SHAPES, circlePath, getShapeGeometry, type ShapeGeometry, type ShapeSize } from "./marker-svg-config";
import { getAdaptiveColors, type AdaptiveColorSet } from "./marker-adaptive-colors";
import { MARKER_ICON_VIEWBOX_SIZE, getMarkerIconPath } from "./marker-icons";
import { fitLabel } from "./marker-text-fit";
import {
  CONTENT_METRICS,
  DEFAULT_OUTLINE_WIDTH,
  DEFAULT_SHADOW_BY_SIZE,
  DEFAULT_SHAPE,
  DEFAULT_SIZE,
  DOT_RING_PX,
  INVERTED_COLOR_SHAPES,
  MARKER_FONT_FAMILY,
  SHADOW_PARAMS,
  SIZE_PX,
  TEXT_FONT_WEIGHT,
  TEXT_LETTER_SPACING_EM,
} from "./marker-constants";

// Canvas counterpart of the SVG built by marker-dom-utils.ts, for GL-rendered
// markers. Draws from the same ShapeGeometry and constants so the two stay
// visually identical — any change to the SVG build must be mirrored here.

//#region Types

export type MarkerCanvasOptions = {
  /** Device pixels per CSS pixel. Defaults to `window.devicePixelRatio`. */
  pixelRatio?: number;
  /** Map style id used to resolve unset colours to their adaptive defaults. Defaults to the `base` colours. */
  styleId?: string;
};

export type MarkerCanvas = {
  /** The drawn marker, `pixelRatio` device pixels per CSS pixel. */
  canvas: HTMLCanvasElement;
  pixelRatio: number;
  /**
   * Transparent margin in CSS px on every side of the marker's nominal
   * `SIZE_PX` box, leaving room for the outline and shadow. Equal on all
   * sides, so the image centre is the box centre and `getShapeAnchorOffset`
   * applies unchanged.
   */
  padding: number;
};

//#endregion

//#region drawMarkerCanvas

/**
 * Draws a marker to a canvas, matching the DOM marker built from the same
 * style. Opacity is not baked in — apply it at display time, as the DOM path
 * does on its wrapper.
 *
 * Text content is drawn with whatever font is available at call time —
 * await `document.fonts.load()` for the marker font first, or the text falls
 * back to the next family in {@link MARKER_FONT_FAMILY}.
 * @param style - Visual style of the marker.
 * @param options - Pixel ratio and style id for adaptive colours.
 */
export function drawMarkerCanvas(style: MarkerStyle, options: MarkerCanvasOptions = {}): MarkerCanvas {
  const pixelRatio = options.pixelRatio ?? (window.devicePixelRatio || 1);
  const shapeKey = style.shape ?? DEFAULT_SHAPE;
  const sizeKey = style.size ?? DEFAULT_SIZE;
  const colors = resolveColors(style, options.styleId ?? "", shapeKey);
  const sizePx = SIZE_PX[sizeKey];
  // the xs dot has no outline
  const outlineWidth = sizeKey !== "xs" && style.outline ? (style.outline === true ? DEFAULT_OUTLINE_WIDTH : style.outline) : 0;
  const shadow = SHADOW_PARAMS[style.shadow ?? DEFAULT_SHADOW_BY_SIZE[sizeKey]];

  // half the outline sits outside the path; ~3σ (1.5 × blur) covers the visible shadow
  const shadowExtent = shadow ? Math.max(Math.abs(shadow.offsetX), Math.abs(shadow.offsetY)) + shadow.blur * 1.5 : 0;
  const padding = Math.ceil(Math.max(outlineWidth / 2, shadowExtent)) + 1;

  const body = createCanvas(sizePx + padding * 2, pixelRatio);
  const ctx = getContext(body);
  // geometry is in marker-box px (the SVG viewBox is the box itself), so only padding and pixel ratio apply
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, pixelRatio * padding, pixelRatio * padding);

  if (sizeKey === "xs") {
    drawDot(ctx, shapeKey, colors);
  } else {
    drawShape(ctx, shapeKey, sizeKey, style, colors, outlineWidth);
  }

  if (!shadow) return { canvas: body, pixelRatio, padding };

  // the CSS filter shadows the composited marker, so draw it as one image —
  // shadowing each layer separately would stack shadows under the inner fill
  const canvas = createCanvas(sizePx + padding * 2, pixelRatio);
  const shadowCtx = getContext(canvas);
  // shadow settings ignore the transform, so they're given in device pixels
  shadowCtx.shadowOffsetX = shadow.offsetX * pixelRatio;
  shadowCtx.shadowOffsetY = shadow.offsetY * pixelRatio;
  shadowCtx.shadowBlur = shadow.blur * pixelRatio;
  shadowCtx.shadowColor = shadow.color;
  shadowCtx.drawImage(body, 0, 0);

  return { canvas, pixelRatio, padding };
}

//#endregion

//#region Drawing

/**
 * Draws the shape layers in SVG paint order: outer fill, outline stroke,
 * inner fills, then content.
 * @param lineWidth - Outline width in CSS px (the SVG's stroke is non-scaling, and one geometry unit is one px).
 */
function drawShape(ctx: CanvasRenderingContext2D, shapeKey: MapTilerMarkerShape, sizeKey: ShapeSize, style: MarkerStyle, colors: AdaptiveColorSet, lineWidth: number): void {
  const geometry = getShapeGeometry(shapeKey, sizeKey);

  const outer = new Path2D(geometry.outer);
  ctx.fillStyle = colors.outerColor;
  ctx.fill(outer);

  if (lineWidth > 0) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = colors.outlineColor;
    ctx.stroke(outer);
  }

  // filled one by one, like the SVG's separate elements, so overlapping edges anti-alias the same
  ctx.fillStyle = colors.innerColor;
  for (const d of geometry.inner) ctx.fill(new Path2D(d));

  const { defaultIcon } = SHAPES[shapeKey];
  if (style.content) {
    drawTextContent(ctx, style.content, geometry, sizeKey, colors.contentColor);
  } else if (defaultIcon) {
    drawIconContent(ctx, defaultIcon, geometry, sizeKey, colors.contentColor);
  }
}

/** Text label fitted, placed and clipped like the SVG `<text>` (see `placeTextLabel` in marker-dom-utils.ts). */
function drawTextContent(ctx: CanvasRenderingContext2D, label: string, geometry: ShapeGeometry, sizeKey: ShapeSize, color: string): void {
  const { cx, cy } = geometry.content;
  const metrics = CONTENT_METRICS[sizeKey];
  // one letter or digit (a single UTF-16 unit)
  const nominal = (label.length === 1 ? metrics.singleChar : undefined) ?? metrics;
  const { font, baseline } = fitLabel(label, nominal, geometry);

  ctx.save();
  ctx.clip(new Path2D(geometry.clip.d));

  ctx.font = `${String(TEXT_FONT_WEIGHT)} ${String(font)}px ${MARKER_FONT_FAMILY}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${String(TEXT_LETTER_SPACING_EM * font)}px`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  // like SVG, canvas adds letter spacing after the last glyph too — shift by half a spacing to centre the glyphs
  ctx.fillText(label, cx + (TEXT_LETTER_SPACING_EM * font) / 2, cy + baseline);
  ctx.restore();
}

/** Built-in icon scaled to the size's icon box and centred on the content box, like `appendIconContent`. */
function drawIconContent(ctx: CanvasRenderingContext2D, icon: string, geometry: ShapeGeometry, sizeKey: ShapeSize, color: string): void {
  const d = getMarkerIconPath(icon);
  if (!d) return;

  const { cx, cy } = geometry.content;
  const box = CONTENT_METRICS[sizeKey].icon;
  // icon paths are designed at the L icon box and scaled down for M and S
  const scale = box / MARKER_ICON_VIEWBOX_SIZE;

  ctx.save();
  ctx.translate(cx - box / 2, cy - box / 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(d));
  ctx.restore();
}

/**
 * The `xs` dot — an outer-colour disc with the inner-colour disc `DOT_RING_PX`
 * inside it. Shapes with swapped default colours have the two fills swapped
 * back, as `orientDotColors` does, so the dot keeps the design's ring and centre.
 */
function drawDot(ctx: CanvasRenderingContext2D, shapeKey: MapTilerMarkerShape, colors: AdaptiveColorSet): void {
  const swapped = INVERTED_COLOR_SHAPES.includes(shapeKey);
  const center = SIZE_PX.xs / 2;

  ctx.fillStyle = swapped ? colors.innerColor : colors.outerColor;
  ctx.fill(new Path2D(circlePath(center, center, center)));
  ctx.fillStyle = swapped ? colors.outerColor : colors.innerColor;
  ctx.fill(new Path2D(circlePath(center, center, center - DOT_RING_PX)));
}

//#endregion

//#region Helpers

/** Explicit colours win; unset ones fall back to the style's adaptive defaults for the shape. */
function resolveColors(style: MarkerStyle, styleId: string, shapeKey: MapTilerMarkerShape): AdaptiveColorSet {
  const defaults = getAdaptiveColors(styleId, shapeKey);
  return {
    outerColor: style.outerColor ?? defaults.outerColor,
    innerColor: style.innerColor ?? defaults.innerColor,
    contentColor: style.contentColor ?? defaults.contentColor,
    outlineColor: style.outlineColor ?? defaults.outlineColor,
  };
}

/** Square canvas of `sizeCss` CSS px at `pixelRatio`. */
function createCanvas(sizeCss: number, pixelRatio: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.ceil(sizeCss * pixelRatio);
  return canvas;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get a 2D context to draw the marker.");
  return ctx;
}

//#endregion
