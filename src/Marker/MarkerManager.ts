import type { Marker } from "./Marker";
import type { Map as SDKMap } from "../Map";
import type { mat4 } from "gl-matrix";
import { CollisionBehaviour } from "./types";
import type { MarkerCollisionAccuracy, MarkerCollisionGroups, MarkerCollisionKind, MarkerCollisionOptions } from "./types";
import {
  computeMarkerOBB,
  obbToAABB,
  obbIntersect,
  deriveCollisionGroups,
  inflateBounds,
  boundsIntersect,
  resolveDisplayStates,
  DEFAULT_PROXIMITY_PADDING,
  type Bounds,
  type OBB,
  type ResolutionEntry,
  type ResolutionMode,
} from "./collision-helpers";
import { applyCollisionCulled, COLLISION_FADE_DURATION_MS } from "./marker-dom-utils";
import {
  DetachFromDOMSymbol,
  FlushDOMUpdatesSymbol,
  RefreshAdaptiveColorSymbol,
  PendingUpdatesSymbol,
  CollisionFootprintSymbol,
  EmitCollisionDiffSymbol,
  ApplyCollisionDisplayStateSymbol,
  ApplyAltitudeFrameSymbol,
  MeasuredElementSizeSymbol,
  MarkerElementSymbol,
  ClearFocusStateSymbol,
} from "./marker-symbols";

/** Pending props that change a marker's footprint and therefore its collisions. */
const FOOTPRINT_PROPS = ["shape", "size", "scale", "rotation"] as const;

/**
 * Minimum margin in CSS px around the viewport within which markers still
 * participate in the pass. Off-viewport markers are excluded and hidden, but
 * a marker just past the edge must keep blocking its on-screen neighbours,
 * or edge behaviour would churn while panning.
 */
const VIEWPORT_CULL_MARGIN_PX = 200;

/**
 * Base z-index for camera-depth ordering among altitude-active markers (see
 * the altitude render loop's `onRender`). Well above the small integers
 * `priority` typically produces, so depth-ordered altitude markers land
 * above statically-ordered ones rather than interleaving with them —
 * "closer to the camera" is a different axis from "higher priority", and
 * mixing the two into one ranking isn't attempted here.
 */
const ALTITUDE_Z_INDEX_BASE = 1000;

/** Per-map state of the collision detection engine. */
type MapCollisionState = {
  /** Collision sets from the previous pass, per kind, keyed by marker id — the diffing baseline for enter/exit events. */
  previous: Record<MarkerCollisionKind, Map<string, Set<Marker>>>;
  /** Groups from the latest pass. */
  groups: MarkerCollisionGroups;
  /** Proximity threshold in CSS px (overlap always uses 0). */
  proximityPadding: number;
  /** Collision box accuracy: `high` tests rotated boxes exactly, `low` tests their enclosing upright boxes. */
  accuracy: MarkerCollisionAccuracy;
  /** Map-wide default collision behaviour; a marker's own `collisionBehaviour` overrides it. */
  behaviour: CollisionBehaviour;
  /** Duration in ms of the hide/show/minimize fade transition. */
  transitionDuration: number;
  /** CSS easing function for the fade transition. */
  transitionEasing: string;
};

/** Per-map state of the altitude render loop — one shared no-op layer + `render` listener for every altitude-active marker on that map. */
type MapAltitudeState = {
  /** Markers currently faking altitude on this map. Empty ⇒ torn down. */
  participants: Set<Marker>;
  /** Id of the no-op custom layer used purely to read the projection matrix out of MapLibre's render pass. */
  layerId: string;
  /** The matrix captured by the layer's `render()` this frame; null until the first frame after installation. */
  currentMatrix: mat4 | null;
  /**
   * `args.defaultProjectionData.projectionTransition` from that same frame —
   * 0 (pure mercator) or 1 (pure globe) at rest, fractional mid-morph
   * between projections. `getMatrixForModel`'s per-projection placement (see
   * altitude-math.ts) has no defined meaning at fractional values, so the
   * render loop freezes markers at their last good position rather than
   * projecting through a blend it can't represent — same guard
   * maptiler-3d-js's Layer3D uses for its 3D models.
   */
  currentProjectionTransition: number | null;
  installed: boolean;
  renderListener: (() => void) | null;
  styleLoadListener: (() => void) | null;
  terrainListener: (() => void) | null;
  /**
   * Shared container for every marker's ground-line element on this map —
   * a sibling of the marker elements (not nested inside any one marker's own
   * z-indexed element), pinned to a low z-index so lines never paint on top
   * of a marker's icon. See {@link MarkerManagerImpl.getGroundLineContainer}.
   */
  groundLineContainer: HTMLDivElement;
};

