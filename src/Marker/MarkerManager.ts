import type { Marker } from "./Marker";
import type { Map as SDKMap } from "../Map";
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
import { applyCollisionCulled } from "./marker-dom-utils";
import {
  DetachFromDOMSymbol,
  FlushDOMUpdatesSymbol,
  RefreshAdaptiveColorSymbol,
  PendingUpdatesSymbol,
  CollisionFootprintSymbol,
  EmitCollisionDiffSymbol,
  ApplyCollisionDisplayStateSymbol,
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
    // `drag` fires per pointer move and the pass is rAF-coalesced
    const onDrag = () => {
      this.invalidateCollisions(map);
    };
    marker.on("drag", onDrag);
    marker.on("dragend", onDrag);
    this.dragEndHandlers.set(marker, onDrag);

    this.invalidateCollisions(map);

    // adaptive colours could only resolve to `base` before the marker had a
    // map — re-resolve against this map's style
    marker[RefreshAdaptiveColorSymbol]();
  }

  // unregisters a Marker that no longer needs to be managed.
  deregister(marker: Marker): void {
    const map = this.markerMap.get(marker);

    if (!map) return;

    this.markerMap.delete(marker);
    this.mapIndex.get(map)?.delete(marker.id);
    this.cancelCuedUpdatesForMarker(marker);

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

    marker[DetachFromDOMSymbol]();
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
   */
  setCollisionOptions(map: SDKMap, options: MarkerCollisionOptions): void {
    const state = this.getOrCreateCollisionState(map);
    if (options.proximityPadding !== undefined) state.proximityPadding = options.proximityPadding;
    if (options.accuracy !== undefined) state.accuracy = options.accuracy;
    if (options.behaviour !== undefined) state.behaviour = options.behaviour;
    this.invalidateCollisions(map);
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
    };
    this.collisionState.set(map, state);

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
      const mode: ResolutionMode =
        behaviour === CollisionBehaviour.HIDE_BY_PRIORITY
          ? "hide"
          : behaviour === CollisionBehaviour.MINIMIZE_BY_PRIORITY
            ? "minimize"
            : "always";
      return { mode, priority: numericPriority(entry.marker), obb: entry.obb };
    });

    const displayStates = resolveDisplayStates(resolution, state.accuracy === "high");

    // re-enter rendering for everything that shows this pass, then flush
    // layout ONCE — the fade-in needs a reflow between un-cull and un-hide,
    // and doing it inside the per-marker apply would force one layout per
    // marker (a dense zoom threshold un-hiding hundreds stalled for frames)
    // reduce (not `.some`) — every visible marker must be un-culled; short-circuit would skip the rest
    const needsReflow = entries.reduce(
      (needs, entry) =>
        displayStates[entry.index] === "hidden" ? needs : applyCollisionCulled(entry.marker.getElement(), false) || needs,
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
}

export const MarkerManager = new MarkerManagerImpl();
