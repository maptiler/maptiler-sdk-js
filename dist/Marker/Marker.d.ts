import { default as maplibregl, LngLatLike, PointLike } from 'maplibre-gl';
import { mat4 } from 'gl-matrix';
import { Map as SDKMap } from '../Map';
import { MapTilerMarkerElementOptions, MapTilerMarkerSVGOptions, PendingMarkerUpdates, Vector2, MapTilerMarkerOptions, MarkerCollisionEventData, MarkerCollisionDisplayState, MapTilerMarkerUIStateName, UIStateSpec, MarkerTransitionProperty, MapTilerMarkerTransitions, MarkerTransitionSpec, GroundLineOptions, AltitudeReference, SetAltitudeOptions } from './types';
import { MarkerFootprint } from './collision-helpers';
import { PendingUpdatesSymbol, DetachFromDOMSymbol, FlushDOMUpdatesSymbol, MarkerElementSymbol, RefreshAdaptiveColorSymbol, CollisionFootprintSymbol, EmitCollisionDiffSymbol, ApplyCollisionDisplayStateSymbol, ApplyAltitudeFrameSymbol, MeasuredElementSizeSymbol, ClearFocusStateSymbol } from './marker-symbols';
/** MapLibre's `Marker` extended with 2-D scale, named shapes, colour tokens, and batched DOM updates. */
export declare class Marker extends maplibregl.Marker {
    /** Construction-time options snapshot — not updated by setters. */
    readonly options: MapTilerMarkerOptions;
    readonly _scale = 1;
    /** Current values of all element-affecting properties. Written only via {@link setProp}. */
    private readonly props;
    /** Whether the shape anchor offset is auto-managed — `false` with an explicit `offset` or custom `element`. */
    private readonly managesOffset;
    /** The DOM element **/
    [MarkerElementSymbol]: HTMLElement;
    /** Property updates waiting to be flushed to the DOM on the next animation frame. */
    [PendingUpdatesSymbol]: PendingMarkerUpdates;
    /** Unscaled CSS pixel size of a custom `element`, measured once at registration. `null` until measured; unused for built-in SVG markers. */
    [MeasuredElementSizeSymbol]: Vector2 | null;
    /** UUID that uniquely identifies this marker instance. */
    readonly id: string;
    /**
     * The `classList` of the marker's wrapper element — the inner transform
     * wrapper of a built-in marker, or the custom `element` itself. Read-only
     * reference; add and remove classes through the returned list.
     */
    get classList(): DOMTokenList;
    /** How the collision engine is currently displaying this marker. */
    private collisionDisplayState;
    /** Visual props overridden while minimized, restored from {@link props} on un-minimize. Empty when not minimized. */
    private minimizedKeys;
    /** Whether the minimized appearance is currently applied to the DOM. Lags {@link collisionDisplayState} during fades. */
    private minimizedApplied;
    /** Pending mid-fade appearance swap for minimize transitions. */
    private minimizeSwapTimer;
    /** Pending post-fade cull (`display: none`) while hidden. */
    private cullTimer;
    /** Pending release of the collision fade class once no fade/dip is in flight. */
    private fadeClassReleaseTimer;
    /** Registered property overrides per UI state, keyed by state name. */
    private uiStates;
    /** UI states currently active (interaction-driven). */
    private readonly activeUIStates;
    /** Keys owned by the flattened active UI state, masked out of DOM flushes like {@link minimizedKeys}. */
    private appliedUIStateKeys;
    /** Registered per-property transition config, keyed by property name. */
    private transitions;
    /** In-flight transitions, keyed by property — at most one each. `"opacity"` isn't a public {@link MarkerTransitionProperty}, reused for enter/exit fades. */
    private readonly activeTransitions;
    /** The currently-looping `idle` animation, if any — started after `enter` finishes (or immediately), stopped on `remove()`. */
    private idleAnimation;
    /** Configured enter/idle/exit lifecycle animations. */
    private animations;
    /** Set during `addTo()`'s call into the base `addTo()`, which calls `this.remove()` first to detach from any previous map. */
    private suppressLifecycleAnimations;
    /** Altitude in meters, faked via a per-frame pixel offset (MapLibre's Marker has no native Z). 0 by default — see {@link setAltitude}. */
    private altitudeMeters;
    /** What {@link altitudeMeters} is measured from — see {@link AltitudeReference}. */
    private altitudeReference;
    /** True once {@link setAltitude} has been called at least once — see {@link hasActiveAltitude}. */
    private altitudeEngaged;
    /** The offset MapLibre would show with no altitude applied. Only {@link writeOffset} should write the real offset — anything that calls `super.setOffset` directly clobbers altitude. */
    private baseOffset;
    /** Pixel delta from `groundBase` to `elevated`, added to {@link baseOffset}. Null when off-screen/behind camera. */
    private altitudeDelta;
    /** The `elevated` point in absolute canvas CSS pixels — the ground line's position. */
    private groundLineOrigin;
    /** True when off-screen/behind the camera. Not the below-ground case — see {@link altitudeOccluded}. */
    private altitudeHidden;
    /** True when below ground (`computeAltitudeProjection`'s `belowGround`). */
    private altitudeOccluded;
    private groundLineEnabled;
    private groundLineOptions;
    private groundLineEl;
    /**
     * Creates a marker from a pre-built DOM or SVG element.
     *
     * `shape`/`size` don't apply. Color/shadow options still apply as CSS
     * custom properties for the element's own styles to consume.
     */
    constructor(options: MapTilerMarkerElementOptions);
    /** Creates a marker styled via the built-in SVG system (`shape`, `size`, colour tokens, shadow). */
    constructor(options: MapTilerMarkerSVGOptions);
    /**
     * Adds the marker to a map, and plays the configured `enter` animation (if any) once attached.
     * @param map - Target map instance.
     */
    addTo(map: SDKMap): this;
    /** Recomputes the shape anchor offset so the shape's tip stays on the lngLat. No-op with an explicit `offset` or custom `element`. */
    private applyShapeAnchorOffset;
    /**
     * Records a property's new value and schedules a DOM flush on the next
     * animation frame via {@link MarkerManager}.
     * @param prop - The element property to update.
     * @param value - The new value for the property.
     */
    private setProp;
    /**
     * Applies all pending property updates to the marker element and clears
     * the batch. Called by {@link MarkerManager} on the next animation frame.
     */
    [FlushDOMUpdatesSymbol](): void;
    /** Returns the style id of the map this marker is on, or `undefined` when detached. */
    private getCurrentStyleId;
    /** Queues re-resolving every unset colour against the current map style. */
    [RefreshAdaptiveColorSymbol](): void;
    /** Sets one colour prop; `undefined` returns it to its map-style default (resolved at flush time, so nothing to transition to). */
    private setColorProp;
    /** A colour prop's value in effect — the explicit one, else the default for the map's style. */
    private getEffectiveColor;
    /** Resolves the marker's screen footprint for collision detection. Always full-size, even minimized. */
    [CollisionFootprintSymbol](): MarkerFootprint;
    /** Shape/size keys, or minimized substitutes. */
    private effectiveShapeAndSize;
    /** Screen offset for the collision footprint. */
    private footprintOffset;
    /** Fires the collision transition event (`markeroverlap`/`markerproximity`). */
    [EmitCollisionDiffSymbol](data: MarkerCollisionEventData): void;
    /**
     * Applies the collision engine's display-state decision.
     *
     * Every transition fades. Hide/show fade in place; visible<->minimized
     * fades *through* zero (dip out, swap at the invisible midpoint, fade back in).
     */
    [ApplyCollisionDisplayStateSymbol](state: MarkerCollisionDisplayState): void;
    /** Toggles the collision-hidden fade and reschedules releasing the fade class — see {@link fadeClassReleaseTimer}. */
    private setCollisionHidden;
    /** The fade duration (ms) configured for this marker's map, or the SDK default when off a map. */
    private collisionTransitionMs;
    /** Applies or restores the minimized appearance if it differs from what the DOM shows. */
    private setMinimizedApplied;
    /** Returns how the collision engine is currently displaying this marker. */
    getCollisionDisplayState(): MarkerCollisionDisplayState;
    /** The visual props the minimized appearance overrides for this marker. */
    private minimizedOverrides;
    /** Applies or restores the minimized appearance, straight to the DOM (never {@link setProp}). */
    private applyMinimizedAppearance;
    /** Builds the batch restoring `keys` to their prop values. */
    private restoreUpdates;
    /**
     * Sets the marker's geographical position.
     * @param lnglat - The new position.
     */
    setLngLat(lnglat: LngLatLike): this;
    /**
     * Sets the marker's screen-space pixel offset. Composes with altitude (see {@link writeOffset}) rather than replacing it.
     * @param offset - Offset in pixels (+y down).
     */
    setOffset(offset: PointLike): this;
    /** The only path that should write MapLibre's real offset: records `offset` as {@link baseOffset}, then writes `base + altitudeDelta`. Callers must never use `super.setOffset` directly, or altitude gets silently dropped. */
    private writeOffset;
    /**
     * Sets the 2-D scale of the marker as `[x, y]`.
     * @param scaleVector - Scale factors for the x and y axes.
     */
    setScale(scaleVector: Vector2): void;
    /** Returns the current 2-D scale. Defaults to `[1, 1]`. */
    getScale(): Vector2 | undefined;
    /**
     * Sets the marker shape. Applies the new anchor offset (see {@link applyShapeAnchorOffset}).
     * @param shape - Marker shape key.
     */
    setShape(shape: MapTilerMarkerOptions["shape"]): void;
    /** Returns the current shape, or `undefined` if never set. */
    getShape(): import('./types').MapTilerMarkerShape | undefined;
    /**
     * Sets the marker size.
     * @param size - Marker size key.
     */
    setSize(size: MapTilerMarkerOptions["size"]): void;
    /** Returns the current size, or `undefined` if never explicitly set. */
    getSize(): import('./types').MapTilerMarkerSize | undefined;
    /**
     * Sets the drop-shadow intensity.
     * @param shadow - Shadow intensity preset, or `undefined` to remove it.
     */
    setShadow(shadow: MapTilerMarkerOptions["shadow"]): void;
    /** Returns the current shadow preset, or `undefined` if none is set. */
    getShadow(): import('./types').MapTilerMarkerShadow | undefined;
    /**
     * Sets the fill colour of the outer body of the marker.
     * @param color - Any valid CSS colour string, or `undefined` to return to the map-style default.
     */
    setOuterColor(color: MapTilerMarkerOptions["outerColor"]): void;
    /** Returns the outer body colour currently in effect — the explicit `outerColor`, else the default for the map's style. */
    getOuterColor(): string;
    /**
     * Sets an explicit fill colour for the inner area of the marker, replacing
     * the map-style default.
     * @param color - Any valid CSS colour string, or `undefined` to return to the map-style default.
     */
    setInnerColor(color: MapTilerMarkerOptions["innerColor"]): void;
    /** Returns the inner area colour currently in effect — the explicit `innerColor`, else the default for the map's style. */
    getInnerColor(): string;
    /**
     * Sets the colour applied to the marker content (icon, text, etc.).
     * @param color - Any valid CSS colour string, or `undefined` to return to the map-style default.
     */
    setContentColor(color: MapTilerMarkerOptions["contentColor"]): void;
    /** Returns the content colour currently in effect — the explicit `contentColor`, else the default for the map's style. */
    getContentColor(): string;
    /**
     * Sets the stroke colour of the marker outline.
     * Has no visible effect unless {@link setOutline} is also called.
     * @param color - Any valid CSS colour string, or `undefined` to return to the map-style default.
     */
    setOutlineColor(color: MapTilerMarkerOptions["outlineColor"]): void;
    /** Returns the outline stroke colour currently in effect — the explicit `outlineColor`, else the default for the map's style. */
    getOutlineColor(): string;
    /**
     * Sets the outline stroke width on the marker body.
     * @param outline - `true` for the default width, a positive `number` for an
     *   explicit pixel width, or `undefined` to remove the outline.
     */
    setOutline(outline: MapTilerMarkerOptions["outline"]): void;
    /** Returns the current outline value (`true`, a pixel width, or `undefined`). */
    getOutline(): number | true | undefined;
    /**
     * Sets the `title` attribute on the marker's root element (native tooltip).
     * @param title - Tooltip string, or `undefined` to remove the attribute.
     */
    setTitle(title: MapTilerMarkerOptions["title"]): void;
    /** Returns the current title string. */
    getTitle(): string | undefined;
    /**
     * Sets the text content displayed inside the marker body.
     * @param content - Label string, or `undefined` to clear.
     */
    setContent(content: MapTilerMarkerOptions["content"]): void;
    /** Returns the current content string. */
    getContent(): string | undefined;
    /**
     * Sets the rendering priority.
     * @param priority - Numeric priority, a MapLibre-style expression, or
     *   `undefined` to restore DOM-order stacking.
     */
    setPriority(priority: MapTilerMarkerOptions["priority"]): void;
    /** Returns the current rendering priority, or `undefined` if never set. */
    getPriority(): number | import('./types').MarkerPriorityExpression | undefined;
    /**
     * Shows or hides the debug overlay, which renders the marker's bounding
     * box and center point on top of the marker element.
     * @param debug - `true` to show the overlay, `false`/`undefined` to hide it.
     */
    setDebug(debug: MapTilerMarkerOptions["debug"]): void;
    /** Returns whether the debug overlay is currently enabled. */
    getDebug(): boolean;
    /**
     * Rotates the marker's inner shell element in degrees, via the CSS
     * `scale(x, y) rotate(deg)` transform on the inner wrapper — independent
     * of MapLibre's own rotation on the outer container.
     * @param rotation - Clockwise rotation in degrees.
     */
    setRotation(rotation: number): this;
    /**
     * Returns the current inner-shell rotation in degrees.
     * @returns Rotation in degrees; `0` if never set.
     */
    getRotation(): number;
    private attachUIStateListeners;
    /** Blurs the marker's focusable element. Called by {@link MarkerManager} on map `click`. */
    [ClearFocusStateSymbol](): void;
    private setUIStateActive;
    private applyUIStates;
    /**
     * Registers (or replaces) the property overrides applied while `name` is
     * active. Applies immediately if that state is currently active.
     * @param name - UI state to configure.
     * @param spec - Property overrides to apply while the state is active.
     */
    setUIState(name: MapTilerMarkerUIStateName, spec: UIStateSpec): void;
    /**
     * Configures (or clears) the easing used the next time `property` changes.
     * @param property - Transitionable property to configure.
     * @param transition - `[duration, easing?, delay?]` in milliseconds, or `null` to make future changes snap immediately again.
     */
    setTransitionForProperty(property: MarkerTransitionProperty, transition: MarkerTransitionSpec | null): void;
    /** Returns a copy of the currently configured per-property transitions. */
    getTransitions(): MapTilerMarkerTransitions;
    /**
     * Applies `to` to `property`, either immediately or by easing from `from`
     * when a transition is configured. Fires `transitionstart`/`transitionend`.
     * @param property - Transitionable property being changed.
     * @param from - Current value.
     * @param to - Value being set.
     * @param codec - Bridges `T` to/from the flat numeric props the underlying animation interpolates.
     * @param apply - Writes an interpolated (or the immediate) value to the marker.
     */
    private applyTransitionable;
    /** Cancels any transition in flight for `property`, leaving its current (mid-transition) value as-is. */
    private cancelTransition;
    /** Cancels every transition in flight. Called on removal so a destroyed marker's props can't keep animating. */
    private cancelAllTransitions;
    /** Runs `preset`'s enter/exit motion (opacity + scale + lift) from `from` to `to`. */
    private playLifecycleTransition;
    /** Runs a `custom` enter/exit animation: an eased `0`→`1` alpha handed to `spec.custom` every frame. */
    private playCustomLifecycleAnimation;
    /** Clears the enter-mask opacity set at construction. Idempotent, safe to call unconditionally — each enter/exit path (preset or `custom`) is responsible for calling it on its own first frame, since the SDK can't know in advance whether a `custom` callback touches opacity. */
    private clearEnterMask;
    /** Plays the configured `enter` animation, easing from {@link enterPresetHiddenValue} up to the marker's own configured state. */
    private playEnterAnimation;
    /** Plays the configured `exit` animation, easing from the marker's own configured state down to {@link exitPresetHiddenValue}. */
    private playExitAnimation;
    /** Wires play/iteration/stop bookkeeping around a `value`-keyframed animation, and plays it. */
    private runIdleAnimation;
    /** Starts the configured `idle` loop — `preset`'s single channel (see {@link IDLE_PRESET_CONFIG}), or a `custom` callback fed a `0`→`1` alpha. */
    private startIdleAnimation;
    /** Stops the currently-looping `idle` animation, if any, leaving the marker at its current (mid-loop) state. */
    private stopIdleAnimation;
    /**
     * Sets altitude in meters above the ground plane (negative is fine — below
     * ground/sea level), faked via a per-frame pixel offset. `options.relativeTo`
     * (default `"ground"`) picks what the meters are measured from. There is
     * deliberately no fast path for `meters: 0`: MapLibre's native marker
     * position is already terrain-elevated whenever the map has terrain, so
     * doing nothing at `0` would leave the marker on the terrain, not at
     * ground/sea level.
     *
     * Pass `false` to unset: deregisters and clamps to MapLibre's own native
     * (terrain-aware) position, same as a marker that never called this.
     * @param meters - Altitude in meters, measured per `options.relativeTo`, or `false` to unset altitude entirely.
     * @param options - See {@link SetAltitudeOptions}. Ignored when `meters` is `false`.
     */
    setAltitude(meters: false): this;
    setAltitude(meters: number, options?: SetAltitudeOptions): this;
    /** Returns the current altitude in meters, or 0 if never set. */
    getAltitude(): number;
    /** Returns what {@link getAltitude}'s meters are measured from. Defaults to `"ground"`. */
    getAltitudeReference(): AltitudeReference;
    /** True from the first {@link setAltitude} call onward. */
    hasActiveAltitude(): boolean;
    /** Stamps `altitude`/`altitudeReference`/`altitudeEngaged` onto every `dragstart`/`drag`/`dragend` event. */
    fire(event: string | {
        type: string;
    }, properties?: Record<string, unknown>): this;
    /**
     * Toggles a dashed line from the marker down (or up) to its ground point.
     * Off by default. See `.maptiler-marker-groundline` in
     * the SDK stylesheet and {@link GroundLineOptions.className}.
     * @param enabled - Whether to show the line.
     * @param options - Optional extra CSS class for styling.
     */
    setGroundLine(enabled: boolean, options?: GroundLineOptions): this;
    /**
     * Per-frame altitude hook, called by {@link MarkerManager} for every altitude-active marker. Returns the elevated point's camera depth (used to rank z-index among altitude-active markers), or `null` when off-screen/behind the camera.
     */
    [ApplyAltitudeFrameSymbol](matrix: mat4, map: SDKMap): number | null;
    /** Idempotent toggle for {@link altitudeHidden} — cheap to call every frame regardless of whether the state actually changed. */
    private setAltitudeHidden;
    /** Idempotent toggle for {@link altitudeOccluded} — cheap to call every frame regardless of whether the state actually changed. */
    private setAltitudeOccluded;
    /**
     * Creates/updates/removes the ground-line element. Geometry (position/width/rotation) comes from {@link altitudeDelta}/{@link groundLineOrigin}. Lives in a shared container at the map level ({@link MarkerManager.getGroundLineContainer}), not nested in this marker's own element — otherwise a long line would inherit its marker's camera-depth z-index and could paint over another marker's icon.
     */
    private updateGroundLineElement;
    /** Removes the marker from the DOM directly, bypassing {@link MarkerManager}. */
    [DetachFromDOMSymbol](): void;
    /** Removes the marker, playing the configured `exit` animation first (if any) before detaching from the DOM. */
    remove(): this;
    /** Deregisters (if registered) and detaches from the DOM immediately — no exit animation. */
    private detachImmediately;
}