/** One marker's resolved geometry within a detection pass. */
type CollisionEntry = {
  index: number;
  marker: Marker;
  /** Exact rotated box — the narrow-phase test at `high` accuracy. */
  obb: OBB;
  /** Upright box enclosing `obb` — the overlap test at `low` accuracy. */
  bounds: Bounds;
  /** `bounds` inflated by half the proximity padding — the broad-phase / `low`-accuracy proximity box. */
  proximityBounds: Bounds;
  /** `false` when the box is axis-aligned, letting pair tests skip the SAT entirely. */
  rotated: boolean;
};

const EMPTY_MARKER_SET: ReadonlySet<Marker> = new Set();

/** Numeric priority for behaviour resolution. */
function numericPriority(marker: Marker): number {
  const priority = marker.getPriority();
  // TODO: evaluate MapLibre-style priority expressions
  return typeof priority === "number" ? priority : 0;
}

/**
 * @class MarkerManagerImpl
 * @description This singleton is used to batch marker updates and flush them to the DOM in a
 * single animation frame to avoid multiple separate attribute writes
 * It is not exposed as a public API and only used internally in the `Map` and `Marker` classes.
 * It _may_ be used by multiple Maps.
 */
class MarkerManagerImpl {
  //#region State

  // the markers that require updates
  private readonly dirty = new Set<Marker>();

  // the current rAF ID
  private animationFrameID: number | null = null;

  // A WeakMap to store which Marker belongs to which Map.
  // When a map is removed from the page the WeakMap clears the state, so no manual clean up needed.
  private readonly markerMap = new WeakMap<Marker, SDKMap>();

  // Lookup in the opposite direction, gets the markers for a given map.
  // When a map is removed from the page the WeakMap clears the state, so no manual clean up needed.
  private readonly mapIndex = new WeakMap<SDKMap, Map<string, Marker>>();

  // Last style id seen per map — used to skip redundant adaptive-colour
  // refreshes, since `styledata` fires many times per style load.
  private readonly lastStyleId = new WeakMap<SDKMap, string | undefined>();

  // Per-map collision detection state (previous pass, groups, config).
  private readonly collisionState = new WeakMap<SDKMap, MapCollisionState>();

  // Maps with a collision pass pending on the next animation frame. All
  // invalidations coalesce here so a bulk add runs the pass once, not N times.
  private readonly collisionPending = new Set<SDKMap>();

  // Per-marker drag handlers (`drag` + `dragend`), kept so deregister can detach them.
  private readonly dragEndHandlers = new WeakMap<Marker, () => void>();

  // Per-map altitude render-loop state (see MapAltitudeState).
  private readonly altitudeState = new WeakMap<SDKMap, MapAltitudeState>();
  private altitudeLayerSequence = 0;

  //#endregion

  //#region Internal

  // Queues the DOM updates into an animation frame (if updates aren't already scheduled)
  private scheduleFlush() {
    // If there is already an update waiting, the changes will be on the next update
    if (this.animationFrameID !== null) return;
    this.animationFrameID = requestAnimationFrame(() => {
      this.animationFrameID = null;
      this.flushUpdates();
    });
  }

  // lazy initialisation of map indexes
  private getOrCreateIndex(map: SDKMap): Map<string, Marker> {
    const existing = this.mapIndex.get(map);
    if (existing) return existing;

    const index = new Map<string, Marker>();
    this.mapIndex.set(map, index);
    // re-resolve adaptive marker colours whenever the map's style changes.
    // The listener lives on the map itself, so it is released with the map.
    map.on("styledata", () => {
      this.refreshAdaptiveColors(map);
    });

    // DragPan prevents mousedown's default action on the map container, so
    // focus never naturally moves off a marker on a background click — clear
    // any stuck `focus` state explicitly here instead.
    map.on("click", (e) => {
      const clickTarget = e.originalEvent.target as Node | null;
      for (const marker of index.values()) {
        if (clickTarget && marker[MarkerElementSymbol].contains(clickTarget)) continue;
        marker[ClearFocusStateSymbol]();
      }
    });

    return index;
  }

