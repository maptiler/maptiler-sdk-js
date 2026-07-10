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

export type ShapeDescriptor = {
  viewBox: [number, number];
  /** Which point of the shape sits on the marker's geographic location. */
  anchor: "bottom" | "center";
  /**
   * Y coordinate (viewBox units) of the shape's visual bottom — the anchor
   * point. Differs from the viewBox height when the shape has breathing room
   * below the glyph (e.g. `rounded`, `circle`).
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
};

//#endregion

//#region Lookup Tables

export const SIZE_PX: Record<NonNullable<MapTilerMarkerBaseOptions["size"]>, number> = {
  xs: 5,
  s: 16,
  m: 28,
  l: 40,
  xl: 56,
};

export const SHADOW_FILTER: Record<NonNullable<MapTilerMarkerBaseOptions["shadow"]>, string> = {
  soft: "drop-shadow(0 1px 2px rgba(0,0,0,0.20))",
  medium: "drop-shadow(0 2px 2px rgba(0,0,0,0.28)) drop-shadow(0 4px 4px rgba(0,0,0,0.15))",
  strong: "drop-shadow(0 4px 6px rgba(0,0,0,0.35)) drop-shadow(0 8px 10px rgba(0,0,0,0.20))",
};

//#endregion

//#region Shapes

export const SHAPES: Record<NonNullable<MapTilerMarkerBaseOptions["shape"]>, ShapeDescriptor> = {
  rounded: {
    viewBox: [100, 120],
    anchor: "bottom",
    anchorY: 107.4,
    outerPath: "M50 4 C 24.6 4, 4 24.6, 4 50 C 4 70, 20 86, 40 104 C 45 108.5, 55 108.5, 60 104 C 80 86, 96 70, 96 50 C 96 24.6, 75.4 4, 50 4 Z",
    inner: { type: "circle", cx: 50, cy: 50, r: 36 },
    content: { cx: 50, cy: 50, r: 30 },
  },
  circle: {
    viewBox: [100, 100],
    anchor: "center",
    anchorY: 96,
    outerPath: "M50 4 A46 46 0 1 0 50 96 A46 46 0 1 0 50 4Z",
    inner: { type: "circle", cx: 50, cy: 50, r: 38 },
    content: { cx: 50, cy: 50, r: 31 },
  },
  "bubble-circle": {
    viewBox: [17.828966, 19.942984],
    anchor: "bottom",
    anchorY: 19.942984,
    outerPath:
      "M 8.96061 0.00002 L 8.51408 0.00891 L 8.07590 0.03887 L 7.65676 0.08796 L 7.21043 0.16277 L 6.85625 0.23915 L 6.38942 0.36336 L 5.93003 0.51276 L 5.59118 0.64110 L 5.25784 0.78320 L 4.87784 0.96549 L 4.48139 1.18026 L 4.09635 1.41476 L 3.72363 1.66833 L 3.36411 1.94030 L 3.01869 2.23003 L 2.68825 2.53685 L 2.37393 2.85965 L 2.07627 3.19783 L 1.79597 3.55049 L 1.53369 3.91675 L 1.29013 4.29573 L 1.06597 4.68655 L 0.87234 5.06647 L 0.71622 5.41068 L 0.57497 5.76119 L 0.41009 6.23726 L 0.27249 6.72192 L 0.18747 7.09017 L 0.11530 7.48002 L 0.05637 7.90946 L 0.01830 8.34129 L 0.00110 8.77447 L 0.00477 9.20798 L 0.01883 9.49665 L 0.05733 9.92839 L 0.09461 10.21493 L 0.13863 10.48599 L 0.22039 10.88961 L 0.32080 11.28895 L 0.43961 11.68319 L 0.57656 12.07152 L 0.73140 12.45312 L 0.90387 12.82718 L 1.04814 13.10890 L 1.20236 13.38524 L 1.36626 13.65590 L 1.53963 13.92056 L 1.81690 14.30568 L 2.01289 14.55406 L 2.21750 14.79541 L 2.43051 15.02943 L 2.65168 15.25581 L 2.88697 15.47995 L 3.13667 15.70080 L 3.39439 15.91216 L 3.65977 16.11378 L 3.93245 16.30540 L 4.21204 16.48675 L 4.64359 16.73899 L 4.93888 16.89358 L 5.23979 17.03701 L 5.54596 17.16903 L 5.82390 17.27712 L 7.80853 19.41164 L 7.99798 19.60673 L 8.16715 19.75677 L 8.32194 19.86238 L 8.46830 19.92421 L 8.54017 19.93891 L 8.61215 19.94290 L 8.68499 19.93627 L 8.75942 19.91909 L 8.91603 19.85342 L 9.08791 19.74653 L 9.28099 19.59905 L 9.50120 19.41164 L 11.73651 17.37161 L 12.04726 17.26149 L 12.38379 17.12717 L 12.68810 16.99148 L 12.98703 16.84447 L 13.28019 16.68639 L 13.56724 16.51751 L 13.84780 16.33807 L 14.25570 16.04970 L 14.64698 15.73903 L 15.02042 15.40694 L 15.36332 15.06644 L 15.68185 14.71432 L 15.88362 14.47046 L 16.16984 14.09174 L 16.43564 13.69841 L 16.60112 13.42857 L 16.83119 13.01314 L 16.97214 12.72951 L 17.08611 12.47927 L 17.24234 12.09763 L 17.38066 11.70919 L 17.50082 11.31476 L 17.60258 10.91518 L 17.66007 10.64633 L 17.73059 10.23998 L 17.78352 9.81692 L 17.80791 9.52905 L 17.82712 9.09611 L 17.82547 8.66272 L 17.80295 8.22990 L 17.75957 7.79869 L 17.69531 7.37013 L 17.61714 6.97627 L 17.49109 6.47795 L 17.37772 6.10951 L 17.20189 5.62657 L 17.05184 5.27142 L 16.88645 4.92305 L 16.68489 4.54458 L 16.45382 4.15813 L 16.20359 3.78384 L 15.93490 3.42260 L 15.64844 3.07525 L 15.34490 2.74268 L 15.02497 2.42574 L 14.69503 2.12991 L 14.35087 1.85083 L 13.99336 1.58912 L 13.62336 1.34539 L 13.24174 1.12028 L 12.84936 0.91439 L 12.47170 0.73902 L 12.13627 0.60091 L 11.68083 0.43842 L 11.21722 0.30102 L 10.74675 0.18906 L 10.27074 0.10289 L 9.85116 0.04861 L 9.40662 0.01323 Z",
    inner: { type: "circle", cx: 8.91, cy: 8.82, r: 7.23 },
    content: { cx: 8.91, cy: 8.82, r: 5.75 },
  },
  "bubble-square": {
    viewBox: [113.9009, 107.06401],
    anchor: "bottom",
    anchorY: 107.06401,
    outerPath:
      "M 18.224143,0 C 8.1279682,0 0,8.1279682 0,18.224143 v 54.672429 c 0,10.096174 8.1279682,18.224143 18.224143,18.224143 h 21.650068 l 4.022125,4.013227 c 0.05884,0.0721 0.128529,0.137435 0.195768,0.204665 l 6.362432,6.362433 c 0.06724,0.0672 0.132617,0.13693 0.204666,0.19577 l 4.35137,4.36027 c 1.075919,1.07592 2.803833,1.07591 3.879749,0 l 4.35137,-4.36027 c 0.07205,-0.0588 0.137421,-0.12852 0.204666,-0.19577 l 6.362433,-6.362433 c 0.06724,-0.0673 0.136925,-0.132615 0.195767,-0.204665 l 4.022125,-4.013227 H 95.67675 c 10.09618,0 18.22414,-8.127969 18.22414,-18.224143 V 18.224143 C 113.90089,8.1279682 105.77293,0 95.67675,0 Z",
    inner: {
      type: "path",
      d: "m 18.224143,11.158728 c -4.105343,0 -7.065415,2.960073 -7.065415,7.065415 v 54.672429 c 0,4.105343 2.960071,7.065415 7.065415,7.065415 h 26.268393 l 7.688311,7.670513 0.04449,0.05339 4.725108,4.725107 4.725107,-4.725107 0.04449,-0.05339 7.68831,-7.670513 H 95.67675 c 4.105352,0 7.06542,-2.960066 7.06542,-7.065415 V 18.224143 c 0,-4.105348 -2.960068,-7.065415 -7.06542,-7.065415 z",
    },
    imageClip: {
      type: "path",
      d: "M 18.224143,11.158728 H 95.67675 A 7.065415,7.065415 0 0 1 102.74217,18.224143 V 72.896572 A 7.065415,7.065415 0 0 1 95.67675,79.961987 H 18.224143 A 7.065415,7.065415 0 0 1 11.158728,72.896572 V 18.224143 A 7.065415,7.065415 0 0 1 18.224143,11.158728 Z",
      x: 11.158728,
      y: 11.158728,
      w: 91.583442,
      h: 68.803259,
    },
    pointerPath: "m 44.492536,79.961987 7.688311,7.670513 0.04449,0.05339 4.725108,4.725107 4.725107,-4.725107 0.04449,-0.05339 7.68831,-7.670513 z",
    content: { cx: 56.95, cy: 45.56, r: 26 },
  },
  square: {
    viewBox: [100, 100],
    anchor: "center",
    anchorY: 96,
    outerPath: "M 16,4 H 84 A 12,12 0 0 1 96,16 V 84 A 12,12 0 0 1 84,96 H 16 A 12,12 0 0 1 4,84 V 16 A 12,12 0 0 1 16,4 Z",
    inner: { type: "path", d: "M 21,13 H 79 A 8,8 0 0 1 87,21 V 79 A 8,8 0 0 1 79,87 H 21 A 8,8 0 0 1 13,79 V 21 A 8,8 0 0 1 21,13 Z" },
    imageClip: {
      type: "path",
      d: "M 21,13 H 79 A 8,8 0 0 1 87,21 V 79 A 8,8 0 0 1 79,87 H 21 A 8,8 0 0 1 13,79 V 21 A 8,8 0 0 1 21,13 Z",
      x: 13,
      y: 13,
      w: 74,
      h: 74,
    },
    content: { cx: 50, cy: 50, r: 30 },
  },
  bulb: {
    viewBox: [100, 132],
    anchor: "bottom",
    anchorY: 128,
    outerPath: "M 50,4 C 24.59,4 4,24.59 4,50 C 4,87.5 50,128 50,128 C 50,128 96,87.5 96,50 C 96,24.59 75.41,4 50,4 Z",
    inner: { type: "circle", cx: 50, cy: 50, r: 34 },
    content: { cx: 50, cy: 50, r: 28 },
  },
  squircle: {
    viewBox: [100, 137],
    anchor: "bottom",
    anchorY: 133,
    outerPath: "M 18,4 H 82 C 89.73,4 96,10.27 96,18 V 66 C 96,101.5 66,122 50,133 C 34,122 4,101.5 4,66 V 18 C 4,10.27 10.27,4 18,4 Z",
    inner: { type: "path", d: "M 23,14 H 77 C 82,14 86,18 86,23 V 65 C 86,95 66,110 50,119 C 34,110 14,95 14,65 V 23 C 14,18 18,14 23,14 Z" },
    imageClip: {
      type: "path",
      d: "M 23,14 H 77 C 82,14 86,18 86,23 V 65 C 86,95 66,110 50,119 C 34,110 14,95 14,65 V 23 C 14,18 18,14 23,14 Z",
      x: 14,
      y: 14,
      w: 72,
      h: 105,
    },
    content: { cx: 50, cy: 55, r: 34 },
  },
  shield: {
    viewBox: [100, 137],
    anchor: "bottom",
    anchorY: 133,
    outerPath: "M 14,4 H 86 C 91.52,4 96,8.48 96,14 V 58 C 96,99 72,123 50,133 C 28,123 4,99 4,58 V 14 C 4,8.48 8.48,4 14,4 Z",
    inner: { type: "path", d: "M 23,14 H 77 C 82,14 86,18 86,23 V 56 C 86,87 67,109 50,118 C 33,109 14,87 14,56 V 23 C 14,18 18,14 23,14 Z" },
    imageClip: {
      type: "path",
      d: "M 23,14 H 77 C 82,14 86,18 86,23 V 56 C 86,87 67,109 50,118 C 33,109 14,87 14,56 V 23 C 14,18 18,14 23,14 Z",
      x: 14,
      y: 14,
      w: 72,
      h: 104,
    },
    content: { cx: 50, cy: 54, r: 34 },
  },
};

//#endregion

//#region Defaults

export const DEFAULT_SHAPE: NonNullable<MapTilerMarkerBaseOptions["shape"]> = "bubble-square";
export const DEFAULT_SIZE: NonNullable<MapTilerMarkerBaseOptions["size"]> = "m";
export const DEFAULT_OUTLINE_WIDTH = 2;
export const DEFAULT_OUTER_COLOR = "#FFFFFF";
export const DEFAULT_INNER_COLOR = "hsl(223, 100%, 65%)";
export const DEFAULT_CONTENT_COLOR = "#FFFFFF";

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
