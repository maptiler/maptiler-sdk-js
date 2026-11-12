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
 * A dash pattern, in multiples of the line's width: `[3, 1]` is a dash 3
 * widths long, then a gap 1 width long, repeated. A string of underscores and
 * spaces works too, for whole numbers: `"___ _ "` is `[3, 1, 1, 1]`.
 */
export type DataLayerDashArray = number[] | string;

/** Ends of a line or its dashes: flat at the end point (`butt`), or past it by half the width, rounded or squared. */
export type DataLayerLineCap = "butt" | "round" | "square";

/** Corners of a line: cut off (`bevel`), rounded, or pointed (`miter`). */
export type DataLayerLineJoin = "bevel" | "round" | "miter";
