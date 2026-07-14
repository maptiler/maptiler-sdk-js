import type { MarkerOptions } from "maplibre-gl";
import type { AdaptiveColor, AdaptiveColorName } from "./marker-adaptive-colors";
import type { Marker } from "./Marker";

//#region Primitives

/** Visual shape of the marker body. */
export type MapTilerMarkerShape = "rounded" | "circle" | "bubble-circle" | "bubble-square" | "square" | "bulb" | "squircle" | "shield";

/** T-shirt size for the marker. */
export type MapTilerMarkerSize = "xs" | "s" | "m" | "l" | "xl";

/** Drop-shadow intensity applied beneath the marker. */
export type MapTilerMarkerShadow = "soft" | "medium" | "strong";

/** Behaviour when this marker spatially overlaps another. */
export const CollisionBehaviour = {
  /** No collision detection — marker is always shown. */
  ALWAYS_SHOW: "always-show",
  /** Marker is hidden when it collides with a higher-priority marker. */
  HIDE_BY_PRIORITY: "hide-by-priority",
  /** Marker is minimised to a simple point/circle when colliding with a higher-priority marker. */
  MINIMIZE_BY_PRIORITY: "minimize-by-priority",
  /** Colliding markers are repositioned into a column at their average map position. */
  REPOSITION_COLUMN: "reposition-column",
  /** Colliding markers are grouped at their average position and expand on hover/click. */
  CLUSTER: "cluster",
} as const;

export type CollisionBehaviour = (typeof CollisionBehaviour)[keyof typeof CollisionBehaviour];

export type Vector2 = [number, number];

/**
 * Kind of spatial collision between two markers.
 * - `overlap` — the markers' boxes intersect.
 * - `proximity` — the boxes are within the configured proximity padding
 *   (a superset of `overlap`).
 */
export type MarkerCollisionKind = "overlap" | "proximity";

/**
 * Payload of the `markeroverlap` / `markerproximity` events.
 *
 * Emitted on state change only: a marker fires when counterparts *enter* or
 * *exit* collision with it, never for collisions that persist unchanged
 * between passes.
 */
export type MarkerCollisionEventData = {
  kind: MarkerCollisionKind;
  /** Markers that started colliding with this marker in this pass. */
  entered: Marker[];
  /** Markers that stopped colliding with this marker in this pass (may already be removed from the map). */
  exited: Marker[];
  /** All markers currently colliding with this marker. */
  current: Marker[];
};

/**
 * Sets of mutually-colliding markers from the latest detection pass —
 * connected components of the pairwise collision graph, with no
 * winner/loser resolution applied.
 */
export type MarkerCollisionGroups = {
  overlap: Marker[][];
  proximity: Marker[][];
};

/**
 * MapLibre-style expression that resolves to a numeric priority.
 * Evaluated by the collision engine, not applied directly to the DOM.
 */
export type MarkerPriorityExpression = unknown[];

//#endregion

//#region Pending features

// Animation (Non MVP)

// /** Predefined animation preset names. Each preset ships with a default easing curve. */
// export type AnimationPreset = "grow" | "drop" | "emerge" | "pop" | "fade" | "draw";

// /**
//  * Configures a single animation stage for a marker lifecycle event.
//  * Accepts either a preset-based config object or an existing `MaptilerAnimation` instance.
//  */
// export type AnimationOptions =
//   | {
//       /** Predefined animation type. The preset also supplies a default easing function. */
//       preset: AnimationPreset;
//       /** Overrides the default easing function for the preset. */
//       easing?: (t: number) => number;
//       /** Duration in milliseconds. Defaults to 1000. */
//       duration?: number;
//       /** Delay before the animation starts in milliseconds. Defaults to 0. */
//       delay?: number;
//       /**
//        * When `true` the animation plays immediately on creation.
//        * When `false` and `delay` is set, playback waits `delay` ms after `play()` is called.
//        */
//       autoplay?: boolean;
//     }
//   | MaptilerAnimation;

// Transitions

// /** CSS transition config for interactive marker states. */
// export type MapTilerMarkerTransitions = {
//   /**
//    * CSS `transition` property value applied to the marker element
//    * (e.g. `'transform 0.3s ease, opacity 0.3s ease'`).
//    * A sensible default is used when omitted.
//    */
//   property?: string;
//   /** CSS properties applied while the cursor is over the marker. */
//   hover?: Record<string, string | number>;
//   /** CSS properties applied while the marker has keyboard focus. */
//   focus?: Record<string, string | number>;
//   /** CSS properties applied while the marker is being activated (e.g. mousedown). */
//   active?: Record<string, string | number>;
// };

//#endregion

//#region Content Variants

/**
 * Marker content driven by a built-in icon identifier.
 * TODO: icons are not implemented yet — this is a placeholder and renders nothing.
 */
export type MarkerContentTypeIcon = {
  /** Identifier for a built-in icon. */
  icon: string;
  url?: never;
  template?: never;
  templateParams?: never;
  element?: never;
};

/** Marker content driven by an image or SVG URL. */
export type MarkerContentTypeImageUrl = {
  /** URL of an image or SVG to render as marker content. */
  url: string;
  icon?: never;
  template?: never;
  templateParams?: never;
  element?: never;
};

/** Marker content driven by a named template and its parameters. */
export type MarkerContentTypeTemplate = {
  /** Identifier for a registered template factory function. */
  template: string;
  /** Parameters forwarded to the template config function. */
  templateParams?: Record<string, number | string>;
  icon?: never;
  url?: never;
  element?: never;
};

/**
 * Marker content driven by an existing DOM or SVG element.
 * Useful when content is managed by a rendering engine such as React.
 */
