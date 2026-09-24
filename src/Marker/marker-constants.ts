import type { MarkerOptions } from "maplibre-gl";
import type { EasingFunctionName } from "../MaptilerAnimation/types";
import type { EnterAnimationPreset, ExitAnimationPreset, IdleAnimationPreset, MapTilerMarkerBaseOptions, MapTilerMarkerElementProps, MapTilerMarkerUIStateName } from "./types";
import type { AdaptiveColorSet, AdaptiveStyleKey } from "./marker-adaptive-colors";

//#region Defaults

export const DEFAULT_SHAPE: NonNullable<MapTilerMarkerBaseOptions["shape"]> = "maptiler";
export const DEFAULT_SIZE: NonNullable<MapTilerMarkerBaseOptions["size"]> = "m";
export const DEFAULT_SHADOW: NonNullable<MapTilerMarkerBaseOptions["shadow"]> = "medium";
export const DEFAULT_OUTLINE_WIDTH = 2;

/** Anchor used when `MarkerOptions.anchor` is unset (matches MapLibre's own default). */
export const DEFAULT_ANCHOR: NonNullable<MarkerOptions["anchor"]> = "center";

/** Size a minimized marker renders at when `minimizedOptions.size` is unset. */
export const DEFAULT_MINIMIZED_SIZE: NonNullable<MapTilerMarkerBaseOptions["size"]> = "xs";

/** Duration (ms) of transitions and animations when their `duration` is omitted. */
export const DEFAULT_ANIMATION_DURATION_MS = 1000;

/**
 * Default proximity threshold in CSS px: two markers whose boxes come within
 * this distance of each other are "in proximity". Overlap always uses 0.
 */
export const DEFAULT_PROXIMITY_PADDING = 4;

/** Matches the fade duration in the SDK stylesheet (`.maptiler-marker-collision-fade`). */
export const COLLISION_FADE_DURATION_MS = 150;

//#endregion

//#region Lookup Tables

export const SIZE_PX: Record<NonNullable<MapTilerMarkerBaseOptions["size"]>, number> = {
  xs: 8,
  s: 24,
  m: 32,
  l: 40,
};

export const SHADOW_FILTER: Record<NonNullable<MapTilerMarkerBaseOptions["shadow"]>, string> = {
  none: "none",
  soft: "drop-shadow(0px 1px 0px rgba(0, 0, 0, 0.2))",
  medium: "drop-shadow(0px 2px 2px rgba(29, 29, 29, 0.2))",
  strong: "drop-shadow(0px 2px 4px rgba(29, 29, 29, 0.2))",
};

//#endregion

//#region Adaptive Colors

/**
 * Default marker colours per map style. `base` doubles as the fallback for
 * styles without a dedicated entry.
 */
