import type { ExpressionSpecification } from "maplibre-gl";
import type { ColorRamp } from "../ColorRamp";
import type { ZoomNumberValues, ZoomStringValues } from "../helpers/vectorlayerhelpers";

// Style value types shared by the data layers' styles.

/**
 * A colour: a CSS colour, a zoom ramp, a `ColorRamp`, or an expression. A
 * `ColorRamp` is read at each feature's `property` value — without
 * `property`, its lowest colour is used. Its alpha carries over.
 */
export type DataLayerColor = string | ZoomStringValues | ColorRamp | ExpressionSpecification;

/** A number: a fixed value, a zoom ramp, or an expression. */
export type DataLayerNumber = number | ZoomNumberValues | ExpressionSpecification;

/**
 * A dash pattern:
 * - `true` or `"dashed"`: dashes twice as long as the line is wide.
 * - `"dotted"`: dots — round with a `round` cap, square otherwise.
 * - `number[]`: dash and gap lengths in turn, in multiples of the line's
 *   width — `[3, 1]` is a dash 3 widths long, then a gap 1 width long.
 * - A string of underscores and spaces, for whole numbers: `"___ _ "` is `[3, 1, 1, 1]`.
 * - `false`: solid.
 */
export type DataLayerDash = boolean | "dashed" | "dotted" | number[] | `_${string}` | ` ${string}`;

/** Ends of a line or its dashes: flat at the end point (`butt`), or past it by half the width, rounded or squared. */
export type DataLayerLineCap = "butt" | "round" | "square";

/** Corners of a line: cut off (`bevel`), rounded, or pointed (`miter`). */
export type DataLayerLineJoin = "bevel" | "round" | "miter";

/**
 * A crisp outline. `true` turns it on with the defaults, an object turns it on
 * with the values given over the defaults, and `false` turns it off.
 */
export type DataLayerOutline = {
  /** Colour of the outline. Defaults to `#FFFFFF`. */
  color?: DataLayerColor;
  /** Width of the outline, in px. Defaults to `1`. */
  width?: DataLayerNumber;
  /** Opacity of the outline. Defaults to `1`, faded with the layer. */
  opacity?: DataLayerNumber;
  /** Blur of the outline, in px. Defaults to `0`. */
  blur?: DataLayerNumber;
};

/**
 * A soft halo, beneath what it surrounds. `true` turns it on with the
 * defaults, an object turns it on with the values given over the defaults,
 * and `false` turns it off. Its corners are always round.
 *
 * MapLibre blends a line's overlapping triangles over each other, so where a
 * glow isn't opaque — towards its edge, or all of it with an `opacity` below
 * `1` — it's heavier on the inside of bends, and where features' glows meet.
 */
export type DataLayerGlow = {
  /** Colour of the glow. Defaults to the layer's own colour. */
  color?: DataLayerColor;
  /** How far the glow spreads, in px. Defaults to `6`. */
  width?: DataLayerNumber;
  /**
   * Opacity of the glow. Defaults to `1`: opaque at what it surrounds, fading
   * out across its `blur` — the least overlap shows. Faded with the layer.
   */
  opacity?: DataLayerNumber;
  /** Blur of the glow, in px. Defaults to its `width`, so it fades out across its whole spread. */
  blur?: DataLayerNumber;
};
