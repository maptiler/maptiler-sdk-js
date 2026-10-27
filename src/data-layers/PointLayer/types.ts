import type { ExpressionSpecification } from "maplibre-gl";
import type { PointLayerOptions } from "../../helpers/vectorlayerhelpers";
import type { CollisionBehaviour, MarkerMinimizedOptions, MarkerStyle } from "../../Marker/types";
import type { DataLayerConstructorOptions } from "../DataLayer";

/** How a {@link PointLayer} renders its points. Fixed at construction. */
export type PointLayerMode = "circles" | "markers";

//#region Circles

/**
 * Styling of a `circles` mode {@link PointLayer} — the visual options of the
 * `addPoint` helper, with the same meaning and defaults. Clustering is set
 * through `collisionBehaviour` instead.
 */
export type PointLayerCirclesStyling = Pick<
  PointLayerOptions,
  | "pointColor"
  | "pointRadius"
  | "minPointRadius"
  | "maxPointRadius"
  | "property"
  | "pointOpacity"
  | "alignOnViewport"
  | "showLabel"
  | "labelColor"
  | "labelSize"
  | "zoomCompensation"
  | "outline"
  | "outlineColor"
  | "outlineWidth"
  | "outlineOpacity"
>;

/**
 * What happens where points overlap. Circles never collide, so only
 * `always-show` (the default) and `cluster` apply.
 */
export type PointLayerCirclesCollisionBehaviour = Extract<CollisionBehaviour, "always-show"> | "cluster";

export type PointLayerCirclesOptions = DataLayerConstructorOptions<PointLayerCirclesStyling> & {
  /** Renders points as GL circles. The default mode. */
  mode?: "circles";
  /** `cluster` groups nearby points into sized, counted clusters. Defaults to `always-show`. */
  collisionBehaviour?: PointLayerCirclesCollisionBehaviour;
};

//#endregion

//#region Markers

/**
 * Styling of a `markers` mode {@link PointLayer}. Every point is drawn as a
 * MapTiler marker image, so markers and their labels are depth-sorted together.
 */
export type PointLayerMarkersStyling = {
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
 * - `always-show` (the default): every marker shows, nearer ones drawn over further ones.
 * - `hide-by-priority`: a marker overlapping a higher-priority one is hidden.
 * - `minimize-by-priority`: a marker overlapping a higher-priority one shrinks to a dot.
 * - `cluster`: nearby markers group into cluster markers showing their count.
 *
 * Collision is MapLibre's symbol collision, so markers also collide with the
 * style's labels and icons placed before them, and priority holds within a
 * tile rather than across the whole map.
 */
export type PointLayerMarkersCollisionBehaviour = CollisionBehaviour | "cluster";

export type PointLayerMarkersOptions = DataLayerConstructorOptions<PointLayerMarkersStyling> & {
  /** Renders points as MapTiler marker images. */
  mode: "markers";
  /** Defaults to `minimize-by-priority`. */
  collisionBehaviour?: PointLayerMarkersCollisionBehaviour;
};

//#endregion

//#region By Mode

/** Styling for each mode. */
export type PointLayerStyling<TMode extends PointLayerMode> = TMode extends "markers" ? PointLayerMarkersStyling : PointLayerCirclesStyling;

/** Collision behaviours for each mode. */
export type PointLayerCollisionBehaviour<TMode extends PointLayerMode> = TMode extends "markers" ? PointLayerMarkersCollisionBehaviour : PointLayerCirclesCollisionBehaviour;

/**
 * Options for {@link PointLayer}. `mode` picks the styling and collision
 * behaviours that apply — see {@link PointLayerCirclesOptions} and {@link PointLayerMarkersOptions}.
 */
export type PointLayerConstructorOptions<TMode extends PointLayerMode = "circles"> = DataLayerConstructorOptions<PointLayerStyling<TMode>> & {
  /** How points are rendered. Defaults to `circles`. */
  mode?: TMode;
  /** What happens where points overlap. Defaults to `minimize-by-priority` for markers, `always-show` for circles. */
  collisionBehaviour?: PointLayerCollisionBehaviour<TMode>;
};

//#endregion
