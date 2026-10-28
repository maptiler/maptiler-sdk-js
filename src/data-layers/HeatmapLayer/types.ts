import type { ExpressionSpecification } from "maplibre-gl";
import type { ColorRamp } from "../../ColorRamp";
import type { PropertyValues, ZoomNumberValues } from "../../helpers/vectorlayerhelpers";
import type { DataLayerConstructorOptions } from "../DataLayer";

/** How a {@link HeatmapLayer} renders. It has the one mode. */
export type HeatmapLayerMode = "heatmap";

/**
 * Styling of a {@link HeatmapLayer} — the visual options of the `addHeatmap`
 * helper under the data layers' shared names (`color` for `colorRamp`), with
 * the same meaning and defaults.
 *
 * Numeric values also take a MapLibre expression, passed through as is.
 */
export type HeatmapLayerStyling = {
  /**
   * Colour ramp along the heatmap's density, from none (`0`) to the densest
   * (`1`). A ramp over another range is scaled to `[0, 1]`, and one without a
   * transparent start is given one, so empty areas show the map.
   *
   * Required for now: it will default to a ramp suiting the map style.
   */
  color: ColorRamp;
  /**
   * Property weighting each point. Unset `weight`, its value is the weight —
   * missing and negative values count as `0`. It also drives a `PropertyValues` `radius`.
   */
  property?: string;
  /**
   * Weight of each point: a fixed weight, `PropertyValues` mapping `property`
   * values to weights, or an expression. Unset, it's `property`'s value, or `1`.
   */
  weight?: number | PropertyValues | ExpressionSpecification;
  /**
   * Radius of each point's influence, in px: a fixed radius, a zoom ramp,
   * `PropertyValues` mapping `property` values to radii (scaled by zoom
   * unless `zoomCompensation` is off), or an expression. Unset, it grows with
   * the zoom, or is `10` without `zoomCompensation`.
   */
  radius?: number | ZoomNumberValues | PropertyValues | ExpressionSpecification;
  /** Opacity of the heatmap: a fixed value in [0, 1], a zoom ramp, or an expression. Defaults to `1`, faded at the edges of the layer's zoom range. */
  opacity?: number | ZoomNumberValues | ExpressionSpecification;
  /** Multiplier of the density: a fixed value, a zoom ramp, or an expression. Unset, it grows with the zoom, so the heatmap looks alike at every zoom. */
  intensity?: number | ZoomNumberValues | ExpressionSpecification;
  /** Whether the default and `PropertyValues` radii scale with the zoom. Defaults to `true`. */
  zoomCompensation?: boolean;
};

/** Options for {@link HeatmapLayer}. */
export type HeatmapLayerConstructorOptions = DataLayerConstructorOptions<HeatmapLayerStyling> & {
  /** Required, as `color` is. */
  styling: HeatmapLayerStyling;
};
