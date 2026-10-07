import type { MapTilerMarkerBaseOptions, MapTilerMarkerSize } from "./types";
import { SIZE_PX } from "./marker-constants";
import type { MarkerIconName } from "./marker-icons";

//#region Types

/** Sizes that render a shape SVG — `xs` renders a plain dot instead. */
export type ShapeSize = Exclude<MapTilerMarkerSize, "xs">;

/**
 * One drawable SVG primitive, in marker-box px. Kept as the same primitive the
 * design uses (a circle stays a `<circle>`, a rounded square a `<rect>`), so
 * the browser rasterizes it exactly like the design export.
 */
export type ShapePrimitive =
  | { type: "path"; d: string }
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "rect"; x: number; y: number; w: number; h: number; rx: number };

/**
 * Region content is confined to: the inner fill (on bubble-square, body and tail).
 * Images fill it edge to edge; text and elements are clipped to it.
 * `x`/`y`/`w`/`h` are the bounding box of `shape`.
 */
export type ShapeClip = { shape: ShapePrimitive; x: number; y: number; w: number; h: number };

/**
 * Geometry of one shape at one size, in CSS px. The SVG viewBox is the
 * marker box (`SIZE_PX[size]` square), so one unit is one pixel and every
 * value below is taken 1:1 from the design.
 */
export type ShapeGeometry = {
  /** The body, painted in the outer colour. */
  outer: ShapePrimitive;
  /** The fill, painted in the inner colour — drawn in order, as separate elements like the design. */
  inner: ShapePrimitive[];
  clip: ShapeClip;
  /** Centre of the content box (text, icon, element). */
  content: { cx: number; cy: number };
};

export type ShapeDescriptor = {
  /** Which point of the shape sits on the marker's geographic location — the box centre, or the tail tip at the bottom edge of the box. */
  anchor: "bottom" | "center";
  /** Built-in icon shown when the marker has no content of its own — drawn exactly like `icon` content. */
  defaultIcon?: MarkerIconName;
  /** Per-size geometry. Sizes are drawn individually (fixed ring width, padding), not scaled from one another. */
  sizes: Record<ShapeSize, ShapeGeometry>;
};

/** Content sizing per marker size, shared by every shape (px). */
export type ContentMetrics = {
  /** Content box — element content is sized to it. */
  box: number;
  /** Icon / SVG-glyph box. */
  icon: number;
  /** Text font size. */
  font: number;
  /**
   * Distance from the content-box centre down to the text baseline. Whole pixels,
   * so flat letter bottoms land on one crisp row on 1× screens — the design renders
   * M/S on a half pixel (4.5 / 2.5), which reads as text sitting low.
   */
  baseline: number;
};

//#endregion

//#region Helpers

const path = (d: string): ShapePrimitive => ({ type: "path", d });
const circle = (cx: number, cy: number, r: number): ShapePrimitive => ({ type: "circle", cx, cy, r });
const rect = (x: number, y: number, w: number, h: number, rx: number): ShapePrimitive => ({ type: "rect", x, y, w, h, rx });

/** Geometry whose fill is a single primitive — content is clipped to that same primitive. */
function geometry(outer: ShapePrimitive, inner: ShapePrimitive, box: [number, number, number, number], content: { cx: number; cy: number }): ShapeGeometry {
  const [x, y, w, h] = box;
  return { outer, inner: [inner], clip: { shape: inner, x, y, w, h }, content };
}

/** Bubble-square: the fill can be several primitives; content (and images, through the tail) is clipped to their union. */
function bubbleSquare(
  outer: ShapePrimitive,
  inner: ShapePrimitive[],
  union: ShapePrimitive,
  box: [number, number, number, number],
  content: { cx: number; cy: number },
): ShapeGeometry {
  const [x, y, w, h] = box;
  return { outer, inner, clip: { shape: union, x, y, w, h }, content };
}

//#endregion

//#region Shapes

// Geometry exported from the "Marker foundations" Figma frame (Map Controls UI),
// component sets l-3px-outline / m-3px-outline / s-2px-outline, in marker-box px:
// the same primitives and coordinates as the Figma SVG export.

export const CONTENT_METRICS: Record<ShapeSize, ContentMetrics> = {
  l: { box: 20, icon: 16, font: 14, baseline: 5 },
  m: { box: 16, icon: 12, font: 12, baseline: 4 },
  s: { box: 12, icon: 8, font: 8, baseline: 3 },
};

