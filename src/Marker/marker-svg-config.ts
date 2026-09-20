import type { MapTilerMarkerBaseOptions } from "./types";

//#region Types

/** Inner (fill) region of a shape — either a circle or an arbitrary path. */
export type ShapeInner = { type: "circle"; cx: number; cy: number; r: number } | { type: "path"; d: string };

/**
 * Clip region used when rendering full-bleed image content.
 * `x`/`y`/`w`/`h` describe the bounding box of the clip path, used to size and position the image.
 */
export type ShapeImageClip = {
  type: "path";
  d: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Circular content area in viewBox coordinates — anchors text, icons and (when no `imageClip`) images. */
export type ShapeContent = { cx: number; cy: number; r: number };

/**
 * Glyph drawn when a marker has no content of its own. Rendered unscaled in
 * viewBox units — `d` is designed in a `size`-unit square — and centered on the
 * shape's `content` circle.
 */
export type ShapeDefaultContent = { d: string; size: number };

export type ShapeDescriptor = {
  viewBox: [number, number];
  /** Which point of the shape sits on the marker's geographic location. */
  anchor: "bottom" | "center";
  /**
   * Y coordinate (viewBox units) of the shape's visual bottom — the anchor
   * point. Differs from the viewBox height when the shape has breathing room
   * below the glyph.
   */
  anchorY: number;
  outerPath: string;
  inner: ShapeInner;
  /** Circular content area used to place and scale text / icon / element content. */
  content: ShapeContent;
  /** When present, image content is clipped to this region (full-bleed) instead of the content circle. */
  imageClip?: ShapeImageClip;
  /** Pointer/tail sub-path re-painted in the inner color on top of clipped image content. */
  pointerPath?: string;
  /** Glyph shown in place of content when the marker has none. */
  defaultContent?: ShapeDefaultContent;
};

//#endregion

//#region Lookup Tables

export const SIZE_PX: Record<NonNullable<MapTilerMarkerBaseOptions["size"]>, number> = {
  xs: 8,
  s: 24,
  m: 32,
  l: 40,
};

export const SHADOW_FILTER: Record<NonNullable<MapTilerMarkerBaseOptions["shadow"]>, string> = {
  soft: "drop-shadow(0 1px 2px rgba(0,0,0,0.20))",
  medium: "drop-shadow(0 2px 2px rgba(0,0,0,0.28)) drop-shadow(0 4px 4px rgba(0,0,0,0.15))",
  strong: "drop-shadow(0 4px 6px rgba(0,0,0,0.35)) drop-shadow(0 8px 10px rgba(0,0,0,0.20))",
};

//#endregion

//#region Shapes

export const SHAPES: Record<NonNullable<MapTilerMarkerBaseOptions["shape"]>, ShapeDescriptor> = {
  circle: {
    viewBox: [32, 32],
    anchor: "center",
    anchorY: 32,
    outerPath: "M16 0A16 16 0 1 0 16 32A16 16 0 1 0 16 0Z",
    inner: { type: "circle", cx: 16, cy: 16, r: 13 },
    content: { cx: 16, cy: 16, r: 10.5 },
  },
  square: {
    viewBox: [32, 32],
    anchor: "center",
    anchorY: 32,
    outerPath: "M6 0H26A6 6 0 0 1 32 6V26A6 6 0 0 1 26 32H6A6 6 0 0 1 0 26V6A6 6 0 0 1 6 0Z",
    inner: { type: "path", d: "M5 3H27A2 2 0 0 1 29 5V27A2 2 0 0 1 27 29H5A2 2 0 0 1 3 27V5A2 2 0 0 1 5 3Z" },
    imageClip: {
      type: "path",
      d: "M5 3H27A2 2 0 0 1 29 5V27A2 2 0 0 1 27 29H5A2 2 0 0 1 3 27V5A2 2 0 0 1 5 3Z",
      x: 3,
      y: 3,
      w: 26,
      h: 26,
    },
    content: { cx: 16, cy: 16, r: 10.5 },
  },
  "bubble-circle": {
    viewBox: [32, 35],
    anchor: "bottom",
    anchorY: 35,
    outerPath:
      "M16 0C24.8366 0 32 7.16344 32 16C31.9998 23.2141 27.2247 29.3114 20.6631 31.3076L16.6943 34.7402C16.2949 35.0856 15.7051 35.0856 15.3057 34.7402L11.3359 31.3076C4.7748 29.3111 0.000161581 23.2138 0 16C0 7.16344 7.16344 0 16 0Z",
    inner: { type: "circle", cx: 16, cy: 16, r: 13 },
    content: { cx: 16, cy: 16, r: 10.5 },
  },
  "bubble-square": {
    viewBox: [34, 34],
    anchor: "bottom",
    anchorY: 34,
    outerPath:
      "M28 0C31.3137 0 34 2.68629 34 6V24C34 27.3137 31.3137 30 28 30H21.9961L17.6504 33.7568C17.2759 34.0805 16.7241 34.0805 16.3496 33.7568L12.0039 30H6C2.68629 30 4.83208e-08 27.3137 0 24V6C0 2.68629 2.68629 8.0532e-08 6 0H28Z",
    inner: {
      type: "path",
      d: "M3 5C3 3.89543 3.89543 3 5 3H29C30.1046 3 31 3.89543 31 5V25C31 26.1046 30.1046 27 29 27H5C3.89543 27 3 26.1046 3 25V5ZM21.3529 26.71L17 30.5L12.6471 26.71H21.3529Z",
    },
    imageClip: {
      type: "path",
      d: "M3 5C3 3.89543 3.89543 3 5 3H29C30.1046 3 31 3.89543 31 5V25C31 26.1046 30.1046 27 29 27H5C3.89543 27 3 26.1046 3 25V5Z",
      x: 3,
      y: 3,
      w: 28,
      h: 24,
    },
    pointerPath: "M21.3529 26.71L17 30.5L12.6471 26.71H21.3529Z",
    content: { cx: 17, cy: 15, r: 10 },
  },
  maptiler: {
    viewBox: [34, 40],
    anchor: "bottom",
    anchorY: 40,
    outerPath:
      "M17 0C26.3888 0 34 7.55845 34 16.8823C34 22.2594 31.4634 26.5985 27.8308 30.1408C24.1982 33.683 17 40 17 40C17 40 9.95496 33.683 6.16891 30.1408C2.38286 26.5985 0 22.2593 0 16.8823C0 7.55845 7.61116 0 17 0Z",
    inner: { type: "circle", cx: 17, cy: 17, r: 14 },
    content: { cx: 17, cy: 17, r: 11 },
    // the MapTiler diamond mark
    defaultContent: {
      d: "M0.37305 6.90062C-0.12435 6.40322 -0.12435 5.59678 0.37305 5.09938L5.09938 0.37305C5.59678 -0.12435 6.40322 -0.12435 6.90062 0.37305L11.6269 5.09938C12.1243 5.59678 12.1243 6.40322 11.6269 6.90062L6.90062 11.6269C6.40322 12.1243 5.59678 12.1243 5.09938 11.6269L0.37305 6.90062Z",
      size: 12,
    },
  },
  "maptiler-full": {
    viewBox: [34, 40],
    anchor: "bottom",
    anchorY: 40,
    outerPath:
      "M17 0C26.3888 0 34 7.55845 34 16.8823C34 22.2594 31.4634 26.5985 27.8308 30.1408C24.1982 33.683 17 40 17 40C17 40 9.95496 33.683 6.16891 30.1408C2.38286 26.5985 0 22.2593 0 16.8823C0 7.55845 7.61116 0 17 0Z",
    inner: {
      type: "path",
      d: "M17 3C24.732 3 31 9.23572 31 16.9279C31 21.364 28.911 24.9438 25.9195 27.8661C22.9279 30.7885 17 36 17 36C17 36 11.1982 30.7885 8.08028 27.8661C4.96235 24.9438 3 21.3639 3 16.9279C3 9.23572 9.26801 3 17 3Z",
    },
    imageClip: {
      type: "path",
      d: "M17 3C24.732 3 31 9.23572 31 16.9279C31 21.364 28.911 24.9438 25.9195 27.8661C22.9279 30.7885 17 36 17 36C17 36 11.1982 30.7885 8.08028 27.8661C4.96235 24.9438 3 21.3639 3 16.9279C3 9.23572 9.26801 3 17 3Z",
      x: 3,
      y: 3,
      w: 28,
      h: 33,
    },
    content: { cx: 17, cy: 17, r: 11 },
  },
};

//#endregion

//#region Defaults

export const DEFAULT_SHAPE: NonNullable<MapTilerMarkerBaseOptions["shape"]> = "maptiler";
export const DEFAULT_SIZE: NonNullable<MapTilerMarkerBaseOptions["size"]> = "m";
export const DEFAULT_OUTLINE_WIDTH = 2;

//#endregion

//#region Anchor Offset

/**
 * Pixel offset (MapLibre `offset` convention, +y down) that places the
 * shape's anchor point (`anchorY`) on the marker's lngLat instead of the
 * element center (MapLibre's default `center` anchor).
 * @param shapeKey - Shape variant.
 * @param sizeKey - Size key; `xs` renders a centered dot, so no offset.
 */
export function getShapeAnchorOffset(shapeKey: NonNullable<MapTilerMarkerBaseOptions["shape"]>, sizeKey: NonNullable<MapTilerMarkerBaseOptions["size"]>): [number, number] {
  if (sizeKey === "xs") return [0, 0];

  const shape = SHAPES[shapeKey];

  // center-anchored shapes sit on the lngLat as-is (MapLibre's default anchor)
  if (shape.anchor === "center") return [0, 0];

  const heightPx = SIZE_PX[sizeKey];
  const scale = heightPx / shape.viewBox[1];

  // shift the element up so the anchor line lands on the lngLat
  return [0, -(shape.anchorY * scale - heightPx / 2)];
}

//#endregion
