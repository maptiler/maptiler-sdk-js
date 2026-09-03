import maplibregl from "maplibre-gl";
import type { LngLatLike, MarkerOptions, PointLike } from "maplibre-gl";
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
  MarkerLifecycleAnimationEventData,
  EnterAnimationPreset,
  ExitAnimationPreset,
  IdleAnimationPreset,
} from "./types";
import { omit } from "../utils/object";
import { v4 as uuid } from "uuid";
import {
  applyCollisionCulled,
  applyCollisionHidden,
  applyLifecycleLift,
  applyMarkerStyleVariables,
  applyMinimizedDot,
  createMarkerElement,
  updateMarkerElement,
  resolveMarkerWrapper,
  releaseCollisionFadeClass,
  COLLISION_FADE_DURATION_MS,
} from "./marker-dom-utils";
import { DEFAULT_SHAPE, DEFAULT_SIZE, SHAPES, SIZE_PX, getShapeAnchorOffset } from "./marker-svg-config";
import { getAdaptiveBgColor, resolveAdaptiveColor } from "./marker-adaptive-colors";
import { MarkerManager } from "./MarkerManager";
import type { MarkerFootprint } from "./collision-helpers";
import { flattenUIStates } from "./marker-state-helpers";
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
  MeasuredElementSizeSymbol,
  ClearFocusStateSymbol,
} from "./marker-symbols";

const maplibreMarkerConstructorOverrides: MarkerOptions = {
  scale: 1, // scale in our class will be a 2D vector.
};

// custom elements minimize to a dot — only these props are consumable as
// CSS custom properties by the dot (or the element's own styles)
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
 * A MapTiler marker with extended styling and batched DOM update support.
 *
 * Extends MapLibre's `Marker` with 2-D scale, named shapes, colour tokens,
 * and a batched-update system that defers all DOM writes to the next animation
 * frame so that multiple property changes in the same tick cost only one
 * layout pass.
 */
export class Marker extends maplibregl.Marker {
  /**
   * The options used to construct this marker.
   * A construction-time snapshot — not updated by setters; use the getters
   * for current values.
   */
  readonly options: MapTilerMarkerOptions;
  readonly _scale = 1; // ML only allows scaling in 1 dimension, we want to add scaling in 2D so this is ignored.

  //#region Marker Properties

  /** Current values of all element-affecting properties. Written only via {@link setProp}. */
  private readonly props: MapTilerMarkerElementProps;

  /**
   * Whether the shape anchor offset is managed automatically.
   * `false` when the user supplied an explicit `offset` or a custom `element`.
   */
  private readonly managesOffset: boolean;

  /** The DOM element **/
  [MarkerElementSymbol]: HTMLElement;

  /** Property updates waiting to be flushed to the DOM on the next animation frame. */
  [PendingUpdatesSymbol]: PendingMarkerUpdates = {};

  /**
   * Unscaled CSS pixel size of a custom `element`, measured once by
   * {@link MarkerManager} when the marker is registered (the only time DOM
   * measurement is allowed — never during a collision pass).
   * `null` until measured; built-in SVG markers never need it.
   */
  [MeasuredElementSizeSymbol]: Vector2 | null = null;

  /** UUID that uniquely identifies this marker instance. */
  public readonly id = uuid();

  /** How the collision engine is currently displaying this marker. */
  private collisionDisplayState: MarkerCollisionDisplayState = "visible";

  /**
   * Visual props overridden while minimized — masked out of DOM flushes so a
   * queued user update can't clobber the minimized appearance, and restored
   * from {@link props} on un-minimize. Empty when not minimized.
   */
  private minimizedKeys: (keyof PendingMarkerUpdates)[] = [];

  /**
   * Whether the minimized appearance is currently applied to the DOM. Lags
   * behind {@link collisionDisplayState} during fades: the swap happens at
   * the invisible midpoint of a fade-through, and a marker hidden while
   * minimized keeps its minimized DOM until it un-hides.
   */
  private minimizedApplied = false;

  /** Pending mid-fade appearance swap for minimize transitions. */
  private minimizeSwapTimer: ReturnType<typeof setTimeout> | null = null;

  /** Pending post-fade cull (`display: none`) while hidden. */
  private cullTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Pending release of the collision fade class once no fade/dip transition
   * is in flight — keeps the class (and the `transform` transition it
   * carries) from lingering on the element after the marker settles, where
   * it would otherwise silently apply to unrelated `transform` writes (e.g.
   * {@link setScale}, {@link setRotation}).
   */
  private fadeClassReleaseTimer: ReturnType<typeof setTimeout> | null = null;

