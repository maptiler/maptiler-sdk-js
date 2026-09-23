import { MapTilerMarkerBaseOptions } from './types';
/** Inner (fill) region of a shape — either a circle or an arbitrary path. */
export type ShapeInner = {
    type: "circle";
    cx: number;
    cy: number;
    r: number;
} | {
    type: "path";
    d: string;
};
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
export type ShapeContent = {
    cx: number;
    cy: number;
    r: number;
};
/**
 * Glyph drawn when a marker has no content of its own. Rendered unscaled in
 * viewBox units — `d` is designed in a `size`-unit square — and centered on the
 * shape's `content` circle.
 */
export type ShapeDefaultContent = {
    d: string;
    size: number;
};
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
export declare const SIZE_PX: Record<NonNullable<MapTilerMarkerBaseOptions["size"]>, number>;
export declare const SHADOW_FILTER: Record<NonNullable<MapTilerMarkerBaseOptions["shadow"]>, string>;
export declare const SHAPES: Record<NonNullable<MapTilerMarkerBaseOptions["shape"]>, ShapeDescriptor>;
export declare const DEFAULT_SHAPE: NonNullable<MapTilerMarkerBaseOptions["shape"]>;
export declare const DEFAULT_SIZE: NonNullable<MapTilerMarkerBaseOptions["size"]>;
export declare const DEFAULT_OUTLINE_WIDTH = 2;
/**
 * Pixel offset (MapLibre `offset` convention, +y down) that places the
 * shape's anchor point (`anchorY`) on the marker's lngLat instead of the
 * element center (MapLibre's default `center` anchor).
 * @param shapeKey - Shape variant.
 * @param sizeKey - Size key; `xs` renders a centered dot, so no offset.
 */
export declare function getShapeAnchorOffset(shapeKey: NonNullable<MapTilerMarkerBaseOptions["shape"]>, sizeKey: NonNullable<MapTilerMarkerBaseOptions["size"]>): [number, number];
