import type { ExpressionSpecification } from "maplibre-gl";
import type { PointLayerOptions } from "../../helpers/vectorlayerhelpers";
import type { CollisionBehaviour, MarkerStyle } from "../../Marker/types";
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
};

/** What happens where markers overlap. Only `always-show` for now: every marker shows, nearer ones drawn over further ones. */
export type PointLayerMarkersCollisionBehaviour = Extract<CollisionBehaviour, "always-show">;

export type PointLayerMarkersOptions = DataLayerConstructorOptions<PointLayerMarkersStyling> & {
  /** Renders points as MapTiler marker images. */
  mode: "markers";
  /** Defaults to `always-show`. */
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
  /** What happens where points overlap. Defaults to `always-show`. */
  collisionBehaviour?: PointLayerCollisionBehaviour<TMode>;
};

//#endregion
