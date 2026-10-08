import type { PointLayerOptions } from "../../helpers/vectorlayerhelpers";
import type { CollisionBehaviour } from "../../Marker/types";
import type { DataLayerConstructorOptions } from "../DataLayer";

/** How a {@link PointLayer} renders its points. Fixed at construction. */
export type PointLayerMode = "circles";

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

/** Options for {@link PointLayer}, discriminated on `mode`. */
export type PointLayerConstructorOptions = PointLayerCirclesOptions;