export type MarkerContentTypeElement = {
  /** An HTML or SVG element to use as marker content. */
  element: HTMLElement | SVGElement;
  icon?: never;
  url?: never;
  template?: never;
  templateParams?: never;
};

/** Marker with no explicit content — uses the default marker appearance. */
export type MarkerContentTypeNone = {
  icon?: never;
  url?: never;
  template?: never;
  templateParams?: never;
  element?: never;
};

export type MarkerContent = MarkerContentTypeNone | MarkerContentTypeIcon | MarkerContentTypeImageUrl | MarkerContentTypeTemplate | MarkerContentTypeElement;

//#endregion

//#region Base Options

// `color` is omitted from the MapLibre options because it styles the default
// pin (which we replace entirely) — we repurpose the key for adaptive colours
export type MapTilerMarkerBaseOptions = Omit<MarkerOptions, "scale" | "opacity" | "opacityWhenCovered" | "color"> & {
  /** Visual shape of the marker body. */
  shape?: MapTilerMarkerShape;
  /** Size of the marker. */
  size?: MapTilerMarkerSize;
  /**
   * Adaptive colour of the marker. Resolves the marker's inner (background)
   * colour against the current map style via the colour's `bgColors`, and
   * re-resolves whenever the map style changes.
   * Accepts a built-in palette name (`"blue"` | `"red"` | `"green"`) or a
   * custom {@link AdaptiveColor} definition.
   * An explicit `innerColor` takes precedence and disables adaptation.
   */
  color?: AdaptiveColorName | AdaptiveColor;
  /** Explicit fill colour of the inner area of the marker. Static — takes precedence over `color`. */
  innerColor?: string;
  /** Fill colour of the outer area (body/border) of the marker. */
  outerColor?: string;
  /** Colour applied to the marker content (icon, text, etc.). */
  contentColor?: string;
  /** Outline width in pixels. Pass `true` to use the default width. */
  outline?: true | number;
  /** Colour of the marker outline. */
  outlineColor?: string;
  /** Drop-shadow intensity. */
  shadow?: MapTilerMarkerShadow;
  opacity?: number;
  opacityWhenCovered?: number;
  /**
   * Optional marker name, added as a CSS class on the marker element.
   * Must be safe for use as a CSS class name.
   */
  name?: string;

  /** Applied to the `title` attribute of the marker's root element (native tooltip). */
  title?: string;
  /** Text content rendered inside the marker body. */
  content?: string;
  /** HTML attributes applied directly to the marker's root element. */
  htmlAttributes?: Record<string, number | string>;
  /** 2-D scale of the marker as `[x, y]`. Defaults to `[1, 1]`. */
  scale?: Vector2;
  /** Initial visibility of the marker. Defaults to `true`. TODO: not implemented yet. */
  visible?: boolean;
  /** Rendering priority used for collision detection and clustering. Accepts a numeric value or a MapLibre-style expression. */
  priority?: number | MarkerPriorityExpression;
  // /** Lifecycle animations. (Non MVP) Certain fields (e.g. `iterations`) are ignored for `enter` and `exit` animations. */
  // animations?: {
  //   /** Played when the marker is added to the map. Defaults to a subtle drop-in effect. */
  //   enter?: AnimationOptions[];
  //   /** Played when the marker is removed from the map. Defaults to a fade-out effect. */
  //   exit?: AnimationOptions[];
  //   /** Loops continuously while the marker is idle on the map. */
  //   idle?: AnimationOptions[];
  // };
  // /** CSS transitions for interactive marker states. */
  // transitions?: MapTilerMarkerTransitions;
  /** Arbitrary user-defined data attached to the marker instance. */
  userData?: Record<string, unknown>;
  /** Behaviour when this marker spatially overlaps another. */
  collisionBehaviour?: CollisionBehaviour;
  /** When `true`, renders a debug overlay showing the marker's bounding box and center point. */
  debug?: boolean;
  /**
   * Collision detection radius in pixels.
   * `0` means the marker's bounding box is used.
   */
  collisionRadius?: number;
};

//#endregion

//#region Derived Types

/**
 * Subset of {@link MapTilerMarkerBaseOptions} that applies when an external
 * DOM/SVG element is supplied as marker content.  SVG-only layout fields
 * (`shape`, `size`) are omitted because they only affect SVG generation.
 * Color/shadow options are retained — they are applied as CSS custom properties
 * on the supplied element and can be consumed by its styles.
 */
export type MapTilerMarkerBehaviourOptions = Omit<MapTilerMarkerBaseOptions, "shape" | "size">;

/** Options for a marker whose content is a pre-built DOM/SVG element. */
export type MapTilerMarkerElementOptions = MapTilerMarkerBehaviourOptions & MarkerContentTypeElement;

/** Options for a marker whose content is generated from the built-in SVG system. */
export type MapTilerMarkerSVGOptions = MapTilerMarkerBaseOptions & Exclude<MarkerContent, MarkerContentTypeElement>;

type MapTilerMarkerElementPropKeys =
  | "shape"
  | "color"
  | "outerColor"
  | "innerColor"
  | "contentColor"
  | "outline"
  | "outlineColor"
  | "shadow"
  | "opacity"
  | "title"
  | "content"
  | "htmlAttributes"
  | "rotation"
  | "scale"
  | "size"
  | "debug"
  | "priority";

export type MapTilerMarkerElementProps = Pick<MapTilerMarkerBaseOptions, MapTilerMarkerElementPropKeys>;

export type MapTilerMarkerOptions = MapTilerMarkerBaseOptions & MarkerContent;

/**
 * Batch of property updates waiting to be flushed to the DOM.
 * A key being present (even with an `undefined` value) means "apply this
 * property" — e.g. `{ shadow: undefined }` removes the shadow.
 */
export type PendingMarkerUpdates = Partial<MapTilerMarkerElementProps>;

//#endregion