  // queues an adaptive-colour re-resolution for every marker of a map,
  // skipping when the style id has not actually changed
  private refreshAdaptiveColors(map: SDKMap): void {
    const styleId = this.getMapStyleId(map);
    if (this.lastStyleId.get(map) === styleId) return;
    this.lastStyleId.set(map, styleId);

    const index = this.mapIndex.get(map);
    if (!index) return;
    for (const marker of index.values()) {
      marker[RefreshAdaptiveColorSymbol]();
    }
  }

  //#endregion

  //#region Registration

  // registers a marker to be managed, called internally in Map.addMarker
  register(marker: Marker, map: SDKMap): void {
    // maplibre's addTo() starts with this.remove() (detach from any previous
    // map), which routes through our remove() override and would deregister
    // the marker we are registering — add first, track after
    marker.addTo(map);

    this.markerMap.set(marker, map);

    this.getOrCreateIndex(map).set(marker.id, marker);

    // custom elements have unknowable geometry — measure once, now that the
    // element is in the DOM, so collision passes never have to touch layout.
    // An SVG root can be supplied as the marker element and SVG has no
    // offsetWidth — use the bounding rect there
    const customElement = marker.options.element;
    if (customElement && !marker[MeasuredElementSizeSymbol]) {
      if (customElement instanceof HTMLElement) {
        marker[MeasuredElementSizeSymbol] = [customElement.offsetWidth, customElement.offsetHeight];
      } else {
        // unreachable per the typings, but plain-JS callers can pass an SVG
        // root, which has no offsetWidth
        const rect = (customElement as Element).getBoundingClientRect();
        marker[MeasuredElementSizeSymbol] = [rect.width, rect.height];
      }
    }

    // dragging moves the marker with no map event to re-run detection on;
    // `drag` fires per pointer move and the pass is rAF-coalesced. Dragging
    // also doesn't move the camera, so it doesn't imply a map repaint on its
    // own — an altitude-active marker needs one anyway (its offset/ground
    // line are computed inside the render loop, not written by drag itself).
    const onDrag = () => {
      this.invalidateCollisions(map);
      if (marker.hasActiveAltitude()) map.triggerRepaint();
    };
    marker.on("drag", onDrag);
    marker.on("dragend", onDrag);
    this.dragEndHandlers.set(marker, onDrag);

    this.invalidateCollisions(map);

    // adaptive colours could only resolve to `base` before the marker had a
    // map — re-resolve against this map's style
    marker[RefreshAdaptiveColorSymbol]();

    // altitude may have been set before the marker had a map (setAltitude()
    // no-ops with nowhere to register); pick that up now
    if (marker.hasActiveAltitude()) this.registerAltitudeParticipant(marker, map);
  }

  // unregisters a Marker that no longer needs to be managed. `deferDetach`
  // skips the final DOM detach — used by Marker.remove() to play an exit
  // animation while every other bookkeeping (index, collisions, drag
  // handlers) updates immediately, same as a normal removal.
  deregister(marker: Marker, options?: { deferDetach?: boolean }): void {
    const map = this.markerMap.get(marker);

    if (!map) return;

    this.markerMap.delete(marker);
    this.mapIndex.get(map)?.delete(marker.id);
    this.cancelCuedUpdatesForMarker(marker);
    this.deregisterAltitudeParticipant(marker, map);

    const onDrag = this.dragEndHandlers.get(marker);
    if (onDrag) {
      marker.off("drag", onDrag);
      marker.off("dragend", onDrag);
      this.dragEndHandlers.delete(marker);
    }

    // drop the marker's own collision baseline; counterparts still holding it
    // in theirs get their exit events from the pass scheduled below
    const state = this.collisionState.get(map);
    if (state) {
      state.previous.overlap.delete(marker.id);
      state.previous.proximity.delete(marker.id);
    }
    // leave the marker in its natural state in case it is re-added elsewhere
    marker[ApplyCollisionDisplayStateSymbol]("visible");
    this.invalidateCollisions(map);

    if (!options?.deferDetach) marker[DetachFromDOMSymbol]();
  }

  // As above but with a Markers ID instead.
  deregisterById(map: SDKMap, id: string): void {
    const marker = this.mapIndex.get(map)?.get(id);
    if (marker) this.deregister(marker);
  }

  // removes all markers, or a specified list of markers by ID, from a map
  deregisterAll(map: SDKMap, ids?: string[]): void {
    const index = this.mapIndex.get(map);
    if (!index) return;
    // copy before iterating — deregister mutates the index
    const markers = ids ? ids.map((id) => index.get(id)) : [...index.values()];
    for (const marker of markers) {
      if (marker) this.deregister(marker);
    }
  }

  //#endregion

  //#region Queries

