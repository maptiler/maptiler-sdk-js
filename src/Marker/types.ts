import type { MarkerOptions } from "maplibre-gl";

//#region Primitives

/** Visual shape of the marker body. */
export type MapTilerMarkerShape = "rounded" | "circle" | "bubble-circle" | "bubble-square" | "square" | "bulb" | "squircle" | "shield";

/** T-shirt size for the marker. */
export type MapTilerMarkerSize = "xs" | "s" | "m" | "L" | "XL";

/** Drop-shadow intensity applied beneath the marker. */
export type MapTilerMarkerShadow = "soft" | "medium" | "strong";

/** Behaviour when this marker spatially overlaps another. */
export enum CollisionBehaviour {
  /** No collision detection — marker is always shown. */
  ALWAYS_SHOW = "ALWAYS_SHOW",
  /** Marker is hidden when it collides with a higher-priority marker. */
  HIDE_BY_PRIORITY = "HIDE_BY_PRIORITY",
  /** Marker is minimised to a simple point/circle when colliding with a higher-priority marker. */
  MINIMIZE_BY_PRIORITY = "MINIMIZE_BY_PRIORITY",
  /** Colliding markers are repositioned into a column at their average map position. */
  REPOSITION_COLUMN = "REPOSITION_COLUMN",
  /** Colliding markers are grouped at their average position and expand on hover/click. */
  CLUSTER = "CLUSTER",
}

export type Vector2 = [number, number];

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

/** Marker content driven by a built-in content-type identifier. */
export type MarkerContentByType = {
  /** Identifier for a built-in content type. */
  contentType: string;
  url?: never;
  template?: never;
  templateParams?: never;
  element?: never;
};

/** Marker content driven by an image or SVG URL. */
export type MarkerContentByUrl = {
  /** URL of an image or SVG to render as marker content. */
  url: string;
  contentType?: never;
  template?: never;
  templateParams?: never;
  element?: never;
};

/** Marker content driven by a named template and its parameters. */
export type MarkerContentByTemplate = {
  /** Identifier for a registered template factory function. */
  template: string;
  /** Parameters forwarded to the template config function. */
  templateParams?: Record<string, number | string>;
  contentType?: never;
  url?: never;
  element?: never;
};

/**
 * Marker content driven by an existing DOM or SVG element.
 * Useful when content is managed by a rendering engine such as React.
 */
export type MarkerContentByElement = {
  /** An HTML or SVG element to use as marker content. */
  element: HTMLElement | SVGElement;
  contentType?: never;
  url?: never;
  template?: never;
  templateParams?: never;
};

/** Marker with no explicit content — uses the default marker appearance. */
export type MarkerContentNone = {
  contentType?: never;
  url?: never;
  template?: never;
  templateParams?: never;
  element?: never;
};

export type MarkerContent = MarkerContentNone | MarkerContentByType | MarkerContentByUrl | MarkerContentByTemplate | MarkerContentByElement;

//#endregion

//#region Base Options

export type MapTilerMarkerBaseOptions = Omit<MarkerOptions, "scale" | "opacity" | "opacityWhenCovered"> & {
  /** Visual shape of the marker body. */
  shape?: MapTilerMarkerShape;
  /** Size of the marker. */
  size?: MapTilerMarkerSize;
  /** Fill colour of the inner area of the marker. */
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
   * Unique marker name. Must be safe for use as a CSS class name.
   * A UUID is generated automatically when omitted.
   */
  name?: string;

  title?: string;
  /** HTML attributes applied directly to the marker's root element. */
  htmlAttributes?: Record<string, number | string>;
  /** 2-D scale of the marker as `[x, y]`. Defaults to `[1, 1]`. */
  scale?: Vector2;
  /** Initial visibility of the marker. Defaults to `true`. */
  visible?: boolean;
  /** Rendering priority used for collision detection and clustering. Accepts a numeric value or a MapLibre-style expression. */
  priority?: number | unknown[];
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
  /**
   * Collision detection radius in pixels.
   * `0` means the marker's bounding box is used.
   */
  collisionRadius?: number;
};

//#endregion

//#region Derived Types

type MapTilerMarkerElementPropKeys =
  | "outerColor"
  | "innerColor"
  | "contentColor"
  | "outline"
  | "outlineColor"
  | "shadow"
  | "opacity"
  | "title"
  | "htmlAttributes"
  | "rotation"
  | "scale"
  | "size";

export type MapTilerMarkerElementProps = Pick<MapTilerMarkerBaseOptions, MapTilerMarkerElementPropKeys>;

export type MapTilerMarkerOptions = MapTilerMarkerBaseOptions & MarkerContent;

export type HTMLElementUpdateCue = Map<keyof MapTilerMarkerElementProps, MapTilerMarkerElementProps[keyof MapTilerMarkerElementProps]>;

//#endregion
