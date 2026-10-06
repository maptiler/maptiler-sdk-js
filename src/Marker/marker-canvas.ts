import type { MarkerStyle } from "./types";
import { SHAPES, type ShapeDescriptor } from "./marker-svg-config";
import { getAdaptiveColors, type AdaptiveColorSet } from "./marker-adaptive-colors";
import {
  DEFAULT_OUTLINE_WIDTH,
  DEFAULT_SHADOW,
  DEFAULT_SHAPE,
  DEFAULT_SIZE,
  DOT_STROKE_WIDTH,
  MARKER_FONT_FAMILY,
  SHADOW_PARAMS,
  SIZE_PX,
  TEXT_CONTENT_CLIP_RADIUS,
  TEXT_CONTENT_FONT_SIZE,
  TEXT_CONTENT_FONT_WEIGHT,
} from "./marker-constants";

// Canvas counterpart of the SVG built by marker-dom-utils.ts, for GL-rendered
// markers. Draws from the same ShapeDescriptors and constants so the two stay
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
  const colors = resolveColors(style, options.styleId ?? "");
  const sizeKey = style.size ?? DEFAULT_SIZE;

  if (sizeKey === "xs") return drawDot(colors, pixelRatio);

  const shape = SHAPES[style.shape ?? DEFAULT_SHAPE];
  const sizePx = SIZE_PX[sizeKey];
  const outlineWidth = style.outline ? (style.outline === true ? DEFAULT_OUTLINE_WIDTH : style.outline) : 0;
  const shadow = SHADOW_PARAMS[style.shadow ?? DEFAULT_SHADOW];

  // half the outline sits outside the path; ~3σ (1.5 × blur) covers the visible shadow
  const shadowExtent = shadow ? Math.max(Math.abs(shadow.offsetX), Math.abs(shadow.offsetY)) + shadow.blur * 1.5 : 0;
  const padding = Math.ceil(Math.max(outlineWidth / 2, shadowExtent)) + 1;

  const body = createCanvas(sizePx + padding * 2, pixelRatio);
  const ctx = getContext(body);

  // mirror the SVG's default `preserveAspectRatio="xMidYMid meet"` inside the sizePx box
  const [viewBoxW, viewBoxH] = shape.viewBox;
  const scale = Math.min(sizePx / viewBoxW, sizePx / viewBoxH);
  const originX = padding + (sizePx - viewBoxW * scale) / 2;
  const originY = padding + (sizePx - viewBoxH * scale) / 2;
  ctx.setTransform(pixelRatio * scale, 0, 0, pixelRatio * scale, pixelRatio * originX, pixelRatio * originY);

  drawShape(ctx, shape, style, colors, outlineWidth / scale);

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
 * inner fill, then content.
 * @param lineWidth - Outline width in viewBox units (the SVG's stroke is non-scaling, so CSS px ÷ scale).
 */
function drawShape(ctx: CanvasRenderingContext2D, shape: ShapeDescriptor, style: MarkerStyle, colors: AdaptiveColorSet, lineWidth: number): void {
  const outer = new Path2D(shape.outerPath);
  ctx.fillStyle = colors.outerColor;
  ctx.fill(outer);

  if (lineWidth > 0) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = colors.outlineColor;
    ctx.stroke(outer);
  }

  ctx.fillStyle = colors.innerColor;
  ctx.fill(buildInnerPath(shape.inner));

  if (style.content) {
    drawTextContent(ctx, style.content, shape, colors.contentColor);
  } else if (shape.defaultContent) {
    drawDefaultContent(ctx, shape, colors.contentColor);
  }
}

function buildInnerPath(inner: ShapeDescriptor["inner"]): Path2D {
  if (inner.type === "path") return new Path2D(inner.d);

  const path = new Path2D();
  path.arc(inner.cx, inner.cy, inner.r, 0, Math.PI * 2);
  return path;
}

/** Text label centred on the content circle and clipped like the SVG `<text>`. */
function drawTextContent(ctx: CanvasRenderingContext2D, text: string, shape: ShapeDescriptor, color: string): void {
  const { cx, cy } = shape.content;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, TEXT_CONTENT_CLIP_RADIUS, 0, Math.PI * 2);
  ctx.clip();

  ctx.font = `${String(TEXT_CONTENT_FONT_WEIGHT)} ${String(TEXT_CONTENT_FONT_SIZE)}px ${MARKER_FONT_FAMILY}`;
  ctx.textAlign = "center";
  // closest canvas equivalent of `dominant-baseline: central`
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

/** The shape's default glyph, unscaled and centred on the content circle. */
function drawDefaultContent(ctx: CanvasRenderingContext2D, shape: ShapeDescriptor, color: string): void {
  const { defaultContent } = shape;
  if (!defaultContent) return;

  const { cx, cy } = shape.content;
  const half = defaultContent.size / 2;

  ctx.save();
  ctx.translate(cx - half, cy - half);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(defaultContent.d));
  ctx.restore();
}

/** The `xs` dot — inner-coloured fill with an outer-coloured ring, no shadow, outline or content. */
function drawDot(colors: AdaptiveColorSet, pixelRatio: number): MarkerCanvas {
  const diameter = SIZE_PX.xs;
  const padding = Math.ceil(DOT_STROKE_WIDTH / 2);

  const canvas = createCanvas(diameter + padding * 2, pixelRatio);
  const ctx = getContext(canvas);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  ctx.beginPath();
  ctx.arc(padding + diameter / 2, padding + diameter / 2, diameter / 2, 0, Math.PI * 2);
  ctx.fillStyle = colors.innerColor;
  ctx.fill();
  ctx.lineWidth = DOT_STROKE_WIDTH;
  ctx.strokeStyle = colors.outerColor;
  ctx.stroke();

  return { canvas, pixelRatio, padding };
}

//#endregion

//#region Helpers

/** Explicit colours win; unset ones fall back to the style's adaptive defaults. */
function resolveColors(style: MarkerStyle, styleId: string): AdaptiveColorSet {
  const defaults = getAdaptiveColors(styleId);
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