  // gets the map a marker belongs to
  getMap(marker: Marker): SDKMap | undefined {
    return this.markerMap.get(marker);
  }

  /**
   * Returns the id of the map's current style (e.g. `"streets-v4-dark"`), or
   * `undefined` when it cannot be determined (custom style spec / URL).
   * Falls back to the raw stylesheet's `id` field, since the id is not part
   * of the serialized `StyleSpecification` returned by `map.getStyle()`.
   */
  getMapStyleId(map: SDKMap): string | undefined {
    const requestedId = map.getStyleId();
    if (requestedId) return requestedId;

    const stylesheet = map.style.stylesheet as { id?: unknown } | undefined;
    return typeof stylesheet?.id === "string" ? stylesheet.id : undefined;
  }

  // gets the markers for a given map
  getMarkers(map: SDKMap): Marker[] {
    const index = this.mapIndex.get(map);
    return index ? Array.from(index.values()) : [];
  }

  // gets a specific marker from a specific map
  getMarker(map: SDKMap, id: string): Marker | undefined {
    return this.mapIndex.get(map)?.get(id);
  }

  //#endregion

  //#region DOM Updates

  // iterates through the markers that require updates and applies then to the DOM.
  flushUpdates() {
    for (const marker of this.dirty) {
      // a footprint-changing prop means this marker's collisions may change
      if (FOOTPRINT_PROPS.some((prop) => prop in marker[PendingUpdatesSymbol])) {
        const map = this.markerMap.get(marker);
        if (map) this.collisionPending.add(map);
      }
      marker[FlushDOMUpdatesSymbol]();
    }

    // clear updates.
    this.dirty.clear();

    // detection runs in the same frame, after the DOM writes; it reads only
    // props and map.project(), never the DOM, so ordering is for cadence only
    const pending = [...this.collisionPending];
    this.collisionPending.clear();
    for (const map of pending) {
      this.runCollisionPass(map);
    }
  }

  // called when a marker state is updated
  addMarkerUpdateToQueue(marker: Marker): void {
    this.dirty.add(marker);
    this.scheduleFlush();
  }

  // abort any updates
  cancelCuedUpdatesForMarker(marker: Marker): void {
    this.dirty.delete(marker);
  }

  //#endregion

  //#region Collision Detection

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
  invalidateCollisions(map: SDKMap): void {
    this.getOrCreateCollisionState(map);
    this.collisionPending.add(map);
    this.scheduleFlush();
  }

  /**
   * Collision groups from the latest detection pass: the full sets of
   * mutually-colliding markers, with no priority or winner/loser resolution.
   * The behaviour layer consumes these to decide what to do about collisions.
   */
  getCollisionGroups(map: SDKMap): MarkerCollisionGroups {
    return this.collisionState.get(map)?.groups ?? { overlap: [], proximity: [] };
  }

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
  setCollisionOptions(map: SDKMap, options: MarkerCollisionOptions): void {
    const state = this.getOrCreateCollisionState(map);
    if (options.proximityPadding !== undefined) state.proximityPadding = options.proximityPadding;
    if (options.accuracy !== undefined) state.accuracy = options.accuracy;
    if (options.behaviour !== undefined) state.behaviour = options.behaviour;
    if (options.transitionDuration !== undefined) state.transitionDuration = options.transitionDuration;
    if (options.transitionEasing !== undefined) state.transitionEasing = options.transitionEasing;
    this.applyCollisionTransitionVars(map, state);
    this.invalidateCollisions(map);
  }

  /** Returns the fade-transition duration (ms) configured for `map`, or the SDK default if never configured. */
  getCollisionTransitionDuration(map: SDKMap): number {
    return this.collisionState.get(map)?.transitionDuration ?? COLLISION_FADE_DURATION_MS;
  }

  // exposes the per-map fade duration/easing to CSS, so the collision fade
  // classes (defined once in the stylesheet) pick up per-map overrides
  private applyCollisionTransitionVars(map: SDKMap, state: MapCollisionState): void {
    const container = map.getContainer();
    container.style.setProperty("--maptiler-collision-transition-duration", `${state.transitionDuration}ms`);
    container.style.setProperty("--maptiler-collision-transition-easing", state.transitionEasing);
  }

