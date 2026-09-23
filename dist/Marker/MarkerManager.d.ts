import { Marker } from './Marker';
import { Map as SDKMap } from '../Map';
import { MarkerCollisionGroups, MarkerCollisionOptions } from './types';
/**
 * @class MarkerManagerImpl
 * @description This singleton is used to batch marker updates and flush them to the DOM in a
 * single animation frame to avoid multiple separate attribute writes
 * It is not exposed as a public API and only used internally in the `Map` and `Marker` classes.
 * It _may_ be used by multiple Maps.
 */
declare class MarkerManagerImpl {
    private readonly dirty;
    private animationFrameID;
    private readonly markerMap;
    private readonly mapIndex;
    private readonly lastStyleId;
    private readonly collisionState;
    private readonly collisionPending;
    private readonly dragEndHandlers;
    private readonly altitudeState;
    private altitudeLayerSequence;
    private scheduleFlush;
    private getOrCreateIndex;
    private refreshAdaptiveColors;
    register(marker: Marker, map: SDKMap): void;
    deregister(marker: Marker, options?: {
        deferDetach?: boolean;
    }): void;
    deregisterById(map: SDKMap, id: string): void;
    deregisterAll(map: SDKMap, ids?: string[]): void;
    getMap(marker: Marker): SDKMap | undefined;
    /**
     * Returns the id of the map's current style (e.g. `"streets-v4-dark"`), or
     * `undefined` when it cannot be determined (custom style spec / URL).
     * Falls back to the raw stylesheet's `id` field, since the id is not part
     * of the serialized `StyleSpecification` returned by `map.getStyle()`.
     */
    getMapStyleId(map: SDKMap): string | undefined;
    getMarkers(map: SDKMap): Marker[];
    getMarker(map: SDKMap, id: string): Marker | undefined;
    flushUpdates(): void;
    addMarkerUpdateToQueue(marker: Marker): void;
    cancelCuedUpdatesForMarker(marker: Marker): void;
    /**
     * Requests a full collision detection pass for a map's markers.
     *
     * The single entry point for everything that can change collisions —
     * marker add / remove / move / drag, footprint changes, and camera
     * `moveend`. Requests coalesce onto one animation frame, so a bulk add
     * runs the pass once. During camera movement markers track their positions
     * via MapLibre's own per-frame update; the pass itself only runs when
     * movement settles (dense fields make it quadratic in overlapping pairs).
     */
    invalidateCollisions(map: SDKMap): void;
    /**
     * Collision groups from the latest detection pass: the full sets of
     * mutually-colliding markers, with no priority or winner/loser resolution.
     * The behaviour layer consumes these to decide what to do about collisions.
     */
    getCollisionGroups(map: SDKMap): MarkerCollisionGroups;
    /**
     * Configures collision detection for a map.
     * @param options.proximityPadding - Distance in CSS px within which two
     *   markers count as "in proximity". Overlap always uses 0.
     * @param options.accuracy - `high` (default) tests rotated markers with
     *   their actual rotated box; `low` uses the enclosing upright box, which
     *   is cheaper but over-reports collisions for rotated markers.
     * @param options.behaviour - Default collision behaviour for every marker
     *   on the map; a marker's own `collisionBehaviour` option overrides it.
     *   Defaults to `always-show`.
     * @param options.transitionDuration - Duration in ms of the hide/show/minimize fade. Defaults to `150`.
     * @param options.transitionEasing - CSS easing function for the fade. Defaults to `"ease"`.
     */
    setCollisionOptions(map: SDKMap, options: MarkerCollisionOptions): void;
    /** Returns the fade-transition duration (ms) configured for `map`, or the SDK default if never configured. */
    getCollisionTransitionDuration(map: SDKMap): number;
    private applyCollisionTransitionVars;
    private getOrCreateCollisionState;
    /**
     * The full detection pass. Builds each marker's screen box from its stored
     * footprint and projected position (no DOM reads), finds intersecting
     * pairs, derives collision groups, then diffs against the previous pass so
     * markers only emit enter/exit transitions.
     *
     * Markers outside the (margin-padded) viewport never enter the pass: they
     * are hidden outright — off screen there is nothing to show, and skipping
     * them keeps the pair scan and placement proportional to what is actually
     * visible. They rejoin (and fade back in) on the first pass that finds
     * them near the viewport again. Consequence: collision events and
     * `getCollisionGroups` only cover on-screen markers.
     */
    private runCollisionPass;
    /**
     * The behaviour layer: turns the pass's geometry into display states via
     * greedy priority placement — `hide-by-priority` losers hide (and stop
     * blocking), `minimize-by-priority` losers minimize (and keep reserving
     * their full-size box, so priority order is strict). See
     * {@link resolveDisplayStates}.
     *
     * Hide/minimize act on *overlap* only — the proximity padding stays an
     * events-only concern; `collisionRadius` is the per-marker way to act at a
     * distance.
     */
    private applyCollisionBehaviours;
    /** Resolves a marker's collision behaviour against the map default. */
    private effectiveBehaviour;
    private getOrCreateCollisionSet;
    private linkCollision;
    /** Allocation-free set equality — dense passes must not allocate for unchanged collisions. */
    private collisionSetsEqual;
    private emitCollisionDiffs;
    /**
     * Starts driving `marker`'s per-frame altitude projection on `map`. Shared
     * across every altitude-active marker on the map — several markers here
     * still cost one no-op custom layer and one `render` listener, not one
     * each. Called by {@link Marker.setAltitude} (and by {@link register} for
     * a marker whose altitude was set before it had a map).
     */
    registerAltitudeParticipant(marker: Marker, map: SDKMap): void;
    /** Stops driving `marker`'s altitude projection. Tears down the shared layer/listener once the last participant on `map` leaves. */
    deregisterAltitudeParticipant(marker: Marker, map: SDKMap): void;
    /**
     * The shared, always-behind-markers container every marker's ground-line
     * element gets appended to on this map — a sibling of the marker elements
     * (both live in `map.getCanvasContainer()`), not a descendant of any one
     * marker, so a long line can never inherit a marker's camera-depth
     * z-index and paint over some *other* marker's icon. Created together
     * with the rest of the per-map altitude state.
     */
    getGroundLineContainer(map: SDKMap): HTMLDivElement;
    private getOrCreateAltitudeState;
    private ensureAltitudeLayerInstalled;
    private installAltitudeLayer;
    private teardownAltitudeLayer;
}
export declare const MarkerManager: MarkerManagerImpl;
export {};
