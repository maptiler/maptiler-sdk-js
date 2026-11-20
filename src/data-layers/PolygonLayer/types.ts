import type { DataLayerConstructorOptions } from "../DataLayer";
import type { DataLayerColor, DataLayerDash, DataLayerGlow, DataLayerLineCap, DataLayerLineJoin, DataLayerNumber, DataLayerOutline } from "../types";

/** How a {@link PolygonLayer} renders. It has the one mode for now. */
export type PolygonLayerMode = "fill";

/** A {@link PolygonLayer}'s outline: the shared outline values, plus where it sits on the edge and how it's dashed. */
export type PolygonLayerOutline = DataLayerOutline & {
  /** Where the outline sits on the edge: centred on it, or inside or outside the polygon. Defaults to `center`. */
  position?: "center" | "inside" | "outside";
  /** Dashes the outline — `true` for the default dashes. Defaults to `false`, solid. */
  dash?: DataLayerDash;
  /** Ends of the outline's dashes. Defaults to `butt`. */
  cap?: DataLayerLineCap;
  /** Corners of the outline. Defaults to `round`. */
  join?: DataLayerLineJoin;
};

/** Style keys of a {@link PolygonLayer} besides the colour and pattern. */
type PolygonLayerBaseStyle = {
  /** Property read by a `ColorRamp` `color`. */
  property?: string;
  /** Opacity of the fill: a fixed value in [0, 1], a zoom ramp, or an expression. Defaults to `1`, faded at the edges of the layer's zoom range. */
  opacity?: DataLayerNumber;
  /** A line along the polygons' edges, over the fill. Defaults to `false`. */
  outline?: boolean | PolygonLayerOutline;
  /**
   * A soft halo along the polygons' edges, beneath the fill — so it shows
   * outside them, `width` deep, and inside too where the fill is translucent.
   * Its colour defaults to the fill's. Defaults to `false`.
   */
  glow?: boolean | DataLayerGlow;
};

/**
 * Style of a {@link PolygonLayer} — the visual options of the `addPolygon`
 * helper under the data layers' shared names (`color` for `fillColor`,
 * `opacity` for `fillOpacity`), with the same meaning and defaults. The
 * outline and glow each turn on with `true`, or with an object of values over
 * their defaults.
 *
 * Needs `color`, or `pattern` in its place.
 *
 * @example
 * ```ts
 * { color: "#4f7cff", opacity: 0.6, outline: { position: "inside", dash: true }, glow: true }
 * ```
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