  // lazily creates the per-map collision state and attaches the camera
  // trigger; `remove` tears both down along with any pending pass
  private getOrCreateCollisionState(map: SDKMap): MapCollisionState {
    const existing = this.collisionState.get(map);
    if (existing) return existing;

    const state: MapCollisionState = {
      previous: { overlap: new Map(), proximity: new Map() },
      groups: { overlap: [], proximity: [] },
      proximityPadding: DEFAULT_PROXIMITY_PADDING,
      accuracy: "high",
      behaviour: CollisionBehaviour.ALWAYS_SHOW,
      transitionDuration: COLLISION_FADE_DURATION_MS,
      transitionEasing: "ease",
    };
    this.collisionState.set(map, state);
    this.applyCollisionTransitionVars(map, state);

    // the pass runs when movement settles — during camera movement markers
    // track their positions via MapLibre's own per-frame update, and in
    // dense fields the pass is quadratic in overlapping pairs, too heavy
    // for the per-frame path. States flip at rest, so the fades get to play.
    const onMoveEnd = () => {
      this.invalidateCollisions(map);
    };
    map.on("moveend", onMoveEnd);
    void map.once("remove", () => {
      map.off("moveend", onMoveEnd);
      this.collisionPending.delete(map);
      this.collisionState.delete(map);
    });

    return state;
  }

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
  private runCollisionPass(map: SDKMap): void {
    const state = this.collisionState.get(map);
    const index = this.mapIndex.get(map);
    if (!state || !index) return;

    const bearing = map.getBearing();
    // half on each box: two inflated boxes touch exactly when the gap
    // between the exact boxes is the full padding
    const halfPadding = state.proximityPadding / 2;
    const exact = state.accuracy === "high";

    const canvas = map.getCanvas();
    const viewport: Bounds = {
      left: -VIEWPORT_CULL_MARGIN_PX,
      top: -VIEWPORT_CULL_MARGIN_PX,
      right: canvas.clientWidth + VIEWPORT_CULL_MARGIN_PX,
      bottom: canvas.clientHeight + VIEWPORT_CULL_MARGIN_PX,
    };

    const entries: CollisionEntry[] = [];
    const offscreen: Marker[] = [];
    for (const marker of index.values()) {
      const footprint = marker[CollisionFootprintSymbol]();
      const angle = (footprint.mapAligned ? bearing : 0) + footprint.rotation;
      // the box is rebuilt from a fresh projection every pass — the camera
      // has usually moved since the last one, so caching it would lie
      const obb = computeMarkerOBB(map.project(marker.getLngLat()), footprint, angle);
      const bounds = obbToAABB(obb);
      if (!boundsIntersect(bounds, viewport)) {
        offscreen.push(marker);
        continue;
      }
      entries.push({
        index: entries.length,
        marker,
        obb,
        bounds,
        proximityBounds: inflateBounds(bounds, halfPadding),
        rotated: angle % 360 !== 0,
      });
    }

    for (const marker of offscreen) {
      marker[ApplyCollisionDisplayStateSymbol]("hidden");
    }

    // overlap and proximity are the same test at different paddings, with the
    // inflated upright boxes as the broad phase (they can over-include but
    // never miss). The SAT narrow phase only runs at high accuracy when a box
    // in the pair is actually rotated — for axis-aligned pairs the upright
    // boxes *are* the exact boxes. The plain j > i loop is deliberate: dense
    // fields make this the hottest code in the engine, and it allocates
    // nothing per pair.
    const overlapPairs: [number, number][] = [];
    const proximityPairs: [number, number][] = [];
    const next: Record<MarkerCollisionKind, Map<string, Set<Marker>>> = { overlap: new Map(), proximity: new Map() };

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      for (let j = i + 1; j < entries.length; j++) {
        const other = entries[j];
        if (!boundsIntersect(entry.proximityBounds, other.proximityBounds)) continue;
        const needsSat = exact && (entry.rotated || other.rotated);
        if (needsSat && !obbIntersect(entry.obb, other.obb, halfPadding)) continue;
        proximityPairs.push([i, j]);
        this.linkCollision(next.proximity, entry.marker, other.marker);
        const overlaps = needsSat ? obbIntersect(entry.obb, other.obb) : boundsIntersect(entry.bounds, other.bounds);
        if (overlaps) {
          overlapPairs.push([i, j]);
          this.linkCollision(next.overlap, entry.marker, other.marker);
        }
      }
    }

    state.groups = {
      overlap: deriveCollisionGroups(entries, overlapPairs).map((group) => group.map((entry) => entry.marker)),
      proximity: deriveCollisionGroups(entries, proximityPairs).map((group) => group.map((entry) => entry.marker)),
    };

    this.emitCollisionDiffs(index, state.previous.proximity, next.proximity, "proximity");
    this.emitCollisionDiffs(index, state.previous.overlap, next.overlap, "overlap");
    state.previous = next;

