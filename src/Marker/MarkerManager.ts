import type { Marker } from "./Marker";
import type { Map as SDKMap } from "../Map";
import type { MarkerCollisionGroups, MarkerCollisionKind } from "./types";
import { computeMarkerAABB, createCandidateSource, deriveCollisionGroups, inflateBounds, boundsIntersect, DEFAULT_PROXIMITY_PADDING, type Bounds } from "./collision-helpers";
import {
  DetachFromDOMSymbol,
  FlushDOMUpdatesSymbol,
  RefreshAdaptiveColorSymbol,
  PendingUpdatesSymbol,
  CollisionFootprintSymbol,
  EmitCollisionDiffSymbol,
  MeasuredElementSizeSymbol,
} from "./marker-symbols";

/** Pending props that change a marker's footprint and therefore its collisions. */
const FOOTPRINT_PROPS = ["shape", "size", "scale", "rotation"] as const;

/** Per-map state of the collision detection engine. */
type MapCollisionState = {
  /** Collision sets from the previous pass, per kind, keyed by marker id — the diffing baseline for enter/exit events. */
  previous: Record<MarkerCollisionKind, Map<string, Set<Marker>>>;
  /** Groups from the latest pass. */
  groups: MarkerCollisionGroups;
  /** Proximity threshold in CSS px (overlap always uses 0). */
  proximityPadding: number;
};

/** One marker's resolved geometry within a detection pass. */
type CollisionEntry = {
  index: number;
  marker: Marker;
  /** Exact box — the overlap test. */
  bounds: Bounds;
  /** Box inflated by half the proximity padding — two of these intersecting means the gap is within the padding. */
  proximityBounds: Bounds;
};

const EMPTY_MARKER_SET: ReadonlySet<Marker> = new Set();

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

  // Per-marker `dragend` handlers, kept so deregister can detach them.
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
    let index = this.mapIndex.get(map);

    if (!index) {
      index = new Map();
      this.mapIndex.set(map, index);
      // re-resolve adaptive marker colours whenever the map's style changes.
      // The listener lives on the map itself, so it is released with the map.
      map.on("styledata", () => {
        this.refreshAdaptiveColors(map);
      });
    }

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

    // dragging moves the marker with no map event to re-run detection on
    const onDragEnd = () => {
      this.invalidateCollisions(map);
    };
    marker.on("dragend", onDragEnd);
    this.dragEndHandlers.set(marker, onDragEnd);

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

    const onDragEnd = this.dragEndHandlers.get(marker);
    if (onDragEnd) {
      marker.off("dragend", onDragEnd);
      this.dragEndHandlers.delete(marker);
    }

    // drop the marker's own collision baseline; counterparts still holding it
    // in theirs get their exit events from the pass scheduled below
    const state = this.collisionState.get(map);
    if (state) {
      state.previous.overlap.delete(marker.id);
      state.previous.proximity.delete(marker.id);
    }
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
   * marker add / remove / move, footprint changes, and camera `moveend`.
   * Requests coalesce onto one animation frame, so a bulk add runs the pass
   * once. During camera movement markers track their positions via MapLibre's
   * own per-frame update (the cheap tier); the full pass (the expensive tier)
   * only runs when movement ends.
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
   */
  setCollisionOptions(map: SDKMap, options: { proximityPadding?: number }): void {
    const state = this.getOrCreateCollisionState(map);
    if (options.proximityPadding !== undefined) state.proximityPadding = options.proximityPadding;
    this.invalidateCollisions(map);
  }

  // lazily creates the per-map collision state and attaches the camera
  // trigger; `remove` tears both down along with any pending pass
  private getOrCreateCollisionState(map: SDKMap): MapCollisionState {
    let state = this.collisionState.get(map);

    if (!state) {
      state = {
        previous: { overlap: new Map(), proximity: new Map() },
        groups: { overlap: [], proximity: [] },
        proximityPadding: DEFAULT_PROXIMITY_PADDING,
      };
      this.collisionState.set(map, state);

      const onMoveEnd = () => {
        this.invalidateCollisions(map);
      };
      map.on("moveend", onMoveEnd);
      void map.once("remove", () => {
        map.off("moveend", onMoveEnd);
        this.collisionPending.delete(map);
        this.collisionState.delete(map);
      });
    }

    return state;
  }

  /**
   * The full detection pass. Builds each marker's screen box from its stored
   * footprint and projected position (no DOM reads), finds intersecting
   * pairs, derives collision groups, then diffs against the previous pass so
   * markers only emit enter/exit transitions.
   */
  private runCollisionPass(map: SDKMap): void {
    const state = this.collisionState.get(map);
    const index = this.mapIndex.get(map);
    if (!state || !index) return;

    const bearing = map.getBearing();
    // half on each box: two inflated boxes touch exactly when the gap
    // between the exact boxes is the full padding
    const halfPadding = state.proximityPadding / 2;

    const entries: CollisionEntry[] = [];
    for (const marker of index.values()) {
      const footprint = marker[CollisionFootprintSymbol]();
      const angle = (footprint.mapAligned ? bearing : 0) + footprint.rotation;
      // the box is rebuilt from a fresh projection every pass — the camera
      // has usually moved since the last one, so caching it would lie
      const bounds = computeMarkerAABB(map.project(marker.getLngLat()), footprint, angle);
      entries.push({ index: entries.length, marker, bounds, proximityBounds: inflateBounds(bounds, halfPadding) });
    }

    // overlap and proximity are the same test at different paddings: the
    // candidate query IS the proximity test (both boxes pre-inflated), and
    // the exact boxes re-tested inside it give overlap
    const source = createCandidateSource(entries, (entry) => entry.proximityBounds);
    const overlapPairs: [number, number][] = [];
    const proximityPairs: [number, number][] = [];
    const next: Record<MarkerCollisionKind, Map<string, Set<Marker>>> = { overlap: new Map(), proximity: new Map() };

    for (const entry of entries) {
      for (const other of source.query(entry.proximityBounds)) {
        if (other.index <= entry.index) continue; // each pair once, and never self
        proximityPairs.push([entry.index, other.index]);
        this.linkCollision(next.proximity, entry.marker, other.marker);
        if (boundsIntersect(entry.bounds, other.bounds)) {
          overlapPairs.push([entry.index, other.index]);
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
  }

  // records a colliding pair in both markers' collision sets
  private linkCollision(sets: Map<string, Set<Marker>>, a: Marker, b: Marker): void {
    let setA = sets.get(a.id);
    if (!setA) sets.set(a.id, (setA = new Set()));
    setA.add(b);
    let setB = sets.get(b.id);
    if (!setB) sets.set(b.id, (setB = new Set()));
    setB.add(a);
  }

  // diffs each marker's collision set against the previous pass and has the
  // marker emit only the transitions — unchanged collisions stay silent
  private emitCollisionDiffs(index: Map<string, Marker>, previous: Map<string, Set<Marker>>, next: Map<string, Set<Marker>>, kind: MarkerCollisionKind): void {
    for (const marker of index.values()) {
      const previousSet = previous.get(marker.id) ?? EMPTY_MARKER_SET;
      const nextSet = next.get(marker.id) ?? EMPTY_MARKER_SET;
      const entered = [...nextSet].filter((counterpart) => !previousSet.has(counterpart));
      const exited = [...previousSet].filter((counterpart) => !nextSet.has(counterpart));
      if (entered.length === 0 && exited.length === 0) continue;
      marker[EmitCollisionDiffSymbol]({ kind, entered, exited, current: [...nextSet] });
    }
  }

  //#endregion
}

export const MarkerManager = new MarkerManagerImpl();
