import type { ExpressionSpecification } from "maplibre-gl";
import type { PropertyValues, ZoomNumberValues } from "../../helpers/vectorlayerhelpers";
import type { DataLayerConstructorOptions } from "../DataLayer";
import type { DataLayerColor, DataLayerDash, DataLayerGlow, DataLayerLineCap, DataLayerLineJoin, DataLayerNumber, DataLayerOutline } from "../types";

/** How a {@link LineLayer} renders. It has the one mode for now. */
export type LineLayerMode = "line";

/**
 * Style of a {@link LineLayer} — the visual options of the `addPolyline`
 * helper under the data layers' shared names (`color` for `lineColor`,
 * `width` for `lineWidth`, …), with the same meaning and defaults. The
 * outline, glow and dashes each turn on with `true`, or with an object of
 * values over their defaults.
 *
 * @example
 * ```ts
 * { color: "#fff", width: 3, glow: true, outline: { color: "#000" }, dash: "dotted" }
 * ```
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
  /** Dashes the lines — `true` for the default dashes. Defaults to `false`, solid. */
  dash?: DataLayerDash;
  /** Ends of the lines and their dashes, and of the outline and glow. Defaults to `round`. */
  cap?: DataLayerLineCap;
  /** Corners of the lines, and of the outline and glow. Defaults to `round`. */
  join?: DataLayerLineJoin;
  /** Draws each line as two, either side of a gap this wide, in px. Defaults to `0`. The outline and glow don't account for it. */
  gapWidth?: DataLayerNumber;
  /**
   * A casing along both sides of the lines, beneath them — its `width` on
   * each side. It stays solid under dashes. Defaults to `false`.
   */
  outline?: boolean | DataLayerOutline;
  /** A soft halo around the lines, beneath them and their outline — its `width` on each side. Defaults to `false`. */
  glow?: boolean | DataLayerGlow;
};

/** Options for {@link LineLayer}. */
export type LineLayerConstructorOptions = DataLayerConstructorOptions<LineLayerStyle> & {
  /** Required, as `color` is. */
  style: LineLayerStyle;
};