/** Letter spacing of text content, in em. */
export const TEXT_LETTER_SPACING_EM = -0.08;

export const SHAPES: Record<NonNullable<MapTilerMarkerBaseOptions["shape"]>, ShapeDescriptor> = {
  circle: {
    anchor: "center",
    sizes: {
      l: geometry(circle(20, 20, 16), circle(20, 20, 13), [7, 7, 26, 26], { cx: 20, cy: 20 }),
      m: geometry(circle(16, 16, 13), circle(16, 16, 10), [6, 6, 20, 20], { cx: 16, cy: 16 }),
      s: geometry(circle(12, 12, 10), circle(12, 12, 8), [4, 4, 16, 16], { cx: 12, cy: 12 }),
    },
  },
  square: {
    anchor: "center",
    sizes: {
      l: geometry(rect(4, 4, 32, 32, 6), rect(7, 7, 26, 26, 2), [7, 7, 26, 26], { cx: 20, cy: 20 }),
      m: geometry(rect(3, 3, 26, 26, 5), rect(6, 6, 20, 20, 2), [6, 6, 20, 20], { cx: 16, cy: 16 }),
      s: geometry(rect(2, 2, 20, 20, 4), rect(4, 4, 16, 16, 2), [4, 4, 16, 16], { cx: 12, cy: 12 }),
    },
  },
  "bubble-circle": {
    anchor: "bottom",
    sizes: {
      l: geometry(
        path(
          "M20 5.0004C28.8366 5.0004 36 12.1638 36 21.0004C35.9998 28.2145 31.2247 34.3118 24.6631 36.308L20.6943 39.7406C20.2949 40.0859 19.7051 40.0859 19.3057 39.7406L15.3359 36.308C8.7748 34.3115 4.0002 28.2142 4 21.0004C4 12.1638 11.1634 5.0004 20 5.0004Z",
        ),
        circle(20, 21, 13),
        [7, 8, 26, 26],
        { cx: 20, cy: 21 },
      ),
      m: geometry(
        path(
          "M16 2.0999C23.1796 2.0999 29 8.0017 29 15.2817C29 21.1142 25 26 20.1896 27.4114L16.6676 30.5C16.3431 30.7845 15.8641 30.7844 15.5395 30.5L12.0166 27.4114C7 26 3 21.114 3 15.2817C3 8.0016 8.8204 2.0999 16 2.0999Z",
        ),
        circle(16, 15, 10),
        [6, 5, 20, 20],
        { cx: 16, cy: 15 },
      ),
      s: geometry(
        path(
          "M12 1.99963C17.5228 1.99963 21.9999 6.4769 22 11.9996C22 16.3691 19.1965 20.0809 15.291 21.442L12.4648 23.8307C12.1974 24.0565 11.8026 24.0565 11.5352 23.8307L8.70801 21.442C4.803 20.0807 2 16.3687 2 11.9996C2.00013 6.4769 6.47723 1.99963 12 1.99963Z",
        ),
        circle(12, 11.9999, 8),
        [4, 4, 16, 16],
        { cx: 12, cy: 12 },
      ),
    },
  },
  "bubble-square": {
    anchor: "bottom",
    sizes: {
      l: bubbleSquare(
        path(
          "M31 6C34.3137 6 37 8.6863 37 12V30C37 33.3137 34.3137 36 31 36H24.9961L20.6504 39.7568C20.2759 40.0805 19.7241 40.0805 19.3496 39.7568L15.0039 36H9C5.6863 36 3 33.3137 3 30V12C3 8.6863 5.6863 6 9 6H31Z",
        ),
        [
          path("M24.3529 32.71L20 36.5L15.6471 32.71H24.3529Z"),
          path("M6 11C6 9.8954 6.8954 9 8 9H32C33.1046 9 34 9.8954 34 11V31C34 32.1046 33.1046 33 32 33H8C6.8954 33 6 32.1046 6 31V11Z"),
        ],
        // body + tail — the design's image mask
        path("M6 11C6 9.8954 6.8954 9 8 9H32C33.1046 9 34 9.8954 34 11V31C34 32.1046 33.1046 33 32 33H8C6.8954 33 6 32.1046 6 31V11ZM24.3529 32.71L20 36.5L15.6471 32.71H24.3529Z"),
        [6, 9, 28, 27.5],
        { cx: 20, cy: 21 },
      ),
      m: bubbleSquare(
        path(
          "M25 5C27.7614 5 30 7.2386 30 10V24.0586C30 26.82 27.7614 29.0586 25 29.0586H19.8867L16.5068 31.8213C16.2156 32.0594 15.7854 32.0594 15.4941 31.8213L12.1143 29.0586H7C4.2386 29.0586 2 26.82 2 24.0586V10C2 7.2386 4.2386 5 7 5H25Z",
        ),
        [path("M25 8C26.1046 8 27 8.8954 27 10V24C27 25.1046 26.1046 26 25 26H18.667L16 28L13.333 26H7C5.8954 26 5 25.1046 5 24V10C5 8.8954 5.8954 8 7 8H25Z")],
        path("M25 8C26.1046 8 27 8.8954 27 10V24C27 25.1046 26.1046 26 25 26H18.667L16 28L13.333 26H7C5.8954 26 5 25.1046 5 24V10C5 8.8954 5.8954 8 7 8H25Z"),
        [5, 8, 22, 20],
        { cx: 16, cy: 17 },
      ),
      s: bubbleSquare(
        path(
          "M19 4C21.2091 4 23 5.7909 23 8V18.0586C23 20.2677 21.2091 22.0586 19 22.0586H14.6631L12.5059 23.8213C12.2146 24.0593 11.7854 24.0594 11.4941 23.8213L9.3369 22.0586H5C2.7909 22.0586 1 20.2677 1 18.0586V8C1 5.7909 2.7909 4 5 4H19Z",
        ),
        [path("M19 6C20.1046 6 21 6.8954 21 8V18C21 19.1046 20.1046 20 19 20H14.667L12 22L9.333 20H5C3.8954 20 3 19.1046 3 18V8C3 6.8954 3.8954 6 5 6H19Z")],
        path("M19 6C20.1046 6 21 6.8954 21 8V18C21 19.1046 20.1046 20 19 20H14.667L12 22L9.333 20H5C3.8954 20 3 19.1046 3 18V8C3 6.8954 3.8954 6 5 6H19Z"),
        [3, 6, 18, 16],
        { cx: 12, cy: 13 },
      ),
    },
  },
  maptiler: {
    anchor: "bottom",
    // the MapTiler mark, as an icon-type marker
    defaultIcon: "maptiler",
    sizes: {
      l: geometry(
        path(
          "M20 0C29.3888 0 37 7.5585 37 16.8823C37 22.2594 34.4634 26.5985 30.8308 30.1408C27.1982 33.683 20 40 20 40C20 40 12.955 33.683 9.1689 30.1408C5.3829 26.5985 3 22.2593 3 16.8823C3 7.5585 10.6112 0 20 0Z",
        ),
        path("M20 31C27.732 31 34 24.732 34 17C34 9.268 27.732 3 20 3C12.268 3 6 9.268 6 17C6 24.732 12.268 31 20 31Z"),
        [6, 3, 28, 28],
        { cx: 20, cy: 17 },
      ),
      m: geometry(
        path(
          "M16 1C23.1797 1 29 6.8578 29 14.0838C29 18.251 27.0602 21.6139 24.2824 24.3591C21.5045 27.1043 16 32 16 32C16 32 10.6126 27.1043 7.7174 24.3591C4.82219 21.6139 3 18.251 3 14.0838C3 6.8578 8.8203 1 16 1Z",
        ),
        path("M16 24C21.5228 24 26 19.5228 26 14C26 8.47715 21.5228 4 16 4C10.4772 4 6 8.47715 6 14C6 19.5228 10.4772 24 16 24Z"),
        [6, 4, 20, 20],
        { cx: 16, cy: 14 },
      ),
      s: geometry(
        path(
          "M12 2C16.9706 2 21 6.1572 21 11.2852C21 14.2427 19.6571 16.6292 17.7339 18.5774C15.8108 20.5257 12 24 12 24C12 24 8.2703 20.5257 6.2659 18.5774C4.2615 16.6292 3 14.2426 3 11.2852C3 6.1572 7.0294 2 12 2Z",
        ),
        path("M12 18C15.866 18 19 14.866 19 11C19 7.134 15.866 4 12 4C8.134 4 5 7.134 5 11C5 14.866 8.134 18 12 18Z"),
        [5, 4, 14, 14],
        { cx: 12, cy: 11 },
      ),
    },
  },
  "maptiler-full": {
    anchor: "bottom",
    sizes: {
      l: geometry(
        path(
          "M20 0C29.3888 0 37 7.5585 37 16.8823C37 22.2594 34.4634 26.5985 30.8308 30.1408C27.1982 33.683 20 40 20 40C20 40 12.955 33.683 9.1689 30.1408C5.3829 26.5985 3 22.2593 3 16.8823C3 7.5585 10.6112 0 20 0Z",
        ),
        path(
          "M20 3C27.732 3 34 9.2357 34 16.9279C34 21.364 31.911 24.9438 28.9195 27.8661C25.9279 30.7885 20 36 20 36C20 36 14.1982 30.7885 11.0803 27.8661C7.9624 24.9438 6 21.3639 6 16.9279C6 9.2357 12.268 3 20 3Z",
        ),
        [6, 3, 28, 33],
        { cx: 20, cy: 17 },
      ),
      m: geometry(
        path(
          "M16 2C23.1797 2 29 7.66883 29 14.6617C29 18.6945 27.0602 21.9489 24.2824 24.6056C21.5045 27.2623 16 32 16 32C16 32 10.6126 27.2623 7.7174 24.6056C4.82219 21.9489 3 18.6945 3 14.6617C3 7.66883 8.8203 2 16 2Z",
        ),
        path(
          "M16 5C21.5228 5 26 9.34611 26 14.7073C26 17.7991 24.5079 20.2941 22.3711 22.3309C20.2342 24.3677 16 28 16 28C16 28 11.8559 24.3677 9.62877 22.3309C7.40168 20.2941 6 17.7991 6 14.7073C6 9.34611 10.4772 5 16 5Z",
        ),
        [6, 5, 20, 23],
        { cx: 16, cy: 15 },
      ),
      s: geometry(
        path(
          "M12 3C16.9706 3 21 6.9682 21 11.8632C21 14.6862 19.6571 16.9642 17.7339 18.8239C15.8108 20.6836 12 24 12 24C12 24 8.2703 20.6836 6.2659 18.8239C4.2615 16.9642 3 14.6861 3 11.8632C3 6.9682 7.0294 3 12 3Z",
        ),
        path(
          "M12 5C15.866 5 19 8.0234 19 11.7529C19 13.9038 17.9555 15.6394 16.4597 17.0563C14.964 18.4732 12 21 12 21C12 21 9.0991 18.4732 7.5401 17.0563C5.9812 15.6394 5 13.9037 5 11.7529C5 8.0234 8.134 5 12 5Z",
        ),
        [5, 5, 14, 16],
        { cx: 12, cy: 12 },
      ),
    },
  },
};

