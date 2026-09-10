import maplibregl from "maplibre-gl";
import type { LngLatLike, MarkerOptions, PointLike } from "maplibre-gl";
import type { mat4 } from "gl-matrix";
import type { Map as SDKMap } from "../Map";
import type {
  MapTilerMarkerElementProps,
  MapTilerMarkerElementOptions,
  MapTilerMarkerSVGOptions,
  PendingMarkerUpdates,
  Vector2,
  MapTilerMarkerOptions,
  MarkerCollisionEventData,
  MarkerCollisionDisplayState,
  MapTilerMarkerUIStateName,
  MapTilerMarkerUIStates,
  UIStateSpec,
  MarkerTransitionProperty,
  MapTilerMarkerTransitions,
  MarkerTransitionSpec,
  MarkerTransitionEventData,
  MapTilerMarkerAnimations,
  MarkerAnimationBase,
  MarkerAnimationOptions,
  MarkerCustomAnimationOptions,
  MarkerIdleAnimationOptions,
  EnterAnimationPreset,
  ExitAnimationPreset,
  IdleAnimationPreset,
  GroundLineOptions,
  AltitudeReference,
  SetAltitudeOptions,
} from "./types";
import { omit } from "../utils/object";
import { v4 as uuid } from "uuid";
import {
  applyCollisionCulled,
  applyCollisionHidden,
  applyAltitudeHidden,
  applyAltitudeOccluded,
  applyLifecycleLift,
  applyMarkerStyleVariables,
  applyMinimizedDot,
  createMarkerElement,
  updateMarkerElement,
  resolveMarkerWrapper,
  releaseCollisionFadeClass,
  COLLISION_FADE_DURATION_MS,
  GROUND_LINE_CLASSNAME,
} from "./marker-dom-utils";
import { DEFAULT_SHAPE, DEFAULT_SIZE, SHAPES, SIZE_PX, getShapeAnchorOffset } from "./marker-svg-config";
import { getAdaptiveBgColor, resolveAdaptiveColor } from "./marker-adaptive-colors";
import { MarkerManager } from "./MarkerManager";
import type { MarkerFootprint } from "./collision-helpers";
import { flattenUIStates } from "./marker-state-helpers";
import { computeAltitudeProjection } from "./altitude-math";
import {
  runPropertyTransition,
  scaleTransitionCodec,
  rotationTransitionCodec,
  colorTransitionCodec,
  positionTransitionCodec,
  lifecycleTransitionCodec,
  opacityTransitionCodec,
  type TransitionValueCodec,
} from "./marker-transitions";
import { MaptilerAnimation } from "../MaptilerAnimation";
import type { Keyframe } from "../MaptilerAnimation/types";
import {
  ENTER_PRESET_EASING,
  EXIT_PRESET_EASING,
  enterPresetHiddenValue,
  exitPresetHiddenValue,
  scaleLifecycleMagnitude,
  scaleIdleMagnitude,
  IDLE_PRESET_CONFIG,
  IDLE_PRESET_DEFAULT_DURATION,
  type LifecycleAnimationValue,
} from "./marker-animation-presets";
import {
  PendingUpdatesSymbol,
  DetachFromDOMSymbol,
  FlushDOMUpdatesSymbol,
  MarkerElementSymbol,
  RefreshAdaptiveColorSymbol,
  CollisionFootprintSymbol,
  EmitCollisionDiffSymbol,
  ApplyCollisionDisplayStateSymbol,
  ApplyAltitudeFrameSymbol,
  MeasuredElementSizeSymbol,
  ClearFocusStateSymbol,
} from "./marker-symbols";

const maplibreMarkerConstructorOverrides: MarkerOptions = {
  scale: 1, // scale in our class will be a 2D vector.
};

/** `PointLike` is a `Point` (from point-geometry) or a plain `[number, number]` — normalizes either to a tuple. */
function pointLikeToXY(point: PointLike): [number, number] {
  return Array.isArray(point) ? [point[0], point[1]] : [point.x, point.y];
}

// props consumable as CSS custom properties on the minimized dot
const CUSTOM_ELEMENT_MINIMIZED_KEYS = ["color", "innerColor", "outerColor", "contentColor", "shadow", "opacity"] as const satisfies readonly (keyof MapTilerMarkerElementProps)[];