    this.applyCollisionBehaviours(map, state, entries);
  }

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
  private applyCollisionBehaviours(map: SDKMap, state: MapCollisionState, entries: CollisionEntry[]): void {
    const resolution: ResolutionEntry[] = entries.map((entry) => {
      const behaviour = this.effectiveBehaviour(entry.marker, state);
      const mode: ResolutionMode = behaviour === CollisionBehaviour.HIDE_BY_PRIORITY ? "hide" : behaviour === CollisionBehaviour.MINIMIZE_BY_PRIORITY ? "minimize" : "always";
      return { mode, priority: numericPriority(entry.marker), obb: entry.obb };
    });

    const displayStates = resolveDisplayStates(resolution, state.accuracy === "high");

    // re-enter rendering for everything that shows this pass, then flush
    // layout ONCE — the fade-in needs a reflow between un-cull and un-hide,
    // and doing it inside the per-marker apply would force one layout per
    // marker (a dense zoom threshold un-hiding hundreds stalled for frames)
    // reduce (not `.some`) — every visible marker must be un-culled; short-circuit would skip the rest
    const needsReflow = entries.reduce(
      (needs, entry) => (displayStates[entry.index] === "hidden" ? needs : applyCollisionCulled(entry.marker.getElement(), false) || needs),
      false,
    );
    if (needsReflow) void map.getContainer().offsetWidth;

    for (const entry of entries) {
      entry.marker[ApplyCollisionDisplayStateSymbol](displayStates[entry.index]);
    }
  }

  /** Resolves a marker's collision behaviour against the map default. */
  private effectiveBehaviour(marker: Marker, state: MapCollisionState): CollisionBehaviour {
    return marker.options.collisionBehaviour ?? state.behaviour;
  }

  private getOrCreateCollisionSet(sets: Map<string, Set<Marker>>, id: string): Set<Marker> {
    const existing = sets.get(id);
    if (existing) return existing;
    const created = new Set<Marker>();
    sets.set(id, created);
    return created;
  }

  // records a colliding pair in both markers' collision sets
  private linkCollision(sets: Map<string, Set<Marker>>, a: Marker, b: Marker): void {
    this.getOrCreateCollisionSet(sets, a.id).add(b);
    this.getOrCreateCollisionSet(sets, b.id).add(a);
  }

  /** Allocation-free set equality — dense passes must not allocate for unchanged collisions. */
  private collisionSetsEqual(a: ReadonlySet<Marker>, b: ReadonlySet<Marker>): boolean {
    if (a.size !== b.size) return false;
    for (const item of b) {
      if (!a.has(item)) return false;
    }
    return true;
  }

  // diffs each marker's collision set against the previous pass and has the
  // marker emit only the transitions — unchanged collisions stay silent
  private emitCollisionDiffs(index: Map<string, Marker>, previous: Map<string, Set<Marker>>, next: Map<string, Set<Marker>>, kind: MarkerCollisionKind): void {
    for (const marker of index.values()) {
      const previousSet = previous.get(marker.id) ?? EMPTY_MARKER_SET;
      const nextSet = next.get(marker.id) ?? EMPTY_MARKER_SET;

      // allocation-free steady-state check first: in a dense field a pass
      // carries thousands of *unchanged* collisions, and building the
      // entered/exited arrays for all of them is pure garbage-collector load
      if (this.collisionSetsEqual(previousSet, nextSet)) continue;

      const entered = [...nextSet].filter((counterpart) => !previousSet.has(counterpart));
      const exited = [...previousSet].filter((counterpart) => !nextSet.has(counterpart));
      if (entered.length === 0 && exited.length === 0) continue;
      marker[EmitCollisionDiffSymbol]({ kind, entered, exited, current: [...nextSet] });
    }
  }

  //#endregion

  //#region Altitude

  /**
   * Starts driving `marker`'s per-frame altitude projection on `map`. Shared
   * across every altitude-active marker on the map — several markers here
   * still cost one no-op custom layer and one `render` listener, not one
   * each. Called by {@link Marker.setAltitude} (and by {@link register} for
   * a marker whose altitude was set before it had a map).
   */
  registerAltitudeParticipant(marker: Marker, map: SDKMap): void {
    const state = this.getOrCreateAltitudeState(map);
    state.participants.add(marker);
    this.ensureAltitudeLayerInstalled(map, state);
  }

  /** Stops driving `marker`'s altitude projection. Tears down the shared layer/listener once the last participant on `map` leaves. */
  deregisterAltitudeParticipant(marker: Marker, map: SDKMap): void {
    const state = this.altitudeState.get(map);
    if (!state) return;
    state.participants.delete(marker);
    if (state.participants.size === 0) this.teardownAltitudeLayer(map, state);
  }

  /**
   * The shared, always-behind-markers container every marker's ground-line
   * element gets appended to on this map — a sibling of the marker elements
   * (both live in `map.getCanvasContainer()`), not a descendant of any one
   * marker, so a long line can never inherit a marker's camera-depth
   * z-index and paint over some *other* marker's icon. Created together
   * with the rest of the per-map altitude state.
   */
  getGroundLineContainer(map: SDKMap): HTMLDivElement {
    return this.getOrCreateAltitudeState(map).groundLineContainer;
  }

  // lazily creates the per-map altitude state; final cleanup on map removal
  // mirrors getOrCreateCollisionState's — release what this added, nothing
  // heavier, since the map itself is already going away
  private getOrCreateAltitudeState(map: SDKMap): MapAltitudeState {
    const existing = this.altitudeState.get(map);
    if (existing) return existing;

    const groundLineContainer = document.createElement("div");
    groundLineContainer.style.position = "absolute";
    groundLineContainer.style.inset = "0";
    groundLineContainer.style.pointerEvents = "none";
    // No z-index here, deliberately — a negative one would drop this into
    // the CSS "negative z-index" stacking bucket, which paints BEHIND the
    // map's own WebGL canvas (z-index: auto, i.e. the normal/0 bucket) —
    // the lines would still render, just hidden behind the opaque map
    // surface. Instead this relies on DOM order within that same normal
    // bucket: inserted right after the canvas (so it's above the map), and
    // every marker element is `appendChild`ed later (so markers, later in
    // DOM order, always paint on top of this) — markers with an explicit
    // z-index (`priority`, or the camera-depth ranking altitude-active
    // markers get) are in a higher bucket regardless and stay on top too.
    map.getCanvas().after(groundLineContainer);

    const state: MapAltitudeState = {
      participants: new Set(),
      layerId: `__maptiler-altitude-capture-${String(this.altitudeLayerSequence++)}__`,
      currentMatrix: null,
      currentProjectionTransition: null,
      installed: false,
      renderListener: null,
      styleLoadListener: null,
      terrainListener: null,
      groundLineContainer,
    };
    this.altitudeState.set(map, state);

    void map.once("remove", () => {
      if (state.renderListener) map.off("render", state.renderListener);
      if (state.styleLoadListener) map.off("style.load", state.styleLoadListener);
      if (state.terrainListener) {
        map.off("terrain", state.terrainListener);
        map.off("terrainAnimationStop", state.terrainListener);
        map.off("loadWithTerrain", state.terrainListener);
      }
      this.altitudeState.delete(map);
    });

    return state;
  }

  // MapLibre throws if you `addLayer` before the style has finished loading
  // — defer installation until then. Safe to call redundantly; only the
  // first call (with participants still non-empty) actually installs.
  //
  // Waits on "idle", not "load": "load" fires exactly once per map, ever.
  // Markers are almost always registered well *after* the map's initial
  // load (typically from application code that itself awaits load first),
  // so by the time this runs "load" has usually already fired and been
  // consumed — if `isStyleLoaded()` happens to be false at that exact
  // moment (e.g. right after applying a style with extra sources/sprites
  // still settling, like a terrain source), `once("load", ...)` would wait
  // forever for an event that's never coming again. "idle" fires every time
  // the map has no pending work, so it's safe to wait on regardless of
  // where in the map's lifecycle this gets called.
  private ensureAltitudeLayerInstalled(map: SDKMap, state: MapAltitudeState): void {
    if (state.installed) return;
    if (map.isStyleLoaded()) {
      this.installAltitudeLayer(map, state);
      return;
    }
    void map.once("idle", () => {
      this.ensureAltitudeLayerInstalled(map, state);
    });
  }

  private installAltitudeLayer(map: SDKMap, state: MapAltitudeState): void {
    // a pending once('load', ...) can still fire after the last participant
    // left (and teardown already ran) — don't resurrect the layer for nobody
    if (state.installed || state.participants.size === 0) return;
    if (map.getLayer(state.layerId)) return;

    map.addLayer({
      id: state.layerId,
      type: "custom",
      // "2d" is enough — this layer never draws anything, it only reads the
      // projection args MapLibre hands to every custom layer.
      renderingMode: "2d",
      render: (_gl, args) => {
        // MapLibre v5+: render(gl, args: CustomRenderMethodInput).
        // MapLibre v4 called this render(gl, matrix: mat4) — `args` was the
        // matrix itself and `defaultProjectionData` didn't exist.
        state.currentMatrix = args.defaultProjectionData.mainMatrix;
        state.currentProjectionTransition = args.defaultProjectionData.projectionTransition;
      },
    });

    const onRender = () => {
      if (!state.currentMatrix) return;
      // Mid-morph between mercator and globe — freeze rather than project
      // through a blend `getMatrixForModel` can't represent (see
      // `currentProjectionTransition`'s doc comment).
      if (state.currentProjectionTransition !== 0 && state.currentProjectionTransition !== 1) return;

      // Each marker projects itself and reports back its camera depth (or
      // null if off-screen/hidden this frame) — collected here rather than
      // acted on inline so every participant's depth is known before any
      // z-index gets written.
      const depths: { marker: Marker; depth: number }[] = [];
      for (const marker of state.participants) {
        const depth = marker[ApplyAltitudeFrameSymbol](state.currentMatrix, map);
        if (depth !== null) depths.push({ marker, depth });
      }

      // DOM markers have no real depth buffer — without this, a marker
      // that's actually farther from the camera can still render on top of
      // a nearer one purely because of DOM insertion order. Sort far-to-near
      // and assign z-index by rank so nearer always wins, only among this
      // map's altitude-active markers (a marker with no altitude keeps
      // whatever static `priority`-based z-index it already had).
      depths.sort((a, b) => b.depth - a.depth);
      depths.forEach(({ marker }, index) => {
        marker[MarkerElementSymbol].style.zIndex = String(ALTITUDE_Z_INDEX_BASE + index);
      });
    };
    // `setStyle()` tears down every layer, including this one — reinstall
    // once the new style finishes loading so altitude keeps working across
    // style switches.
    const onStyleLoad = () => {
      state.installed = false;
      state.currentMatrix = null;
      this.ensureAltitudeLayerInstalled(map, state);
    };

    // Terrain readiness fires across a few different events, and markers
    // need a fresh `queryTerrainElevation()` (i.e. a repaint) right when any
    // of them land, not just "probably soon after" via some other repaint:
    //  - "terrain": MapLibre's own event, fires as soon as `map.terrain` is
    //    set/unset — early, DEM tiles for a given marker may not be loaded yet.
    //  - "terrainAnimationStop": the SDK's grow/flatten animation (see
    //    `Map.growTerrain`) reaching its target exaggeration — the actual
    //    "terrain is ready and settled" moment for markers already on screen.
    //  - "loadWithTerrain": the SDK's own "map ready with terrain non-null"
    //    event, for the initial-load case (`terrain: true` in the constructor).
    // growTerrain's own rAF loop already calls triggerRepaint() every tick,
    // so onRender above tends to self-heal mid-animation anyway — but that's
    // the same kind of implicit assumption that bit us for
    // setAltitude()-while-idle and drag earlier, so it's not relied on here.
    const onTerrainChange = () => {
      map.triggerRepaint();
    };

    map.on("render", onRender);
    map.on("style.load", onStyleLoad);
    map.on("terrain", onTerrainChange);
    map.on("terrainAnimationStop", onTerrainChange);
    map.on("loadWithTerrain", onTerrainChange);
    state.renderListener = onRender;
    state.styleLoadListener = onStyleLoad;
    state.terrainListener = onTerrainChange;
    state.installed = true;
  }

  // the map is still alive here (unlike the 'remove' cleanup above) — actually remove the layer, not just the listeners
  private teardownAltitudeLayer(map: SDKMap, state: MapAltitudeState): void {
    if (state.renderListener) map.off("render", state.renderListener);
    if (state.styleLoadListener) map.off("style.load", state.styleLoadListener);
    if (state.terrainListener) {
      map.off("terrain", state.terrainListener);
      map.off("terrainAnimationStop", state.terrainListener);
      map.off("loadWithTerrain", state.terrainListener);
    }
    if (map.getLayer(state.layerId)) map.removeLayer(state.layerId);
    state.groundLineContainer.remove();
    state.installed = false;
    state.currentMatrix = null;
    state.renderListener = null;
    state.styleLoadListener = null;
    state.terrainListener = null;
    this.altitudeState.delete(map);
  }

  //#endregion
}

export const MarkerManager = new MarkerManagerImpl();