/**
 * Geometry of a shape at a size. `xs` has no shape geometry (it renders a
 * dot); it resolves to `fallback` so callers holding a hidden shape SVG
 * still get valid numbers.
 */
export function getShapeGeometry(shapeKey: NonNullable<MapTilerMarkerBaseOptions["shape"]>, sizeKey: MapTilerMarkerSize, fallback: ShapeSize = "m"): ShapeGeometry {
  return SHAPES[shapeKey].sizes[sizeKey === "xs" ? fallback : sizeKey];
}

//#endregion

//#region Anchor Offset

/**
 * Pixel offset (MapLibre `offset` convention, +y down) that places the
 * shape's anchor point on the marker's lngLat instead of the element centre
 * (MapLibre's default `center` anchor). Bottom-anchored shapes have their
 * tail tip on the bottom edge of the marker box at every size.
 * @param shapeKey - Shape variant.
 * @param sizeKey - Size key; `xs` renders a centered dot, so no offset.
 */
export function getShapeAnchorOffset(shapeKey: NonNullable<MapTilerMarkerBaseOptions["shape"]>, sizeKey: NonNullable<MapTilerMarkerBaseOptions["size"]>): [number, number] {
  if (sizeKey === "xs") return [0, 0];

  // center-anchored shapes sit on the lngLat as-is (MapLibre's default anchor)
  if (SHAPES[shapeKey].anchor === "center") return [0, 0];

  // shift the element up by half its height so the bottom edge lands on the lngLat
  return [0, -SIZE_PX[sizeKey] / 2];
}

//#endregion