const maptilerBaseOptionsKeys = [
  "shape",
  "size",
  "color",
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

/**
 * MapLibre's `Marker` extended with 2-D scale, named shapes, colour tokens,
 * and batched DOM updates — property changes defer to the next animation
 * frame so multiple changes in one tick cost only one layout pass.
 */
export class Marker extends maplibregl.Marker {
  /** Construction-time options snapshot — not updated by setters. */
  readonly options: MapTilerMarkerOptions;
  readonly _scale = 1; // MapLibre only scales in 1D; ours is 2D via `props.scale`, so this is unused.

  //#region Marker Properties

  /** Current values of all element-affecting properties. Written only via {@link setProp}. */
  private readonly props: MapTilerMarkerElementProps;

  /** Whether the shape anchor offset is auto-managed — `false` with an explicit `offset` or custom `element`. */
  private readonly managesOffset: boolean;

  /** The DOM element **/
  [MarkerElementSymbol]: HTMLElement;

  /** Property updates waiting to be flushed to the DOM on the next animation frame. */
  [PendingUpdatesSymbol]: PendingMarkerUpdates = {};

  /** Unscaled CSS pixel size of a custom `element`, measured once at registration. `null` until measured; unused for built-in SVG markers. */
  [MeasuredElementSizeSymbol]: Vector2 | null = null;

  /** UUID that uniquely identifies this marker instance. */
  public readonly id = uuid();

  /** How the collision engine is currently displaying this marker. */
  private collisionDisplayState: MarkerCollisionDisplayState = "visible";

  /** Visual props overridden while minimized, restored from {@link props} on un-minimize. Empty when not minimized. */
  private minimizedKeys: (keyof PendingMarkerUpdates)[] = [];

  /** Whether the minimized appearance is currently applied to the DOM. Lags {@link collisionDisplayState} during fades. */
  private minimizedApplied = false;

  /** Pending mid-fade appearance swap for minimize transitions. */
  private minimizeSwapTimer: ReturnType<typeof setTimeout> | null = null;

  /** Pending post-fade cull (`display: none`) while hidden. */
  private cullTimer: ReturnType<typeof setTimeout> | null = null;

  /** Pending release of the collision fade class once no fade/dip is in flight. */
  private fadeClassReleaseTimer: ReturnType<typeof setTimeout> | null = null;

  /** Registered property overrides per UI state, keyed by state name. */
  private uiStates: MapTilerMarkerUIStates;

  /** UI states currently active (interaction-driven). */
  private readonly activeUIStates = new Set<MapTilerMarkerUIStateName>();

  /** Keys owned by the flattened active UI state, masked out of DOM flushes like {@link minimizedKeys}. */
  private appliedUIStateKeys: (keyof PendingMarkerUpdates)[] = [];

  /** Registered per-property transition config, keyed by property name. */
  private transitions: MapTilerMarkerTransitions;

  /** In-flight transitions, keyed by property — at most one each. `"opacity"` isn't a public {@link MarkerTransitionProperty}, reused for enter/exit fades. */
  private readonly activeTransitions = new Map<MarkerTransitionProperty | "opacity", MaptilerAnimation>();

  /** The currently-looping `idle` animation, if any — started after `enter` finishes (or immediately), stopped on `remove()`. */
  private idleAnimation: MaptilerAnimation | null = null;

  /** Configured enter/idle/exit lifecycle animations. */
  private animations: MapTilerMarkerAnimations;

  /** Set during `addTo()`'s call into the base `addTo()`, which calls `this.remove()` first to detach from any previous map. */
  private suppressLifecycleAnimations = false;

  /** Altitude in meters, faked via a per-frame pixel offset (MapLibre's Marker has no native Z). 0 by default — see {@link setAltitude}. */
  private altitudeMeters = 0;

  /** What {@link altitudeMeters} is measured from — see {@link AltitudeReference}. */
  private altitudeReference: AltitudeReference = "ground";

  /** True once {@link setAltitude} has been called at least once — see {@link hasActiveAltitude}. */
  private altitudeEngaged = false;

  /** The offset MapLibre would show with no altitude applied. Only {@link writeOffset} should write the real offset — anything that calls `super.setOffset` directly clobbers altitude. */
  private baseOffset: PointLike = [0, 0];

  /** Pixel delta from `groundBase` to `elevated`, added to {@link baseOffset}. Null when off-screen/behind camera. */
  private altitudeDelta: { x: number; y: number } | null = null;

  /** The `elevated` point in absolute canvas CSS pixels — the ground line's position. */
  private groundLineOrigin: { x: number; y: number } | null = null;

  /** True when off-screen/behind the camera. Not the below-ground case — see {@link altitudeOccluded}. */
  private altitudeHidden = false;

  /** True when below ground (`computeAltitudeProjection`'s `belowGround`). */
  private altitudeOccluded = false;

  private groundLineEnabled = false;
  private groundLineOptions: GroundLineOptions = {};
  private groundLineEl: HTMLDivElement | null = null;

  //#endregion

  //#region Constructor

  /**
   * Creates a marker from a pre-built DOM or SVG element.
   *
   * `shape`/`size` don't apply. Color/shadow options still apply as CSS
   * custom properties for the element's own styles to consume.
   *
   * TODO: this will affect collision behaviour.
   */
  constructor(options: MapTilerMarkerElementOptions);
  /** Creates a marker styled via the built-in SVG system (`shape`, `size`, colour tokens, shadow). */
  constructor(options: MapTilerMarkerSVGOptions);
  constructor(options: MapTilerMarkerOptions) {
    const sizeKey = options.size ?? DEFAULT_SIZE;
    const superOptions = {
      ...omit(options, maptilerBaseOptionsKeys),
      // custom-element markers get no automatic offset — their geometry is unknown
      offset: options.offset ?? (options.element ? undefined : getShapeAnchorOffset(options.shape ?? DEFAULT_SHAPE, sizeKey)),
    } as MarkerOptions;

    const element = options.element ?? createMarkerElement(options);

    super({
      element,
      ...superOptions,
      ...maplibreMarkerConstructorOverrides,
    });

    this[MarkerElementSymbol] = element;
    this.baseOffset = superOptions.offset ?? [0, 0];

    // custom elements skip createMarkerElement, so seed their style variables here
    if (options.element) applyMarkerStyleVariables(options.element, options);

    // Mask the outer element immediately when an `enter` animation is
    // configured — avoids a one-frame flash before the animation's first
    // tick. Cleared by whichever enter animation runs (see
    // playLifecycleTransition / playCustomLifecycleAnimation).
    if (options.animations?.enter) {
      element.style.opacity = "0";
    }

    this.managesOffset = !options.offset && !options.element;

    this.props = {
      shape: options.shape,
      size: options.size,
      scale: Array.from(options.scale ?? [1, 1]) as Vector2,
      shadow: options.shadow,
      color: options.color,
      outerColor: options.outerColor,
      innerColor: options.innerColor,
      contentColor: options.contentColor,
      outlineColor: options.outlineColor,
      outline: options.outline,
      opacity: options.opacity,
      title: options.title,
      content: options.content,
      htmlAttributes: options.htmlAttributes,
      rotation: options.rotation,
      debug: options.debug,
      priority: options.priority,
    };

    if (typeof options.priority === "number") element.style.zIndex = String(options.priority);

    this.options = options;
    this.uiStates = { ...options.states };
    this.transitions = { ...options.transitions };
    this.animations = { ...options.animations };
    this.attachUIStateListeners();
  }

  //#endregion

  //#region Internal

  /**
   * Adds the marker to a map, and plays the configured `enter` animation (if any) once attached.
   * @param map - Target map instance.
   */
  addTo(map: SDKMap): this {
    // suppress the exit animation for addTo()'s own internal remove() call
    this.suppressLifecycleAnimations = true;
    super.addTo(map);
    this.suppressLifecycleAnimations = false;

    const enterSpec = this.animations.enter;
    const idleSpec = this.animations.idle;

    if (enterSpec) {
      this.playEnterAnimation(enterSpec, () => {
        if (idleSpec) this.startIdleAnimation(idleSpec);
      });
    } else if (idleSpec) {
      this.startIdleAnimation(idleSpec);
    }

    return this;
  }

  /** Recomputes the shape anchor offset so the shape's tip stays on the lngLat. No-op with an explicit `offset` or custom `element`. */
  private applyShapeAnchorOffset(): void {
    if (!this.managesOffset) return;
    if (this.minimizedApplied) return;
    this.setOffset(getShapeAnchorOffset(this.props.shape ?? DEFAULT_SHAPE, this.props.size ?? DEFAULT_SIZE));
  }

  /**
   * Records a property's new value and schedules a DOM flush on the next
   * animation frame via {@link MarkerManager}.
   * @param prop - The element property to update.
   * @param value - The new value for the property.
   */
  private setProp<K extends keyof MapTilerMarkerElementProps>(prop: K, value: MapTilerMarkerElementProps[K]): void {
    this.props[prop] = value;
    this[PendingUpdatesSymbol][prop] = value;
    MarkerManager.addMarkerUpdateToQueue(this);
  }

  /**
   * Applies all pending property updates to the marker element and clears
   * the batch. Called by {@link MarkerManager} on the next animation frame.
   */
  [FlushDOMUpdatesSymbol](): void {
    const raw = this[PendingUpdatesSymbol];
    this[PendingUpdatesSymbol] = {};
    const maskedKeys = [...(this.minimizedApplied ? this.minimizedKeys : []), ...this.appliedUIStateKeys];
    const pending: PendingMarkerUpdates = maskedKeys.length > 0 ? omit(raw, maskedKeys) : raw;
    if (Object.keys(pending).length === 0) return;
    updateMarkerElement(this[MarkerElementSymbol], pending, this.getCurrentStyleId());
  }

  /** Returns the style id of the map this marker is on, or `undefined` when detached. */
  private getCurrentStyleId(): string | undefined {
    const map = MarkerManager.getMap(this);
    return map ? MarkerManager.getMapStyleId(map) : undefined;
  }

  /** Queues re-resolving the adaptive `color` against the current map style. */
  [RefreshAdaptiveColorSymbol](): void {
    if (this.props.color === undefined || this.props.innerColor !== undefined) return;
    this.setProp("color", this.props.color);
  }

  //#endregion

  //#region Collision

  /** Resolves the marker's screen footprint for collision detection. Always full-size, even minimized. */
  [CollisionFootprintSymbol](): MarkerFootprint {
    const [sx, sy] = this.props.scale ?? [1, 1];
    const shared = {
      rotation: this.props.rotation ?? 0,
      mapAligned: this.getRotationAlignment() === "map",
    };

    // explicit radius: centred square on the anchor, unrotated
    const radius = this.options.collisionRadius;
    if (radius && radius > 0) {
      return { width: radius * 2, height: radius * 2, anchor: "center", offset: this.footprintOffset(), ...shared, pivot: [0, 0] };
    }

    const anchor = this.options.anchor ?? "center";

    // custom element: measured size, CSS default transform-origin
    if (this.options.element) {
      const [w, h] = this[MeasuredElementSizeSymbol] ?? [0, 0];
      return { width: w * sx, height: h * sy, anchor, offset: this.footprintOffset(), ...shared, pivot: [0, 0] };
    }

    // built-in SVG: height from size key, width from shape aspect ratio
    const { shape: shapeKey, size } = this.effectiveShapeAndSize(false);
    const heightPx = SIZE_PX[size];
    const shape = SHAPES[shapeKey];
    const widthPx = size === "xs" ? heightPx : heightPx * (shape.viewBox[0] / shape.viewBox[1]);
    const height = heightPx * sy;
    // bottom-anchored shapes rotate around their tip
    const pivot: Vector2 = shape.anchor === "center" ? [0, 0] : [0, height / 2];
    return { width: widthPx * sx, height, anchor, offset: this.footprintOffset(), ...shared, pivot };
  }

  /** Shape/size keys, or minimized substitutes. */
  private effectiveShapeAndSize(minimized: boolean): { shape: NonNullable<MapTilerMarkerOptions["shape"]>; size: NonNullable<MapTilerMarkerOptions["size"]> } {
    const shape = this.props.shape ?? DEFAULT_SHAPE;
    const size = this.props.size ?? DEFAULT_SIZE;
    if (!minimized) return { shape, size };
    const overrides = this.options.minimizedOptions;
    return { shape: overrides?.shape ?? shape, size: overrides?.size ?? "xs" };
  }

  /** Screen offset for the collision footprint. */
  private footprintOffset(): Vector2 {
    if (this.managesOffset) {
      const { shape, size } = this.effectiveShapeAndSize(false);
      return getShapeAnchorOffset(shape, size);
    }
    const offset = this.getOffset();
    return [offset.x, offset.y];
  }

  /** Fires the collision transition event (`markeroverlap`/`markerproximity`). */
  [EmitCollisionDiffSymbol](data: MarkerCollisionEventData): void {
    this.fire(data.kind === "overlap" ? "markeroverlap" : "markerproximity", data);
  }

  /**
   * Applies the collision engine's display-state decision.
   *
   * Every transition fades. Hide/show fade in place; visible<->minimized
   * fades *through* zero (dip out, swap at the invisible midpoint, fade back in).
   */
  [ApplyCollisionDisplayStateSymbol](state: MarkerCollisionDisplayState): void {
    if (state === this.collisionDisplayState) return;
    const previous = this.collisionDisplayState;
    this.collisionDisplayState = state;

    if (this.minimizeSwapTimer !== null) {
      clearTimeout(this.minimizeSwapTimer);
      this.minimizeSwapTimer = null;
    }
    if (this.cullTimer !== null) {
      clearTimeout(this.cullTimer);
      this.cullTimer = null;
    }

    const element = this.getElement();

    if (state === "hidden") {
      // fade out, then display:none once faded
      this.setCollisionHidden(true);
      this.cullTimer = setTimeout(() => {
        this.cullTimer = null;
        applyCollisionCulled(this.getElement(), true);
      }, this.collisionTransitionMs());
      return;
    }

    const wantMinimized = state === "minimized";

    if (previous === "hidden") {
      // re-enter rendering, swap appearance while invisible, then fade in
      applyCollisionCulled(element, false);
      this.setMinimizedApplied(wantMinimized);
      this.setCollisionHidden(false);
      return;
    }

    if (this.minimizedApplied === wantMinimized) {
      // nothing to swap — just fade back
      this.setCollisionHidden(false);
      return;
    }

    // visible <-> minimized: fade through zero
    this.setCollisionHidden(true);
    this.minimizeSwapTimer = setTimeout(() => {
      this.minimizeSwapTimer = null;
      this.setMinimizedApplied(wantMinimized);
      this.setCollisionHidden(false);
    }, this.collisionTransitionMs());
  }

  /** Toggles the collision-hidden fade and reschedules releasing the fade class — see {@link fadeClassReleaseTimer}. */
  private setCollisionHidden(hidden: boolean): void {
    applyCollisionHidden(this.getElement(), hidden);
    if (this.fadeClassReleaseTimer !== null) clearTimeout(this.fadeClassReleaseTimer);
    this.fadeClassReleaseTimer = setTimeout(() => {
      this.fadeClassReleaseTimer = null;
      releaseCollisionFadeClass(this.getElement());
    }, this.collisionTransitionMs());
  }

  /** The fade duration (ms) configured for this marker's map, or the SDK default when off a map. */
  private collisionTransitionMs(): number {
    const map = MarkerManager.getMap(this);
    return map ? MarkerManager.getCollisionTransitionDuration(map) : COLLISION_FADE_DURATION_MS;
  }

  /** Applies or restores the minimized appearance if it differs from what the DOM shows. */
  private setMinimizedApplied(applied: boolean): void {
    if (this.minimizedApplied === applied) return;
    this.minimizedApplied = applied;
    this.applyMinimizedAppearance(applied);
  }

  /** Returns how the collision engine is currently displaying this marker. */
  getCollisionDisplayState(): MarkerCollisionDisplayState {
    return this.collisionDisplayState;
  }

  /** The visual props the minimized appearance overrides for this marker. */
  private minimizedOverrides(): PendingMarkerUpdates {
    const overrides = this.options.minimizedOptions ?? {};
    if (!this.options.element) return { size: "xs", ...overrides };

    const updates: Record<string, unknown> = {};
    for (const key of CUSTOM_ELEMENT_MINIMIZED_KEYS) {
      if (key in overrides) updates[key] = overrides[key];
    }
    return updates as PendingMarkerUpdates;
  }

  /** Applies or restores the minimized appearance, straight to the DOM (never {@link setProp}). */
  private applyMinimizedAppearance(enabled: boolean): void {
    const styleId = this.getCurrentStyleId();

    if (enabled) {
      const overrides = this.minimizedOverrides();
      this.minimizedKeys = Object.keys(overrides) as (keyof PendingMarkerUpdates)[];
      if (this.options.element) applyMinimizedDot(this.options.element, this.options.anchor ?? "center", true);
      if (this.minimizedKeys.length > 0) updateMarkerElement(this[MarkerElementSymbol], overrides, styleId);
      if (this.managesOffset) {
        const { shape, size } = this.effectiveShapeAndSize(true);
        // writeOffset, not super.setOffset
        this.writeOffset(getShapeAnchorOffset(shape, size));
      }
      return;
    }

    const restore = this.restoreUpdates(this.minimizedKeys);
    this.minimizedKeys = [];
    if (this.options.element) applyMinimizedDot(this.options.element, this.options.anchor ?? "center", false);
    if (Object.keys(restore).length > 0) updateMarkerElement(this[MarkerElementSymbol], restore, styleId);
    if (this.managesOffset) {
      this.writeOffset(getShapeAnchorOffset(this.props.shape ?? DEFAULT_SHAPE, this.props.size ?? DEFAULT_SIZE));
    }
  }

  /** Builds the batch restoring `keys` to their prop values. */
  private restoreUpdates(keys: readonly (keyof PendingMarkerUpdates)[]): PendingMarkerUpdates {
    const updates: Record<string, unknown> = {};
    for (const key of keys) {
      if (key === "color" || key === "innerColor") continue;
      updates[key] = this.props[key];
    }
    if (keys.includes("color") || keys.includes("innerColor")) {
      if (this.props.innerColor !== undefined) updates.innerColor = this.props.innerColor;
      else updates.color = this.props.color;
    }
    return updates as PendingMarkerUpdates;
  }

  /**
   * Sets the marker's geographical position.
   * @param lnglat - The new position.
   */
  override setLngLat(lnglat: LngLatLike): this {
    const target = maplibregl.LngLat.convert(lnglat);
    this.applyTransitionable("position", this.getLngLat(), target, positionTransitionCodec, (v) => {
      super.setLngLat(v);
      const map = MarkerManager.getMap(this);
      if (map) MarkerManager.invalidateCollisions(map);
    });
    return this;
  }

  /**
   * Sets the marker's screen-space pixel offset. Composes with altitude (see {@link writeOffset}) rather than replacing it.
   * @param offset - Offset in pixels (+y down).
   */
  override setOffset(offset: PointLike): this {
    this.writeOffset(offset);
    const map = MarkerManager.getMap(this);
    if (map) MarkerManager.invalidateCollisions(map);
    return this;
  }

  /** The only path that should write MapLibre's real offset: records `offset` as {@link baseOffset}, then writes `base + altitudeDelta`. Callers must never use `super.setOffset` directly, or altitude gets silently dropped. */
  private writeOffset(offset: PointLike): void {
    this.baseOffset = offset;
    const [baseX, baseY] = pointLikeToXY(offset);
    const dx = this.altitudeDelta?.x ?? 0;
    const dy = this.altitudeDelta?.y ?? 0;
    super.setOffset([baseX + dx, baseY + dy]);
  }

  //#endregion

  //#region Getters & Setters

  //#region Scale

  /**
   * Sets the 2-D scale of the marker as `[x, y]`.
   * @param scaleVector - Scale factors for the x and y axes.
   */
  setScale(scaleVector: Vector2) {
    this.applyTransitionable<Vector2>("scale", this.props.scale ?? [1, 1], scaleVector, scaleTransitionCodec, (v) => {
      this.setProp("scale", v);
    });
  }

  /** Returns the current 2-D scale. Defaults to `[1, 1]`. */
  getScale() {
    return this.props.scale;
  }

  //#endregion

  //#region Shape

  /**
   * Sets the marker shape, rebuilding the SVG in place and migrating
   * current content (title/image/element) to the new geometry. No visible
   * effect on custom `element` markers, or at size `xs` (dot has no shape
   * — applies once size next changes).
   * @param shape - Shape key (`rounded` | `circle` | `bubble-circle` | `bubble-square` | `square` | `bulb` | `squircle` | `shield`).
   */
  setShape(shape: MapTilerMarkerOptions["shape"]) {
    this.setProp("shape", shape);
    this.applyShapeAnchorOffset();
  }

  /** Returns the current shape, or `undefined` if never set. */
  getShape() {
    return this.props.shape;
  }

  //#endregion

  //#region Size

  /**
   * Sets the marker size.
   * @param size - T-shirt size key (`xs` | `s` | `m` | `l` | `xl`).
   */
  setSize(size: MapTilerMarkerOptions["size"]) {
    this.setProp("size", size);
    this.applyShapeAnchorOffset();
  }

  /** Returns the current size, or `undefined` if never explicitly set. */
  getSize() {
    return this.props.size;
  }

  //#endregion

  //#region Shadow

  /**
   * Sets the drop-shadow intensity.
   * @param shadow - Shadow preset (`soft` | `medium` | `strong`), or
   *   `undefined` to remove the shadow.
   */
  setShadow(shadow: MapTilerMarkerOptions["shadow"]) {
    this.setProp("shadow", shadow);
  }

  /** Returns the current shadow preset, or `undefined` if none is set. */
  getShadow() {
    return this.props.shadow;
  }

  //#endregion

  //#region Outer Color

  /**
   * Sets the fill colour of the outer body of the marker.
   * @param color - Any valid CSS colour string.
   */
  setOuterColor(color: MapTilerMarkerOptions["outerColor"]) {
    this.applyTransitionable("outerColor", this.props.outerColor, color, colorTransitionCodec, (v) => {
      this.setProp("outerColor", v);
    });
  }

  /** Returns the current outer body colour. */
  getOuterColor() {
    return this.props.outerColor;
  }

  //#endregion

  //#region Adaptive Color

  /**
   * Sets the adaptive colour of the marker, resolved against the current map style.
   * @param color - Built-in palette name (`"blue"` | `"red"` | `"green"`), a
   *   custom `AdaptiveColor` definition, or `undefined` to remove.
   */
  setColor(color: MapTilerMarkerOptions["color"]) {
    this.props.innerColor = undefined;
    delete this[PendingUpdatesSymbol].innerColor;
    this.setProp("color", color);
  }

  /** Returns the current adaptive colour (name or definition), or `undefined` if none is set. */
  getColor() {
    return this.props.color;
  }

  //#endregion

  //#region Inner Color

  /**
   * Sets an explicit fill colour for the inner area of the marker, taking
   * precedence over the adaptive `color`.
   * @param color - Any valid CSS colour string.
   */
  setInnerColor(color: MapTilerMarkerOptions["innerColor"]) {
    if (color === undefined && this.props.color !== undefined) {
      this.props.innerColor = undefined;
      this.setProp("color", this.props.color);
      return;
    }
    this.applyTransitionable("innerColor", this.props.innerColor, color, colorTransitionCodec, (v) => {
      this.setProp("innerColor", v);
    });
  }

  /** Returns the inner area colour currently in effect. */
  getInnerColor() {
    if (this.props.innerColor !== undefined) return this.props.innerColor;
    if (this.props.color !== undefined) {
      const adaptive = resolveAdaptiveColor(this.props.color);
      if (adaptive) return getAdaptiveBgColor(adaptive, this.getCurrentStyleId() ?? "");
    }
    return undefined;
  }

  //#endregion

  //#region Content Color

  /**
   * Sets the colour applied to the marker content (icon, text, etc.).
   * @param color - Any valid CSS colour string.
   */
  setContentColor(color: MapTilerMarkerOptions["contentColor"]) {
    this.applyTransitionable("contentColor", this.props.contentColor, color, colorTransitionCodec, (v) => {
      this.setProp("contentColor", v);
    });
  }

  /** Returns the current content colour. */
  getContentColor() {
    return this.props.contentColor;
  }

  //#endregion

  //#region Outline Color

  /**
   * Sets the stroke colour of the marker outline.
   * Has no visible effect unless {@link setOutline} is also called.
   * @param color - Any valid CSS colour string.
   */
  setOutlineColor(color: MapTilerMarkerOptions["outlineColor"]) {
    this.applyTransitionable("outlineColor", this.props.outlineColor, color, colorTransitionCodec, (v) => {
      this.setProp("outlineColor", v);
    });
  }

  /** Returns the current outline stroke colour. */
  getOutlineColor() {
    return this.props.outlineColor;
  }

  //#endregion

  //#region Outline

  /**
   * Sets the outline stroke width on the marker body.
   * @param outline - `true` for the default width, a positive `number` for an
   *   explicit pixel width, or `undefined` to remove the outline.
   */
  setOutline(outline: MapTilerMarkerOptions["outline"]) {
    this.setProp("outline", outline);
  }

  /** Returns the current outline value (`true`, a pixel width, or `undefined`). */
  getOutline() {
    return this.props.outline;
  }

  //#endregion

  //#region Title

  /**
   * Sets the `title` attribute on the marker's root element (native tooltip).
   * @param title - Tooltip string, or `undefined` to remove the attribute.
   */
  setTitle(title: MapTilerMarkerOptions["title"]) {
    this.setProp("title", title);
  }

  /** Returns the current title string. */
  getTitle() {
    return this.props.title;
  }

  //#endregion

  //#region Content

  /**
   * Sets the text content displayed inside the marker body.
   * @param content - Label string, or `undefined` to clear.
   */
  setContent(content: MapTilerMarkerOptions["content"]) {
    this.setProp("content", content);
  }

  /** Returns the current content string. */
  getContent() {
    return this.props.content;
  }

  //#endregion

  //#region Priority

  /**
   * Sets the rendering priority.
   * @param priority - Numeric priority, a MapLibre-style expression, or
   *   `undefined` to restore DOM-order stacking.
   */
  setPriority(priority: MapTilerMarkerOptions["priority"]) {
    this.setProp("priority", priority);
  }

  /** Returns the current rendering priority, or `undefined` if never set. */
  getPriority() {
    return this.props.priority;
  }

  //#endregion

  //#region Debug

  /**
   * Shows or hides the debug overlay, which renders the marker's bounding
   * box and center point on top of the marker element.
   * @param debug - `true` to show the overlay, `false`/`undefined` to hide it.
   */
  setDebug(debug: MapTilerMarkerOptions["debug"]) {
    this.setProp("debug", debug);
  }

  /** Returns whether the debug overlay is currently enabled. */
  getDebug() {
    return this.props.debug ?? false;
  }

  //#endregion

  //#region Rotation

  /**
   * Rotates the marker's inner shell element in degrees, via the CSS
   * `scale(x, y) rotate(deg)` transform on the inner wrapper — independent
   * of MapLibre's own rotation on the outer container.
   * @param rotation - Clockwise rotation in degrees.
   */
  override setRotation(rotation: number): this {
    this.applyTransitionable("rotation", this.props.rotation ?? 0, rotation, rotationTransitionCodec, (v) => {
      this.setProp("rotation", v);
    });
    return this;
  }

  /**
   * Returns the current inner-shell rotation in degrees.
   * @returns Rotation in degrees; `0` if never set.
   */
  override getRotation(): number {
    return this.props.rotation ?? 0;
  }

  //#endregion

  //#endregion

  //#region UI States

  private attachUIStateListeners(): void {
    const target = resolveMarkerWrapper(this[MarkerElementSymbol]);

    if (!target.hasAttribute("tabindex")) target.tabIndex = 0;

    target.addEventListener("pointerenter", () => {
      this.setUIStateActive("hover", true);
    });
    target.addEventListener("pointerleave", () => {
      this.setUIStateActive("active", false);
      this.setUIStateActive("hover", false);
    });
    target.addEventListener("pointerdown", () => {
      this.setUIStateActive("active", true);
    });
    target.addEventListener("pointerup", () => {
      this.setUIStateActive("active", false);
    });
    target.addEventListener("pointercancel", () => {
      this.setUIStateActive("active", false);
    });
    target.addEventListener("focus", () => {
      this.setUIStateActive("focus", true);
    });

    // explicit focus on pointerdown — covers touch/pen
    target.addEventListener("pointerdown", () => {
      target.focus();
    });

    target.addEventListener("blur", () => {
      this.setUIStateActive("focus", false);
    });

    this.on("dragstart", () => {
      this.setUIStateActive("dragging", true);
    });
    this.on("dragend", () => {
      this.setUIStateActive("dragging", false);
    });
  }

  /** Blurs the marker's focusable element. Called by {@link MarkerManager} on map `click`. */
  [ClearFocusStateSymbol](): void {
    resolveMarkerWrapper(this[MarkerElementSymbol]).blur();
  }

  private setUIStateActive(name: MapTilerMarkerUIStateName, active: boolean): void {
    if (active === this.activeUIStates.has(name)) return;
    if (active) this.activeUIStates.add(name);
    else this.activeUIStates.delete(name);
    this.applyUIStates();
  }

  private applyUIStates(): void {
    const flattened = flattenUIStates(this.uiStates, this.activeUIStates);
    const newKeys = Object.keys(flattened) as (keyof PendingMarkerUpdates)[];

    const restoreKeys = this.appliedUIStateKeys.filter((key) => !(key in flattened));
    const restore = restoreKeys.length > 0 ? this.restoreUpdates(restoreKeys) : {};

    this.appliedUIStateKeys = newKeys;

    const batch = { ...restore, ...flattened } as PendingMarkerUpdates;
    if (Object.keys(batch).length === 0) return;
    updateMarkerElement(this[MarkerElementSymbol], batch, this.getCurrentStyleId());
  }

  /**
   * Registers (or replaces) the property overrides applied while `name` is
   * active. Applies immediately if that state is currently active.
   * @param name - UI state to configure (`hover` | `focus` | `active` | `dragging`).
   * @param spec - Property overrides to apply while the state is active.
   */
  setUIState(name: MapTilerMarkerUIStateName, spec: UIStateSpec): void {
    this.uiStates[name] = spec;
    if (this.activeUIStates.has(name)) this.applyUIStates();
  }

  //#endregion

  //#region Transitions

  /**
   * Configures (or clears) the easing used the next time `property` changes.
   * @param property - Transitionable property (`position` | `scale` | `rotation` | `outerColor` | `innerColor` | `contentColor` | `outlineColor`).
   * @param transition - `[duration, easing?, delay?]` in milliseconds, or `null` to make future changes snap immediately again.
   */
  setTransitionForProperty(property: MarkerTransitionProperty, transition: MarkerTransitionSpec | null): void {
    if (transition) {
      this.transitions[property] = transition;
      return;
    }
    this.transitions = omit(this.transitions, [property]);
  }

  /** Returns a copy of the currently configured per-property transitions. */
  getTransitions(): MapTilerMarkerTransitions {
    return { ...this.transitions };
  }

  /**
   * Applies `to` to `property`, either immediately or by easing from `from`
   * when a transition is configured. Fires `transitionstart`/`transitionend`.
   * @param property - Transitionable property being changed.
   * @param from - Current value.
   * @param to - Value being set.
   * @param codec - Bridges `T` to/from the flat numeric props the underlying animation interpolates.
   * @param apply - Writes an interpolated (or the immediate) value to the marker.
   */
  private applyTransitionable<T>(property: MarkerTransitionProperty, from: T, to: T, codec: TransitionValueCodec<T>, apply: (value: T) => void): void {
    this.cancelTransition(property);

    const spec = this.transitions[property];
    if (!spec || !MarkerManager.getMap(this)) {
      apply(to);
      return;
    }

    const animation = runPropertyTransition(from, to, spec, {
      codec,
      onUpdate: apply,
      onStart: () => this.fire("transitionstart", { props: { [property]: from } } as Pick<MarkerTransitionEventData, "props">),
      onEnd: (finalValue) => {
        this.activeTransitions.delete(property);
        apply(finalValue);
        this.fire("transitionend", { props: { [property]: finalValue } } as Pick<MarkerTransitionEventData, "props">);
      },
    });

    this.activeTransitions.set(property, animation);
  }

  /** Cancels any transition in flight for `property`, leaving its current (mid-transition) value as-is. */
  private cancelTransition(property: MarkerTransitionProperty | "opacity"): void {
    const animation = this.activeTransitions.get(property);
    if (!animation) return;
    animation.destroy();
    this.activeTransitions.delete(property);
  }

  /** Cancels every transition in flight. Called on removal so a destroyed marker's props can't keep animating. */
  private cancelAllTransitions(): void {
    for (const property of [...this.activeTransitions.keys()]) this.cancelTransition(property);
  }

  //#endregion

  //#region Lifecycle Animations

  /** Runs `preset`'s enter/exit motion (opacity + scale + lift) from `from` to `to`. */
  private playLifecycleTransition(
    phase: "enter" | "exit",
    from: LifecycleAnimationValue,
    to: LifecycleAnimationValue,
    easing: MarkerAnimationBase["easing"],
    spec: MarkerAnimationBase,
    preset: EnterAnimationPreset | ExitAnimationPreset,
    onComplete?: () => void,
  ): void {
    this.cancelTransition("opacity");
    this.cancelTransition("scale");

    const animation = runPropertyTransition(from, to, [spec.duration ?? 1000, easing, spec.delay ?? 0], {
      codec: lifecycleTransitionCodec,
      onUpdate: (v) => {
        this.clearEnterMask();
        this.setProp("opacity", v.opacity);
        this.setProp("scale", v.scale);
        applyLifecycleLift(this[MarkerElementSymbol], v.lift);
      },
      onStart: () => this.fire(`${phase}animationstart`, { preset }),
      onEnd: (finalValue) => {
        this.clearEnterMask();
        this.activeTransitions.delete("opacity");
        this.activeTransitions.delete("scale");
        this.setProp("opacity", finalValue.opacity);
        this.setProp("scale", finalValue.scale);
        applyLifecycleLift(this[MarkerElementSymbol], finalValue.lift);
        this.fire(`${phase}animationend`, { preset });
        onComplete?.();
      },
    });

    this.activeTransitions.set("opacity", animation);
    this.activeTransitions.set("scale", animation);
  }

  /** Runs a `custom` enter/exit animation: an eased `0`→`1` alpha handed to `spec.custom` every frame. */
  private playCustomLifecycleAnimation(phase: "enter" | "exit", spec: MarkerCustomAnimationOptions, onComplete?: () => void): void {
    this.cancelTransition("opacity");
    this.cancelTransition("scale");

    const animation = runPropertyTransition(0, 1, [spec.duration ?? 1000, spec.easing, spec.delay ?? 0], {
      codec: opacityTransitionCodec,
      onUpdate: (alpha) => {
        this.clearEnterMask();
        spec.custom(alpha, this);
      },
      onStart: () => this.fire(`${phase}animationstart`, { preset: "custom" }),
      onEnd: (alpha) => {
        this.clearEnterMask();
        this.activeTransitions.delete("opacity");
        spec.custom(alpha, this);
        this.fire(`${phase}animationend`, { preset: "custom" });
        onComplete?.();
      },
    });

    this.activeTransitions.set("opacity", animation);
  }

  /** Clears the enter-mask opacity set at construction. */
  private clearEnterMask(): void {
    this[MarkerElementSymbol].style.opacity = "";
  }

  /** Plays the configured `enter` animation, easing from {@link enterPresetHiddenValue} up to the marker's own configured state. */
  private playEnterAnimation(spec: MarkerAnimationOptions<EnterAnimationPreset>, onComplete?: () => void): void {
    if (typeof spec.custom === "function") {
      this.playCustomLifecycleAnimation("enter", spec, onComplete);
      return;
    }

    const baseOpacity = this.props.opacity ?? 1;
    const baseScale = this.props.scale ?? [1, 1];
    const shown: LifecycleAnimationValue = { opacity: baseOpacity, scale: baseScale, lift: 0 };
    const hidden = scaleLifecycleMagnitude(shown, enterPresetHiddenValue(spec.preset, baseOpacity, baseScale), spec.magnitude ?? 1);
    this.playLifecycleTransition("enter", hidden, shown, spec.easing ?? ENTER_PRESET_EASING[spec.preset], spec, spec.preset, onComplete);
  }

  /** Plays the configured `exit` animation, easing from the marker's own configured state down to {@link exitPresetHiddenValue}. */
  private playExitAnimation(spec: MarkerAnimationOptions<ExitAnimationPreset>, onComplete?: () => void): void {
    if (typeof spec.custom === "function") {
      this.playCustomLifecycleAnimation("exit", spec, onComplete);
      return;
    }

    const baseOpacity = this.props.opacity ?? 1;
    const baseScale = this.props.scale ?? [1, 1];
    const shown: LifecycleAnimationValue = { opacity: baseOpacity, scale: baseScale, lift: 0 };
    const hidden = scaleLifecycleMagnitude(shown, exitPresetHiddenValue(spec.preset, baseOpacity, baseScale), spec.magnitude ?? 1);
    this.playLifecycleTransition("exit", shown, hidden, spec.easing ?? EXIT_PRESET_EASING[spec.preset], spec, spec.preset, onComplete);
  }

  /** Wires play/iteration/stop bookkeeping around a `value`-keyframed animation, and plays it. */
  private runIdleAnimation(
    preset: IdleAnimationPreset | "custom",
    keyframes: Keyframe[],
    apply: (value: number) => void,
    duration: number,
    iterations: number,
    delay: number,
  ): void {
    const animation = new MaptilerAnimation({ keyframes, duration, iterations, delay });

    animation.addEventListener("play", () => this.fire("idleanimationstart", { preset }));
    animation.addEventListener("timeupdate", (event) => {
      apply(event.props.value);
    });
    animation.addEventListener("iteration", () => this.fire("idleanimationiteration", { preset }));
    // never call destroy() here — it calls stop() itself and would recurse
    animation.addEventListener("stop", () => {
      this.idleAnimation = null;
      this.fire("idleanimationend", { preset });
    });

    this.idleAnimation = animation;
    animation.play();
  }

  /** Starts the configured `idle` loop — `preset`'s single channel (see {@link IDLE_PRESET_CONFIG}), or a `custom` callback fed a `0`→`1` alpha. */
  private startIdleAnimation(spec: MarkerIdleAnimationOptions): void {
    this.stopIdleAnimation();

    if (typeof spec.custom === "function") {
      this.runIdleAnimation(
        "custom",
        [
          { delta: 0, props: { value: 0 }, easing: spec.easing ?? "Linear" },
          { delta: 1, props: { value: 1 } },
        ],
        (value) => {
          spec.custom(value, this);
        },
        spec.duration ?? 1000,
        spec.iterations ?? Infinity,
        spec.delay ?? 0,
      );
      return;
    }

    const { channel, keyframes } = IDLE_PRESET_CONFIG[spec.preset];
    const magnitude = spec.magnitude ?? 1;
    const baseOpacity = this.props.opacity ?? 1;
    const baseScale = this.props.scale ?? [1, 1];
    const baseRotation = this.props.rotation ?? 0;

    const apply = (value: number) => {
      switch (channel) {
        case "scale":
          this.setProp("scale", [baseScale[0] * value, baseScale[1] * value]);
          break;
        case "opacity":
          this.setProp("opacity", baseOpacity * value);
          break;
        case "rotation":
          this.setRotation(baseRotation + value);
          break;
        case "lift":
          applyLifecycleLift(this[MarkerElementSymbol], value);
          break;
      }
    };

    this.runIdleAnimation(
      spec.preset,
      keyframes.map((kf) => ({ delta: kf.delta, props: { value: scaleIdleMagnitude(channel, kf.value, magnitude) }, easing: kf.easing ?? "Linear" })),
      apply,
      spec.duration ?? IDLE_PRESET_DEFAULT_DURATION[spec.preset],
      spec.iterations ?? Infinity,
      spec.delay ?? 0,
    );
  }

  /** Stops the currently-looping `idle` animation, if any, leaving the marker at its current (mid-loop) state. */
  private stopIdleAnimation(): void {
    if (!this.idleAnimation) return;
    this.idleAnimation.destroy();
    this.idleAnimation = null;
  }

  //#endregion

  //#region Altitude

  /**
   * Sets altitude in meters above the ground plane (negative is fine —
   * below ground/sea level), faked via a per-frame pixel offset.
   * Pass `false` to unset, clamping to ground level.
   * @param meters - Altitude in meters, measured per `options.relativeTo`, or `false` to unset altitude entirely.
   * @param options - See {@link SetAltitudeOptions}. Ignored when `meters` is `false`.
   */
  setAltitude(meters: false): this;
  setAltitude(meters: number, options?: SetAltitudeOptions): this;
  setAltitude(meters: number | false, options: SetAltitudeOptions = {}): this {
    if (meters === false) {
      if (!this.altitudeEngaged) return this; // already inert — nothing to undo

      this.altitudeEngaged = false;
      this.altitudeMeters = 0;
      this.altitudeReference = "ground";

      const map = MarkerManager.getMap(this);
      if (map) MarkerManager.deregisterAltitudeParticipant(this, map);

      this.altitudeDelta = null;
      this.groundLineOrigin = null;
      this.writeOffset(this.baseOffset);
      this.setAltitudeHidden(false);
      this.setAltitudeOccluded(false);
      this.updateGroundLineElement();
      // restore the static z-index the constructor set
      if (typeof this.options.priority === "number") this[MarkerElementSymbol].style.zIndex = String(this.options.priority);
      else this[MarkerElementSymbol].style.removeProperty("z-index");
      return this;
    }

    const relativeTo = options.relativeTo ?? this.altitudeReference;
    if (this.altitudeEngaged && this.altitudeMeters === meters && this.altitudeReference === relativeTo) return this;
    this.altitudeEngaged = true;
    this.altitudeMeters = meters;
    this.altitudeReference = relativeTo;

    const map = MarkerManager.getMap(this);
    if (map) {
      MarkerManager.registerAltitudeParticipant(this, map);
      map.triggerRepaint();
    }
    return this;
  }

  /** Returns the current altitude in meters, or 0 if never set. */
  getAltitude(): number {
    return this.altitudeMeters;
  }

  /** Returns what {@link getAltitude}'s meters are measured from. Defaults to `"ground"`. */
  getAltitudeReference(): AltitudeReference {
    return this.altitudeReference;
  }

  /** True from the first {@link setAltitude} call onward. */
  hasActiveAltitude(): boolean {
    return this.altitudeEngaged;
  }

  /** Stamps `altitude`/`altitudeReference`/`altitudeEngaged` onto every `dragstart`/`drag`/`dragend` event. */
  override fire(event: string | { type: string }, properties?: Record<string, unknown>) {
    const type = typeof event === "string" ? event : event.type;
    if (type === "dragstart" || type === "drag" || type === "dragend") {
      const altitudeData = {
        altitude: this.getAltitude(),
        altitudeReference: this.getAltitudeReference(),
        altitudeEngaged: this.hasActiveAltitude(),
      };
      if (typeof event === "string") {
        properties = { ...properties, ...altitudeData };
      } else {
        Object.assign(event, altitudeData);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- base Evented's Event type isn't exported by maplibre-gl
    return super.fire(event as any, properties);
  }

  /**
   * Toggles a dashed line from the marker down (or up) to its ground point.
   * Off by default. See `.maptiler-marker-groundline` in
   * the SDK stylesheet and {@link GroundLineOptions.className}.
   * @param enabled - Whether to show the line.
   * @param options - Optional extra CSS class for styling.
   */
  setGroundLine(enabled: boolean, options: GroundLineOptions = {}): this {
    this.groundLineEnabled = enabled;
    this.groundLineOptions = options;

    if (!enabled) {
      this.groundLineEl?.remove();
      this.groundLineEl = null;
      return this;
    }

    this.updateGroundLineElement();
    const map = MarkerManager.getMap(this);
    if (map && this.altitudeMeters !== 0) map.triggerRepaint();
    return this;
  }

  /**
   * Per-frame altitude hook, called by {@link MarkerManager}
   */
  [ApplyAltitudeFrameSymbol](matrix: mat4, map: SDKMap): number | null {
    if (!this.altitudeEngaged) return null; // shouldn't be registered otherwise

    const projected = computeAltitudeProjection(this.getLngLat(), this.altitudeMeters, matrix, map, this.altitudeReference);
    if (!projected) {
      this.altitudeDelta = null;
      this.groundLineOrigin = null;
      this.setAltitudeHidden(true);
      this.setAltitudeOccluded(false);
      this.updateGroundLineElement();
      return null;
    }

    this.setAltitudeHidden(false);
    this.setAltitudeOccluded(projected.belowGround);

    this.altitudeDelta = {
      x: projected.elevated.x - projected.groundBase.x,
      y: projected.elevated.y - projected.groundBase.y,
    };
    this.groundLineOrigin = { x: projected.elevated.x, y: projected.elevated.y };
    this.writeOffset(this.baseOffset);
    this.updateGroundLineElement();
    return projected.elevated.depth;
  }

  /** Idempotent toggle for {@link altitudeHidden} — cheap to call every frame regardless of whether the state actually changed. */
  private setAltitudeHidden(hidden: boolean): void {
    if (this.altitudeHidden === hidden) return;
    this.altitudeHidden = hidden;
    applyAltitudeHidden(this[MarkerElementSymbol], hidden);
  }

  /** Idempotent toggle for {@link altitudeOccluded} — cheap to call every frame regardless of whether the state actually changed. */
  private setAltitudeOccluded(occluded: boolean): void {
    if (this.altitudeOccluded === occluded) return;
    this.altitudeOccluded = occluded;
    applyAltitudeOccluded(this[MarkerElementSymbol], occluded);
  }

  /**
   * Creates/updates/removes the ground-line element. Geometry
   * (position/width/rotation) comes from {@link altitudeDelta} and
   * {@link groundLineOrigin}
   * (see {@link MarkerManager.getGroundLineContainer}).
   */
  private updateGroundLineElement(): void {
    if (!this.groundLineEnabled) return;

    if (!this.altitudeDelta || !this.groundLineOrigin || this.altitudeHidden) {
      this.groundLineEl?.remove();
      this.groundLineEl = null;
      return;
    }

    const map = MarkerManager.getMap(this);
    if (!map) {
      this.groundLineEl?.remove();
      this.groundLineEl = null;
      return;
    }

    if (!this.groundLineEl) {
      const el = document.createElement("div");
      el.className = this.groundLineOptions.className ? `${GROUND_LINE_CLASSNAME} ${this.groundLineOptions.className}` : GROUND_LINE_CLASSNAME;
      el.style.position = "absolute";
      el.style.pointerEvents = "none";
      MarkerManager.getGroundLineContainer(map).appendChild(el);
      this.groundLineEl = el;
    }

    this.groundLineEl.style.left = `${String(this.groundLineOrigin.x)}px`;
    this.groundLineEl.style.top = `${String(this.groundLineOrigin.y)}px`;
    applyAltitudeOccluded(this.groundLineEl, this.altitudeOccluded);

    const { x: dx, y: dy } = this.altitudeDelta;
    const length = Math.hypot(dx, dy);
    if (length === 0) {
      this.groundLineEl.style.width = "0px";
      return;
    }

    const angleRad = Math.atan2(-dy, -dx);
    this.groundLineEl.style.width = `${String(length)}px`;
    this.groundLineEl.style.transform = `rotate(${String(angleRad)}rad)`;
  }

  //#endregion

  //#region Lifecycle

  /** Removes the marker from the DOM directly, bypassing {@link MarkerManager}. */
  [DetachFromDOMSymbol](): void {
    this.stopIdleAnimation();
    this.cancelAllTransitions();
    super.remove();
  }

  /** Removes the marker, playing the configured `exit` animation first (if any) before detaching from the DOM. */
  override remove(): this {
    if (this.suppressLifecycleAnimations) {
      this.detachImmediately();
      return this;
    }

    this.stopIdleAnimation();

    const exitSpec = this.animations.exit;
    if (!exitSpec || !MarkerManager.getMap(this)) {
      this.detachImmediately();
      return this;
    }

    MarkerManager.deregister(this, { deferDetach: true });
    this.playExitAnimation(exitSpec, () => {
      this[DetachFromDOMSymbol]();
    });
    return this;
  }

  /** Deregisters (if registered) and detaches from the DOM immediately — no exit animation. */
  private detachImmediately(): void {
    if (MarkerManager.getMap(this)) {
      MarkerManager.deregister(this);
    } else {
      this[DetachFromDOMSymbol]();
    }
  }

  //#endregion
}
