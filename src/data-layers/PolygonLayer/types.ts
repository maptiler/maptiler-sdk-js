import type { ExpressionSpecification } from "maplibre-gl";
import type { ZoomStringValues } from "../../helpers/vectorlayerhelpers";
import type { DataLayerConstructorOptions } from "../DataLayer";
import type { DataLayerColor, DataLayerDashArray, DataLayerLineCap, DataLayerLineJoin, DataLayerNumber } from "../types";

/** How a {@link PolygonLayer} renders. It has the one mode for now. */
export type PolygonLayerMode = "fill";

/** Style keys of a {@link PolygonLayer} besides the colour and pattern. */
type PolygonLayerBaseStyle = {
  /** Property read by a `ColorRamp` `color`. */
  property?: string;
  /** Opacity of the fill: a fixed value in [0, 1], a zoom ramp, or an expression. Defaults to `1`, faded at the edges of the layer's zoom range. */
  opacity?: DataLayerNumber;
  /** Draws an outline along the polygons' edges. Defaults to `false`. */
  outline?: boolean;
  /** Colour of the outline. Defaults to `#FFFFFF`. */
  outlineColor?: string | ZoomStringValues | ExpressionSpecification;
  /** Width of the outline, in px. Defaults to `1`. */
  outlineWidth?: DataLayerNumber;
  /** Opacity of the outline. Defaults to `1`, faded with the layer. */
  outlineOpacity?: DataLayerNumber;
  /** Blur of the outline, in px. Defaults to `0`. */
  outlineBlur?: DataLayerNumber;
  /** Where the outline sits on the edge: centred on it, or inside or outside the polygon. Defaults to `center`. */
  outlinePosition?: "center" | "inside" | "outside";
  /** Dash pattern of the outline. Unset, it's solid. */
  outlineDashArray?: DataLayerDashArray;
  /** Ends of the outline's dashes. Defaults to `butt`. */
  outlineCap?: DataLayerLineCap;
  /** Corners of the outline. Defaults to `round`. */
  outlineJoin?: DataLayerLineJoin;
};

/**
 * Style of a {@link PolygonLayer} — the visual options of the `addPolygon`
 * helper under the data layers' shared names (`color` for `fillColor`,
 * `opacity` for `fillOpacity`), with the same meaning and defaults.
 *
 * Needs `color`, or `pattern` in its place.
 */
export type PolygonLayerStyle = PolygonLayerBaseStyle &
  (
    | {
        /**
         * Colour of the polygons. Required unless `pattern` is set: it will
         * default to colours suiting the map style.
         */
        color: DataLayerColor;
        /**
         * URL of an image repeated across the polygons, in place of `color`.
         * It must be served with CORS. If it fails to load, `color` is used.
         */
        pattern?: string;
      }
    | {
        color?: DataLayerColor;
        pattern: string;
      }
  );

/** Options for {@link PolygonLayer}. */
export type PolygonLayerConstructorOptions = DataLayerConstructorOptions<PolygonLayerStyle> & {
  /** Required, as `color` (or `pattern`) is. */
  style: PolygonLayerStyle;
};
