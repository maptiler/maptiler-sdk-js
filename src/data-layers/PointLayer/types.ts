import type { ExpressionSpecification } from "maplibre-gl";
import type { ColorRamp } from "../../ColorRamp";
import type { ZoomNumberValues, ZoomStringValues } from "../../helpers/vectorlayerhelpers";
import type { CollisionBehaviour, MarkerMinimizedOptions, MarkerStyle } from "../../Marker/types";
import type { DataLayerConstructorOptions } from "../DataLayer";

/** How a {@link PointLayer} renders its points. Fixed at construction. */
export type PointLayerMode = "circles" | "markers";

//#region Circles

/**
 * Style of a `circles` mode {@link PointLayer} — the visual options of the
 * `addPoint` helper under the data layers' shared names (`color` for
 * `pointColor`, `radius` for `pointRadius`, …), with the same meaning and
 * defaults. Clustering is set through `collisionBehaviour` instead.
 *
 * Numeric values and `color` also take a MapLibre expression, passed through as is.
 */
export type PointLayerCirclesStyle = {
  /**
   * Colour of the points: a CSS colour, a `ColorRamp`, or an expression.
   * A `ColorRamp` is read at each point's `property` value, or at each
   * cluster's point count when clustering — without either, its lowest colour is used.
   *
   * Required for now: it will default to colours suiting the map style.
   */
  color: string | ColorRamp | ExpressionSpecification;
  /**
   * Radius of the points: a fixed size, a zoom ramp, or an expression. Unset,
   * it follows each cluster's point count when clustering, or each point's
   * `property` value when `color` is a `ColorRamp`, between `minRadius` and `maxRadius`.
   */
  radius?: number | ZoomNumberValues | ExpressionSpecification;
  /** Smallest radius of a data-driven or cluster radius. Defaults to `10`. */
  minRadius?: number;
  /** Largest radius of a data-driven or cluster radius. Defaults to `50`. */
  maxRadius?: number;
  /** Property driving the colour, radius and label of each point. Ignored when clustering, which uses the point count. */
  property?: string;
  /**
   * Opacity of the points: a fixed value in [0, 1], a zoom ramp, or an
   * expression. Unset, it follows the alpha of a `ColorRamp` `color`, or
   * fades in and out at the edges of the layer's zoom range.
   */
  opacity?: number | ZoomNumberValues | ExpressionSpecification;
  /** Whether points stay circles facing the viewer when the map is pitched, rather than lying flat on it. Defaults to `true`. */
  alignOnViewport?: boolean;
  /** Shows each point's `property` value, or each cluster's count, as a label. Defaults to `true` when clustering. */
  showLabel?: boolean;
  /** Colour of the labels. Defaults to `#fff`. */
  labelColor?: string;
  /** Font size of the labels, in px. Defaults to `12`. */
  labelSize?: number;
  /** Whether a fixed or data-driven radius scales with the zoom. Defaults to `true`. */
  zoomCompensation?: boolean;
  /** Draws an outline around each point. Defaults to `false`. */
  outline?: boolean;
  /** Colour of the outline: a fixed colour or a zoom ramp. Defaults to `#FFFFFF`. */
  outlineColor?: string | ZoomStringValues;
  /** Width of the outline, in px: a fixed width or a zoom ramp. Defaults to `1`. */
  outlineWidth?: number | ZoomNumberValues;
  /** Opacity of the outline: a fixed value or a zoom ramp. Defaults to `1`. */
  outlineOpacity?: number | ZoomNumberValues;
};

/**
 * What happens where points overlap. Circles never collide, so only
 * `always-show` (the default) and `cluster` apply.
 */
export type PointLayerCirclesCollisionBehaviour = Extract<CollisionBehaviour, "always-show"> | "cluster";

export type PointLayerCirclesOptions = DataLayerConstructorOptions<PointLayerCirclesStyle> & {
  /** Renders points as GL circles. The default mode. */
  mode?: "circles";
  /** Required, as `color` is. */
  style: PointLayerCirclesStyle;
  /** `cluster` groups nearby points into sized, counted clusters. Defaults to `always-show`. */
  collisionBehaviour?: PointLayerCirclesCollisionBehaviour;
};

//#endregion

//#region Markers

/**
 * Style of a `markers` mode {@link PointLayer}. Every point is drawn as a
 * MapTiler marker image, so markers and their labels are depth-sorted together.
 */
export type PointLayerMarkersStyle = {
  /** Look of every marker. Unset colours adapt to the map style, as on DOM markers. `content` is replaced by `label` when set. */
  marker?: MarkerStyle;
  /**
   * Text drawn inside each marker: a property name, or an expression that
   * evaluates to the text (e.g. `["number-format", ["get", "mag"], { "max-fraction-digits": 1 }]`).
   * Each distinct label becomes its own image, so keep the number of distinct values modest.
   */
  label?: string | ExpressionSpecification;
  /**
   * Which marker wins where markers overlap, under `hide-by-priority` and
   * `minimize-by-priority` — higher wins, as for DOM markers. A number, or an
   * expression evaluated per feature (e.g. `["get", "mag"]`). Unset, markers
   * are placed in data order.
   */
  priority?: number | ExpressionSpecification;
  /** Look of markers minimized by `minimize-by-priority`, over the marker's own style. Defaults to an `xs` dot in the marker's colours. */
  minimized?: MarkerMinimizedOptions;
  /** Look of cluster markers under `cluster`, which show their point count. Defaults to the marker's style. */
  clusterMarker?: MarkerStyle;
};

/**
 * What happens where markers overlap:
 * - `always-show`: every marker shows, nearer ones drawn over further ones.
 * - `hide-by-priority`: a marker overlapping a higher-priority one is hidden.
 * - `minimize-by-priority` (the default): a marker overlapping a higher-priority one shrinks to a dot.
 * - `cluster`: nearby markers group into cluster markers showing their count.
 *
 * Collision is MapLibre's symbol collision, so markers also collide with the
 * style's labels and icons placed before them, and priority holds within a
 * tile rather than across the whole map.
 */
export type PointLayerMarkersCollisionBehaviour = CollisionBehaviour | "cluster";

export type PointLayerMarkersOptions = DataLayerConstructorOptions<PointLayerMarkersStyle> & {
  /** Renders points as MapTiler marker images. */
  mode: "markers";
  /** Defaults to `minimize-by-priority`. */
  collisionBehaviour?: PointLayerMarkersCollisionBehaviour;
};

//#endregion

//#region By Mode

/** Style for each mode. */
export type PointLayerStyle<TMode extends PointLayerMode> = TMode extends "markers" ? PointLayerMarkersStyle : PointLayerCirclesStyle;

/** Collision behaviours for each mode. */
export type PointLayerCollisionBehaviour<TMode extends PointLayerMode> = TMode extends "markers" ? PointLayerMarkersCollisionBehaviour : PointLayerCirclesCollisionBehaviour;

/**
 * Options for {@link PointLayer}. `mode` picks the style and collision
 * behaviours that apply — see {@link PointLayerCirclesOptions} and {@link PointLayerMarkersOptions}.
 */
export type PointLayerConstructorOptions<TMode extends PointLayerMode = "circles"> = DataLayerConstructorOptions<PointLayerStyle<TMode>> & {
  /** How points are rendered. Defaults to `circles`. */
  mode?: TMode;
  /** What happens where points overlap. Defaults to `minimize-by-priority` for markers, `always-show` for circles. */
  collisionBehaviour?: PointLayerCollisionBehaviour<TMode>;
} & (TMode extends "markers" ? unknown : { style: PointLayerCirclesStyle });

//#endregion
