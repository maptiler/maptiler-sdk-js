import earcut from "earcut";
import { Color } from "@maplibre/maplibre-gl-style-spec";

/**
 * A polygon on the image, as `[x, y]` points in image pixels.
 * The ring can be open, or closed by repeating the first point at the end.
 */
export type ImageViewerCutline = [number, number][];

/**
 * How the image outside of the cutline is drawn:
 * - `{ type: "hidden" }`: it is cut away, showing what is behind the viewer.
 * - `{ type: "overlay", color }`: it stays visible under a CSS color, e.g. `"rgba(0, 0, 0, 0.6)"`.
 */
export type ImageViewerOutsideCutlineStyle = { type: "hidden" } | { type: "overlay"; color: string };

// the area outside of the cutline is drawn with 16-bit indices, and has 4 more vertices: the corners around the cutline
const MAX_CUTLINE_POINTS = 2 ** 16 - 4;

//#region validateCutline
/**
 * Validates a cutline and returns a copy of it.
 * A closing point, equal to the first one, does not count towards the minimum of 3 points.
 *
 * @internal
 * @param {unknown} cutline - The cutline to validate.
 * @returns {ImageViewerCutline} A copy of the cutline.
 * @throws {Error} If the cutline is not an array of `[x, y]` points with finite coordinates, or has fewer than 3 or more than 65532 points.
 */
export function validateCutline(cutline: unknown): ImageViewerCutline {
  if (!Array.isArray(cutline)) {
    throw new Error("[ImageViewer]: `cutline` must be an array of [x, y] points");
  }

  const points = cutline.map((point: unknown, index) => {
    if (!Array.isArray(point) || point.length !== 2 || !point.every((value) => Number.isFinite(value))) {
      throw new Error(`[ImageViewer]: \`cutline\` point at index ${String(index)} must be an [x, y] pair of finite numbers`);
    }
    return [point[0], point[1]] as [number, number];
  });

  const pointCount = getOpenRing(points).length;

  if (pointCount < 3) {
    throw new Error(`[ImageViewer]: \`cutline\` must have at least 3 points, got ${String(pointCount)}`);
  }

  if (pointCount > MAX_CUTLINE_POINTS) {
    throw new Error(`[ImageViewer]: \`cutline\` must have at most ${String(MAX_CUTLINE_POINTS)} points, got ${String(pointCount)}`);
  }

  return points;
}

//#region validateOutsideCutlineStyle
/**
 * Validates the style of the image outside of the cutline and returns a copy of it.
 *
 * @internal
 * @param {unknown} style - The style to validate.
 * @returns {ImageViewerOutsideCutlineStyle} A copy of the style.
 * @throws {Error} If the type is not `"hidden"` or `"overlay"`, or the overlay color is not a valid CSS color.
 */
export function validateOutsideCutlineStyle(style: unknown): ImageViewerOutsideCutlineStyle {
  const { type, color } = (style ?? {}) as { type?: unknown; color?: unknown };

  if (type === "hidden") {
    return { type };
  }

  if (type === "overlay") {
    if (typeof color !== "string" || !Color.parse(color)) {
      throw new Error("[ImageViewer]: `outsideCutlineStyle.color` must be a valid CSS color");
    }
    return { type, color };
  }

  throw new Error('[ImageViewer]: `outsideCutlineStyle.type` must be "hidden" or "overlay"');
}

//#region getOutsideCutlineColor
/**
 * The color the outside of the cutline is drawn with, as premultiplied RGBA.
 * Hidden is fully transparent, drawn without blending to erase the image.
 *
 * @internal
 * @param {ImageViewerOutsideCutlineStyle} style - A valid style.
 * @returns {[number, number, number, number]} The premultiplied color.
 */
export function getOutsideCutlineColor(style: ImageViewerOutsideCutlineStyle): [number, number, number, number] {
  if (style.type === "hidden") {
    return [0, 0, 0, 0];
  }

  // a valid style has a color that parses, the fallback only satisfies the type. `Color` is premultiplied
  const { r, g, b, a } = Color.parse(style.color) ?? Color.black;
  return [r, g, b, a];
}

//#region triangulateOutsideCutline
/**
 * Triangulates the area outside of the cutline, in image pixels.
 * The outer ring is the bounding box of the image and the cutline, padded by the size of the image,
 * so the cutline is always a hole within it. The layer only draws the part of it on the image.
 *
 * @internal
 * @param {ImageViewerCutline} cutline - A valid cutline.
 * @param {[number, number]} imageSize - The width and height of the image.
 * @returns {{ vertices: number[]; indices: number[] }} Flat `[x, y, ...]` vertices, and the indices of their triangles.
 */
export function triangulateOutsideCutline(cutline: ImageViewerCutline, [width, height]: [number, number]) {
  const ring = getOpenRing(cutline);

  // reduce rather than spreading into Math.min / max, which overflows the stack for long cutlines
  const [minX, minY, maxX, maxY] = ring.reduce(
    ([minX, minY, maxX, maxY], [x, y]) => [Math.min(minX, x), Math.min(minY, y), Math.max(maxX, x), Math.max(maxY, y)],
    [0, 0, width, height],
  );
  // reaches past the edges of the image, so the layer can hide the edges of the tiles too
  const padding = Math.max(width, height);

  const [left, top, right, bottom] = [minX - padding, minY - padding, maxX + padding, maxY + padding];
  const vertices = [left, top, right, top, right, bottom, left, bottom, ...ring.flat()];
  // the cutline is a hole, starting after the 4 corners of the outer ring
  const indices = earcut(vertices, [4]);

  return { vertices, indices };
}

//#region helpers

/**
 * The points of the ring without its closing point, if it has one.
 */
function getOpenRing(points: ImageViewerCutline) {
  const first = points[0];
  const last = points[points.length - 1];
  const isClosed = points.length > 1 && first[0] === last[0] && first[1] === last[1];

  return isClosed ? points.slice(0, -1) : points;
}
