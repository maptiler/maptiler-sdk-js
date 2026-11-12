import type { ExpressionSpecification } from "maplibre-gl";
import type { PropertyValues, ZoomNumberValues, ZoomStringValues } from "../../helpers/vectorlayerhelpers";
import type { DataLayerConstructorOptions } from "../DataLayer";
import type { DataLayerColor, DataLayerDashArray, DataLayerLineCap, DataLayerLineJoin, DataLayerNumber } from "../types";

/** How a {@link LineLayer} renders. It has the one mode for now. */
export type LineLayerMode = "line";

/**
 * Style of a {@link LineLayer} — the visual options of the `addPolyline`
 * helper under the data layers' shared names (`color` for `lineColor`,
 * `width` for `lineWidth`, …), with the same meaning and defaults.
 */
export type LineLayerStyle = {
  /** Colour of the lines. Required for now: it will default to colours suiting the map style. */
  color: DataLayerColor;
  /** Property read by a `ColorRamp` `color`, and by a `PropertyValues` `width`. */
  property?: string;
  /**
   * Width of the lines, in px: a fixed width, a zoom ramp, `PropertyValues`
   * mapping `property` values to widths, or an expression. Defaults to `3`.
   */
  width?: number | ZoomNumberValues | PropertyValues | ExpressionSpecification;
  /** Opacity of the lines: a fixed value in [0, 1], a zoom ramp, or an expression. Defaults to `1`, faded at the edges of the layer's zoom range. */
  opacity?: DataLayerNumber;
  /** Blur of the lines, in px. Defaults to `0`. */
  blur?: DataLayerNumber;
  /** Draws each line as two, either side of a gap this wide, in px. Defaults to `0`. The casing doesn't account for it. */
  gapWidth?: DataLayerNumber;
  /** Dash pattern of the lines. Unset, they're solid. */
  dashArray?: DataLayerDashArray;
  /** Ends of the lines and their dashes, and of the casing. Defaults to `round`. */
  cap?: DataLayerLineCap;
  /** Corners of the lines, and of the casing. Defaults to `round`. */
  join?: DataLayerLineJoin;
  /** Draws a casing along both sides of the lines. Defaults to `false`. */
  outline?: boolean;
  /** Colour of the casing. Defaults to `#FFFFFF`. */
  outlineColor?: string | ZoomStringValues | ExpressionSpecification;
  /** Width of the casing on each side of the line, in px. Defaults to `1`. */
  outlineWidth?: DataLayerNumber;
  /** Opacity of the casing. Defaults to `1`, faded with the layer. */
  outlineOpacity?: DataLayerNumber;
  /** Blur of the casing, in px. Defaults to `0`. */
  outlineBlur?: DataLayerNumber;
};

/** Options for {@link LineLayer}. */
export type LineLayerConstructorOptions = DataLayerConstructorOptions<LineLayerStyle> & {
  /** Required, as `color` is. */
  style: LineLayerStyle;
};