  /** Registered property overrides per UI state, keyed by state name. */
  private uiStates: MapTilerMarkerUIStates;

  /** UI states currently active (interaction-driven). */
  private readonly activeUIStates = new Set<MapTilerMarkerUIStateName>();

  /**
   * Keys currently owned by the flattened active UI state — masked out of
   * DOM flushes so a queued user update can't clobber the UI state's
   * appearance, mirroring {@link minimizedKeys}.
   */
  private appliedUIStateKeys: (keyof PendingMarkerUpdates)[] = [];

  /** Registered per-property transition config, keyed by property name. */
  private transitions: MapTilerMarkerTransitions;

  /**
   * In-flight transitions, keyed by property name — at most one per property.
   * `"opacity"` isn't a public {@link MarkerTransitionProperty}; it's reused
   * here so an enter/exit fade is cancelled the same way any other in-flight
   * transition would be.
   */
  private readonly activeTransitions = new Map<MarkerTransitionProperty | "opacity", MaptilerAnimation>();

  /** The currently-looping `idle` animation, if any — started after `enter` finishes (or immediately), stopped on `remove()`. */
  private idleAnimation: MaptilerAnimation | null = null;

  /** Configured enter/idle/exit lifecycle animations. */
  private animations: MapTilerMarkerAnimations;

  /**
   * Set while `addTo()` is calling into MapLibre's base `addTo()`, which
   * itself calls `this.remove()` first (to detach from any previous map).
   * Without this guard that reentrant call would play a full exit animation
   * every time a marker is (re-)added.
   */
  private suppressLifecycleAnimations = false;

  //#endregion

  //#region Constructor

  /**
   * Creates a marker whose content is a pre-built DOM or SVG element.
   *
   * SVG-layout fields (`shape`, `size`) are not available in this signature —
   * they only affect the built-in SVG generator.  Color and shadow options
   * are still accepted and applied as CSS custom properties on the supplied
   * element so that its styles can consume them.
   *
   * TODO: this will affect collision behaviour.
   */
  constructor(options: MapTilerMarkerElementOptions);
  /**
   * Creates a marker whose content is generated by the built-in SVG system.
   *
   * Use `shape`, `size`, colour tokens, and shadow to style the marker.
   */
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

    // custom elements skip createMarkerElement, so seed their style variables here
    if (options.element) applyMarkerStyleVariables(options.element, options);