export const ADAPTIVE_COLORS: { base: AdaptiveColorSet } & Partial<Record<AdaptiveStyleKey, AdaptiveColorSet>> = {
  base: { innerColor: "#4D7FFF", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  "base-dark": { innerColor: "#80A4FF", outerColor: "#292929", contentColor: "#292929", outlineColor: "transparent" },
  streets: { innerColor: "#0060E5", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  "streets-dark": { innerColor: "#4D97FF", outerColor: "#292929", contentColor: "#292929", outlineColor: "transparent" },
  hybrid: { innerColor: "#0073E5", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  dataviz: { innerColor: "#1A94FF", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  "dataviz-dark": { innerColor: "#4DACFF", outerColor: "#292929", contentColor: "#292929", outlineColor: "transparent" },
  topo: { innerColor: "#1A79FF", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
};

// colour props that fall back to a per-map-style default when unset
export const ADAPTIVE_COLOR_KEYS = ["outerColor", "innerColor", "contentColor", "outlineColor"] as const satisfies readonly (keyof AdaptiveColorSet)[];

//#endregion

//#region Option Keys

export const MAPLIBRE_MARKER_CONSTRUCTOR_OVERRIDES: MarkerOptions = {
  scale: 1, // scale in our class will be a 2D vector.
};

// props consumable as CSS custom properties on the minimized dot
export const CUSTOM_ELEMENT_MINIMIZED_KEYS = ["innerColor", "outerColor", "contentColor", "shadow", "opacity"] as const satisfies readonly (keyof MapTilerMarkerElementProps)[];

export const MAPTILER_BASE_OPTIONS_KEYS = [
  "shape",
  "size",
  "innerColor",
  "outerColor",
  "contentColor",
  "outline",
  "outlineColor",
  "shadow",
  "opacity",
  "opacityWhenCovered",
  "name",
  "title",
  "content",
  "htmlAttributes",
  "scale",
  "visible",
  "priority",
  "userData",
  "collisionBehaviour",
  "collisionRadius",
  "minimizedOptions",
  "rotation",
  "debug",
  "states",
  "transitions",
] as const;

/** Pending props that change a marker's footprint and therefore its collisions. */
export const FOOTPRINT_PROPS = ["shape", "size", "scale", "rotation"] as const;

export const UI_STATE_PRIORITY: readonly MapTilerMarkerUIStateName[] = ["hover", "focus", "active", "dragging"];

//#endregion

//#region Animation Presets

/** Vertical offset (CSS px) `enter`'s `drop`/`bounce` start from on `enter`. */
export const LIFECYCLE_LIFT_PX = 48;

/** Default easing per `enter` preset, used when `MarkerAnimationOptions.easing` doesn't override it. */
export const ENTER_PRESET_EASING: Record<EnterAnimationPreset, EasingFunctionName> = {
  fade: "Linear",
  grow: "CubicOut",
  pop: "ElasticOut",
  drop: "CubicOut",
  bounce: "BounceOut",
};

/** Default easing per `exit` preset, used when `MarkerAnimationOptions.easing` doesn't override it. */
export const EXIT_PRESET_EASING: Record<ExitAnimationPreset, EasingFunctionName> = {
  fade: "Linear",
  shrink: "CubicIn",
  pop: "ElasticIn",
  explode: "CubicOut",
};

/** Scale multiplier `explode` grows the marker to (from its own base scale) while it fades out. */
export const EXPLODE_SCALE_MULTIPLIER = 2;

export const PULSE_SCALE_PEAK = 1.15;
export const PULSE_OPACITY_PEAK = 0.45;
export const RING_PEAK_DEG = 12;
export const IDLE_BOUNCE_LIFT_PX = 14;

/**
 * Default loop duration (ms) per idle preset, used when
 * `MarkerIdleAnimationOptions.duration` is omitted — overrides the generic
 * `1000` documented on {@link MarkerAnimationOptions}. `pulsescale`/
 * `pulseopacity` default to ~1Hz; `ring`/`bounce` recur every few seconds.
 */
export const IDLE_PRESET_DEFAULT_DURATION: Record<IdleAnimationPreset, number> = {
  pulsescale: 1000,
  pulseopacity: 1000,
  ring: 3000,
  bounce: 3000,
};

//#endregion

//#region Layout

/** Design-space size (units) for SVG template glyphs. */
export const GLYPH_VIEWBOX_SIZE = 24;

/** Font size (viewBox units) of text content. */
export const TEXT_CONTENT_FONT_SIZE = 14;

/**
 * Minimum margin in CSS px around the viewport within which markers still
 * participate in the pass. Off-viewport markers are excluded and hidden, but
 * a marker just past the edge must keep blocking its on-screen neighbours,
 * or edge behaviour would churn while panning.
 */
export const VIEWPORT_CULL_MARGIN_PX = 200;

/**
 * Base z-index for camera-depth ordering among altitude-active markers (see
 * the altitude render loop's `onRender`). Well above the small integers
 * `priority` typically produces, so depth-ordered altitude markers land
 * above statically-ordered ones rather than interleaving with them —
 * "closer to the camera" is a different axis from "higher priority", and
 * mixing the two into one ranking isn't attempted here.
 */
export const ALTITUDE_Z_INDEX_BASE = 1000;

//#endregion

//#region DOM

export const SVG_NS = "http://www.w3.org/2000/svg";

export const DEBUG_COLOR = "#ff00ff";

export const CUSTOM_ELEMENT_CLASSNAME = "marker-transform-wrapper";
/** Added to every marker's wrapper element so marker text can pick up the SDK font. */
export const MARKER_FONT_CLASSNAME = "maptiler-sdk-marker-font";
export const SHAPE_SVG_CLASSNAME = "marker-shape";
export const DEFAULT_CONTENT_CLASSNAME = "marker-default-content";
export const MINIMIZED_DOT_CLASSNAME = "marker-minimized-dot";
export const COLLISION_FADE_CLASSNAME = "maptiler-marker-collision-fade";
export const COLLISION_HIDDEN_CLASSNAME = "maptiler-marker-collision-hidden";
export const COLLISION_CULLED_CLASSNAME = "maptiler-marker-collision-culled";
export const ALTITUDE_HIDDEN_CLASSNAME = "maptiler-marker-altitude-hidden";
export const ALTITUDE_OCCLUDED_CLASSNAME = "maptiler-marker-altitude-occluded";
export const GROUND_LINE_CLASSNAME = "maptiler-marker-groundline";

//#endregion