    // If an `enter` animation is configured, mask the element right away.
    // addTo() attaches it to the DOM synchronously, but MaptilerAnimation
    // only applies its first keyframe on the *next* animation frame (play()
    // just starts the clock) — without this, the marker would render at its
    // full configured opacity for one frame before the enter animation's
    // first tick pulls it down to its hidden starting state, a visible
    // "flash" before it fades/grows/pops in.
    //
    // This has to be the *outer* element (not the inner `.marker-transform-
    // wrapper` a preset animates via setProp) so it's just as effective for
    // a `custom` enter — whose callback can only reach the marker through
    // the public `getElement()`, i.e. this same outer element. Whichever
    // kind of enter animation actually runs is responsible for clearing this
    // mask on its first real frame (see playLifecycleTransition /
    // playCustomLifecycleAnimation) — until then it stays fully masked.
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
   * Adds the marker to a map.
   *
   * Overrides the MapLibre signature to also accept the SDK `Map` type.
   * Plays the configured `enter` animation, if any, once attached.
   * @param map - Target map instance.
   */
  addTo(map: SDKMap): this {
    // MapLibre's own addTo() calls this.remove() first (to detach from any
    // previous map) — suppress the exit animation for that reentrant call.
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

  /**
   * Recomputes the shape anchor offset on the parent MapLibre marker so the
   * shape's visual tip stays on the lngLat. No-op when the user supplied an
   * explicit `offset` or a custom `element`.
   */
  private applyShapeAnchorOffset(): void {
    if (!this.managesOffset) return;
    // while the minimized appearance is applied, the live offset belongs to
    // the minimized shape/size; the props-based offset is restored on un-minimize
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
    // while the minimized appearance or an active UI state owns a key, the
    // props are already recorded and get applied once that owner releases it
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

  /**
   * Queues a re-resolution of the adaptive `color` against the current map
   * style. Called by {@link MarkerManager} when the marker is registered and
   * whenever the map style changes. No-op when the marker has no adaptive
   * colour, or when an explicit `innerColor` pins the colour.
   */
  [RefreshAdaptiveColorSymbol](): void {
    if (this.props.color === undefined || this.props.innerColor !== undefined) return;
    this.setProp("color", this.props.color);
  }

  //#endregion

  //#region Collision

  /**
   * Resolves the marker's screen footprint for collision detection.
   *
   * Built entirely from stored props / lookup tables — no DOM reads — so it
   * is safe to call once per marker per detection pass. Called by
   * {@link MarkerManager} which pairs it with the marker's projected screen
   * position to build the collision box.
   *
   * Always the *full-size* footprint: a minimized marker keeps reserving its
   * full box (strict priority order), so the minimized rendering never has a
   * footprint of its own.
   */
  [CollisionFootprintSymbol](): MarkerFootprint {
    const [sx, sy] = this.props.scale ?? [1, 1];
    const shared = {
      rotation: this.props.rotation ?? 0,
      mapAligned: this.getRotationAlignment() === "map",
    };

    // explicit collision radius replaces the visual box with a centred
    // square pinned on the anchor point — rotation must not move it
    const radius = this.options.collisionRadius;
    if (radius && radius > 0) {
      return { width: radius * 2, height: radius * 2, anchor: "center", offset: this.footprintOffset(), ...shared, pivot: [0, 0] };
    }

    const anchor = this.options.anchor ?? "center";

    // custom element: size measured once at registration; rotation uses the
    // CSS default transform-origin (element center)
    if (this.options.element) {
      const [w, h] = this[MeasuredElementSizeSymbol] ?? [0, 0];
      return { width: w * sx, height: h * sy, anchor, offset: this.footprintOffset(), ...shared, pivot: [0, 0] };
    }

    // built-in SVG: height comes from the size key, width from the shape's
    // aspect ratio (see setMarkerSVGDimensions); `xs` renders a square dot
    const { shape: shapeKey, size } = this.effectiveShapeAndSize(false);
    const heightPx = SIZE_PX[size];
    const shape = SHAPES[shapeKey];
    const widthPx = size === "xs" ? heightPx : heightPx * (shape.viewBox[0] / shape.viewBox[1]);
    const height = heightPx * sy;
    // bottom-anchored shapes rotate around their tip (transform-origin
    // "center bottom" — see createMarkerElement / applyShape)
    const pivot: Vector2 = shape.anchor === "center" ? [0, 0] : [0, height / 2];
    return { width: widthPx * sx, height, anchor, offset: this.footprintOffset(), ...shared, pivot };
  }

  /**
   * The marker's shape/size keys, or their minimized substitutes: the
   * minimized appearance defaults to the `xs` dot, with `minimizedOptions`
   * overriding individual keys.
   */
  private effectiveShapeAndSize(minimized: boolean): { shape: NonNullable<MapTilerMarkerOptions["shape"]>; size: NonNullable<MapTilerMarkerOptions["size"]> } {
    const shape = this.props.shape ?? DEFAULT_SHAPE;
    const size = this.props.size ?? DEFAULT_SIZE;
    if (!minimized) return { shape, size };
    const overrides = this.options.minimizedOptions;
    return { shape: overrides?.shape ?? shape, size: overrides?.size ?? "xs" };
  }

  /**
   * Screen offset used in the collision footprint. Managed offsets are
   * recomputed from the props rather than read back from MapLibre — the live
   * offset temporarily belongs to the minimized shape while the marker is
   * minimized (see {@link applyMinimizedAppearance}).
   */
  private footprintOffset(): Vector2 {
    if (this.managesOffset) {
      const { shape, size } = this.effectiveShapeAndSize(false);
      return getShapeAnchorOffset(shape, size);
    }
    const offset = this.getOffset();
    return [offset.x, offset.y];
  }

  /**
   * Fires the state-change collision event (`markeroverlap` or
   * `markerproximity`) for this marker. Called by {@link MarkerManager}
   * after diffing the pass results against the previous pass — only
   * transitions reach this point, unchanged collisions are never re-emitted.
   */
  [EmitCollisionDiffSymbol](data: MarkerCollisionEventData): void {
    this.fire(data.kind === "overlap" ? "markeroverlap" : "markerproximity", data);
  }

  /**
   * Applies the display state decided by the collision engine's behaviour
   * resolution. Idempotent — reapplying the current state is a no-op, so
   * unchanged markers cost nothing per pass.
   *
   * Never touches {@link props}: hiding toggles the fade classes on the
   * root element (see `applyCollisionHidden`) and minimizing writes the
   * minimized visuals directly to the DOM, so detection keeps seeing the
   * marker's real properties and the user's values survive the round-trip.
   *
   * Every transition fades. Hide/show fade in place; minimize transitions
   * with both endpoints on screen fade *through* zero — dip out, swap the
   * appearance at the invisible midpoint, fade back in — since the SVG swap
   * itself cannot crossfade. A transition arriving mid-fade cancels the
   * pending swap and supersedes it.
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
      // fade out as-is; a minimized appearance is restored lazily on un-hide.
      // Once the fade completes the marker leaves rendering entirely
      // (display: none), so masses of hidden markers cost nothing per frame.
      this.setCollisionHidden(true);
      this.cullTimer = setTimeout(() => {
        this.cullTimer = null;
        applyCollisionCulled(this.getElement(), true);
      }, this.collisionTransitionMs());
      return;
    }

    const wantMinimized = state === "minimized";

    if (previous === "hidden") {
      // re-enter rendering, swap the appearance while still invisible, then
      // fade in. During a pass the un-cull (and the reflow the fade-in
      // needs) already happened batched in MarkerManager, making this a
      // no-op; on direct calls (e.g. deregister) the fade may snap, which
      // never shows.
      applyCollisionCulled(element, false);
      this.setMinimizedApplied(wantMinimized);
      this.setCollisionHidden(false);
      return;
    }

    if (this.minimizedApplied === wantMinimized) {
      // nothing to swap (e.g. a cancelled dip reversed itself) — just fade back
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

  /**
   * Toggles the collision-hidden fade, and (re)schedules releasing the fade
   * class once the map's collision transition duration passes with no
   * further fade/dip transition — see {@link fadeClassReleaseTimer}.
   */
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

  /**
   * Applies or restores the minimized appearance. Everything goes straight
   * to the DOM (never through {@link setProp}), so the user's props survive;
   * the anchor offset follows the minimized shape exactly like a real
   * shape/size change would (see {@link applyShapeAnchorOffset}).
   */
  private applyMinimizedAppearance(enabled: boolean): void {
    const styleId = this.getCurrentStyleId();

    if (enabled) {
      const overrides = this.minimizedOverrides();
      this.minimizedKeys = Object.keys(overrides) as (keyof PendingMarkerUpdates)[];
      if (this.options.element) applyMinimizedDot(this.options.element, this.options.anchor ?? "center", true);
      if (this.minimizedKeys.length > 0) updateMarkerElement(this[MarkerElementSymbol], overrides, styleId);
      if (this.managesOffset) {
        const { shape, size } = this.effectiveShapeAndSize(true);
        super.setOffset(getShapeAnchorOffset(shape, size));
      }
      return;
    }

    const restore = this.restoreUpdates(this.minimizedKeys);
    this.minimizedKeys = [];
    if (this.options.element) applyMinimizedDot(this.options.element, this.options.anchor ?? "center", false);
    if (Object.keys(restore).length > 0) updateMarkerElement(this[MarkerElementSymbol], restore, styleId);
    if (this.managesOffset) {
      super.setOffset(getShapeAnchorOffset(this.props.shape ?? DEFAULT_SHAPE, this.props.size ?? DEFAULT_SIZE));
    }
  }

  /**
   * Builds the batch that restores the given keys to their prop values.
   * `color` / `innerColor` are restored together respecting their
   * precedence: an explicit `innerColor` wins, otherwise the adaptive
   * `color` (or the default) is re-resolved.
   */
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
   *
   * Overridden to re-run collision detection — a marker moving changes
   * collisions with no map event to hang the pass on.
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
   * Sets the marker's screen-space pixel offset.
   *
   * Overridden to re-run collision detection — the offset shifts the
   * marker's collision box.
   * @param offset - Offset in pixels (+y down).
   */
  override setOffset(offset: PointLike): this {
    super.setOffset(offset);
    const map = MarkerManager.getMap(this);
    if (map) MarkerManager.invalidateCollisions(map);
    return this;
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
   * Sets the marker shape. Rebuilds the marker SVG in place, migrating the
   * current content (title / image / element) to the new shape's geometry.
   *
   * Has no visible effect on markers constructed with a custom `element`,
   * or while the size is `xs` (the dot rendering has no shape) — in the
   * latter case the shape is applied when the size next changes.
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
   * Sets the adaptive colour of the marker. The inner (background) colour is
   * resolved against the current map style and re-resolved on style changes.
   * Clears any explicit `innerColor` so adaptation takes effect immediately.
   * @param color - Built-in palette name (`"blue"` | `"red"` | `"green"`), a
   *   custom `AdaptiveColor` definition, or `undefined` to remove.
   */
  setColor(color: MapTilerMarkerOptions["color"]) {
    this.props.innerColor = undefined;
    // an innerColor queued earlier in the same tick would override this batch
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
   * Sets an explicit fill colour for the inner area of the marker.
   * Takes precedence over the adaptive `color` and disables adaptation while
   * set; passing `undefined` re-enables the adaptive colour if one exists.
   * @param color - Any valid CSS colour string.
   */
  setInnerColor(color: MapTilerMarkerOptions["innerColor"]) {
    if (color === undefined && this.props.color !== undefined) {
      this.props.innerColor = undefined;
      this.setProp("color", this.props.color); // resume adaptation
      return;
    }
    this.applyTransitionable("innerColor", this.props.innerColor, color, colorTransitionCodec, (v) => {
      this.setProp("innerColor", v);
    });
  }

  /**
   * Returns the inner area colour currently in effect: the explicit
   * `innerColor` when set, otherwise the adaptive `color` resolved against
   * the current map style, otherwise `undefined` (default colour applies).
   */
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
   * Sets the rendering priority. Numeric values are applied as `z-index` on
   * the marker element, so higher-priority markers stack above lower ones.
   * Expression-form priorities are stored but only take effect once the
   * collision engine resolves them.
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
   * Rotates the marker's inner shell element in degrees.
   *
   * Applied as part of the CSS `scale(x, y) rotate(deg)` compound transform
   * on the inner wrapper — independent of MapLibre's own rotation, which is
   * applied to the outer container element.
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

    // Click-to-focus is the default action of mousedown, which MapLibre's
    // handler prevents on the map container. Take focus explicitly
    // instead of relying on that default. pointerdown (not click) lands the
    // state on press and covers touch/pen.
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

  /**
   * Blurs the marker's focusable element. The map's own mousedown handling
   * prevents focus from ever naturally moving off the marker on background
   * clicks, so {@link MarkerManager} calls this explicitly on map `click` to
   * clear a stuck `focus` UI state.
   */
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
   * Applies immediately, before the config takes effect on a future call —
   * it does not retroactively animate the property's current value.
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
   * Applies `to` to `property`, either immediately or, when a transition is
   * configured for it and the marker is on a map, by easing from `from` over
   * the configured duration/easing/delay. Fires `transitionstart` once
   * playback begins (i.e. after `delay`) and `transitionend` once `to` is
   * reached. Supersedes any transition already in flight for `property`.
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

  /**
   * Runs `preset`'s enter/exit motion (opacity + scale + lift, see
   * {@link enterPresetHiddenValue}/{@link exitPresetHiddenValue}) from `from`
   * to `to`. Fires `${phase}animationstart`/`${phase}animationend` and calls
   * `onComplete` once the target state is reached.
   */
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
      onStart: () => this.fire(`${phase}animationstart`, { preset } as Pick<MarkerLifecycleAnimationEventData, "preset">),
      onEnd: (finalValue) => {
        this.clearEnterMask();
        this.activeTransitions.delete("opacity");
        this.activeTransitions.delete("scale");
        this.setProp("opacity", finalValue.opacity);
        this.setProp("scale", finalValue.scale);
        applyLifecycleLift(this[MarkerElementSymbol], finalValue.lift);
        this.fire(`${phase}animationend`, { preset } as Pick<MarkerLifecycleAnimationEventData, "preset">);
        onComplete?.();
      },
    });

    this.activeTransitions.set("opacity", animation);
    this.activeTransitions.set("scale", animation);
  }

  /**
   * Runs a `custom` enter/exit animation: a plain `0`→`1` alpha (already
   * eased) handed to `spec.custom` every frame. `0` is enter's hidden /
   * exit's shown state; `1` is the opposite end.
   */
  private playCustomLifecycleAnimation(phase: "enter" | "exit", spec: MarkerCustomAnimationOptions, onComplete?: () => void): void {
    this.cancelTransition("opacity");
    this.cancelTransition("scale");

    const animation = runPropertyTransition(0, 1, [spec.duration ?? 1000, spec.easing, spec.delay ?? 0], {
      codec: opacityTransitionCodec,
      onUpdate: (alpha) => {
        this.clearEnterMask();
        spec.custom(alpha, this);
      },
      onStart: () => this.fire(`${phase}animationstart`, { preset: "custom" } as Pick<MarkerLifecycleAnimationEventData, "preset">),
      onEnd: (alpha) => {
        this.clearEnterMask();
        this.activeTransitions.delete("opacity");
        spec.custom(alpha, this);
        this.fire(`${phase}animationend`, { preset: "custom" } as Pick<MarkerLifecycleAnimationEventData, "preset">);
        onComplete?.();
      },
    });

    this.activeTransitions.set("opacity", animation);
  }

  /**
   * Clears the outer-element opacity mask set at construction time when an
   * `enter` animation is configured (see the constructor). Called from the
   * first real frame of whichever enter/exit animation runs — preset or
   * `custom` — so a `custom` enter is never left invisible: it's the only
   * thing responsible for un-masking itself, since the SDK has no way to
   * know in advance whether (or how) a `custom` callback touches opacity.
   * Safe to call unconditionally, including for `exit` (never masked) and
   * repeatedly (idempotent) — it's just clearing an inline style back to "".
   */
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

  /**
   * Wires the play/iteration/stop bookkeeping shared by every idle loop
   * (preset or `custom`) around a `value`-keyframed animation, and plays it.
   */
  private runIdleAnimation(
    preset: IdleAnimationPreset | "custom",
    keyframes: Keyframe[],
    apply: (value: number) => void,
    duration: number,
    iterations: number,
    delay: number,
  ): void {
    const animation = new MaptilerAnimation({ keyframes, duration, iterations, delay });

    animation.addEventListener("play", () => this.fire("idleanimationstart", { preset } as Pick<MarkerLifecycleAnimationEventData, "preset">));
    animation.addEventListener("timeupdate", (event) => {
      apply(event.props.value);
    });
    animation.addEventListener("iteration", () => this.fire("idleanimationiteration", { preset } as Pick<MarkerLifecycleAnimationEventData, "preset">));
    // "animationend" fires on every loop-boundary reset, not just a true
    // stop — "stop" only fires once, when `stopIdleAnimation()` interrupts it
    // or (for a finite `iterations`) it naturally runs out. Never call
    // `destroy()` in here: `destroy()` itself calls `stop()`, which would
    // re-emit "stop" into this same listener and recurse.
    animation.addEventListener("stop", () => {
      this.idleAnimation = null;
      this.fire("idleanimationend", { preset } as Pick<MarkerLifecycleAnimationEventData, "preset">);
    });

    this.idleAnimation = animation;
    animation.play();
  }

  /**
   * Starts the configured `idle` loop — `preset`'s single channel (see
   * {@link IDLE_PRESET_CONFIG}) eased out from rest and back per iteration,
   * or a `custom` callback fed a `0`→`1` alpha that resets every iteration.
   * Replaces any idle animation already running.
   */
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

  //#region Lifecycle

  /**
   * Removes the marker from the DOM directly, bypassing {@link MarkerManager}.
   *
   * Called by {@link MarkerManager.deregister} after it has already cleaned
   * up its own state — calling `remove()` here would cause infinite recursion.
   */
  [DetachFromDOMSymbol](): void {
    this.stopIdleAnimation();
    this.cancelAllTransitions();
    super.remove();
  }

  /**
   * Deregisters the marker from {@link MarkerManager} and removes it from
   * the map. If an `exit` animation is configured, the marker is deregistered
   * immediately (collision/index bookkeeping updates right away) but stays
   * attached and visible until the animation finishes.
   * @returns `this` for chaining.
   */
  override remove(): this {
    // reentrant call from addTo()'s internal remove(), or a genuine remove()
    // with nothing configured to animate — plain, immediate removal.
    if (this.suppressLifecycleAnimations) {
      this.detachImmediately();
      return this;
    }

    // stop straight away, not deferred to [DetachFromDOMSymbol] — otherwise
    // it would keep looping (and fighting the exit motion) for the whole
    // exit animation instead of stopping the moment removal starts.
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
      // never registered (added via addTo() directly) — plain MapLibre removal
      this[DetachFromDOMSymbol]();
    }
  }

  //#endregion
}
