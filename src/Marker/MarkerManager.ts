import type { Marker } from "./Marker";
import type { Map as SDKMap } from "../Map";
import { CollisionBehaviour } from "./types";
import type { MarkerCollisionAccuracy, MarkerCollisionDisplayState, MarkerCollisionGroups, MarkerCollisionKind, MarkerCollisionOptions } from "./types";
import {
  computeMarkerOBB,
  obbToAABB,
  obbIntersect,
  deriveCollisionGroups,
  inflateBounds,
  boundsIntersect,
  resolveDisplayStates,
  clusterScaleFactor,
  deriveRadiusClusters,
  DEFAULT_CLUSTER_RADIUS,
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
  SetClusterStateSymbol,
  MeasuredElementSizeSymbol,
} from "./marker-symbols";

/** Pending props that change a marker's footprint and therefore its collisions. */
const FOOTPRINT_PROPS = ["shape", "size", "scale", "rotation"] as const;

/** Interaction listeners attached to a cluster representative's element. */
type ClusterHandlerRecord = {
  marker: Marker;
  element: HTMLElement;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (event: MouseEvent) => void;
};

/** Hover listeners attached to an expanded cluster's member elements. */
type MemberHandlerRecord = {
  /** The members the listeners were attached for — the staleness check. */
  markers: Marker[];
  records: { element: HTMLElement; onEnter: () => void; onLeave: () => void }[];
};

/**
 * A cluster derived in the current pass. Collapsed, it renders as `marker`
 * at `lngLat` showing `count`; expanded, every member (representative
 * included) renders as itself at its real position.
 */
type ClusterRole = {
  marker: Marker;
  lngLat: [number, number];
  count: number;
  expanded: boolean;
  members: Marker[];
};

/**
 * How long the pointer may be over none of an expanded cluster's members
 * before the cluster collapses. Expanding hides the representative bubble
 * from under the pointer, so an immediate-collapse rule would flicker.
 */
const CLUSTER_COLLAPSE_GRACE_MS = 300;

/**
 * Minimum margin in CSS px around the viewport within which markers still
 * participate in the pass. Off-viewport markers are excluded and hidden, but
 * a marker just past the edge must keep blocking (and clustering with) its
 * on-screen neighbours, or edge behaviour would churn while panning. The
 * effective margin also covers the cluster diameter, so a representative
 * whose average position is on screen can never be culled away.
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
  /** Cluster radius in CSS px — markers within this distance of a cluster seed join its cluster. */
  clusterRadius: number;
  /** Ids of cluster representatives currently expanded by hover. */
  expandedClusters: Set<string>;
  /** Ids of cluster representatives pinned open by click. */
  pinnedClusters: Set<string>;
  /** Interaction listeners of current cluster representatives, keyed by marker id. */
  clusterHandlers: Map<string, ClusterHandlerRecord>;
  /** Hover listeners of expanded clusters' members, keyed by representative id. */
  memberHandlers: Map<string, MemberHandlerRecord>;
  /** Pending hover-collapse grace timers, keyed by representative id. */
  collapseTimers: Map<string, ReturnType<typeof setTimeout>>;
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

// one warning per page load is enough for the unimplemented behaviour
let warnedRepositionColumn = false;

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
      const record = state.clusterHandlers.get(marker.id);
      if (record) {
        this.detachClusterHandlers(record);
        state.clusterHandlers.delete(marker.id);
      }
      this.detachMemberHandlers(state, marker.id);
      this.clearCollapseTimer(state, marker.id);
      state.expandedClusters.delete(marker.id);
      state.pinnedClusters.delete(marker.id);
    }
    // leave the marker in its natural state in case it is re-added elsewhere
    marker[SetClusterStateSymbol](null);
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
   * @param options.clusterRadius - Cluster radius in CSS px: `cluster`
   *   markers within this distance of a cluster seed join its cluster.
   *   Defaults to 60.
   */
  setCollisionOptions(map: SDKMap, options: MarkerCollisionOptions): void {
    const state = this.getOrCreateCollisionState(map);
    if (options.proximityPadding !== undefined) state.proximityPadding = options.proximityPadding;
    if (options.accuracy !== undefined) state.accuracy = options.accuracy;
    if (options.behaviour !== undefined) state.behaviour = options.behaviour;
    if (options.clusterRadius !== undefined) state.clusterRadius = options.clusterRadius;
    this.invalidateCollisions(map);
  }

  // lazily creates the per-map collision state and attaches the camera
  // trigger; `remove` tears both down along with any pending pass
  private getOrCreateCollisionState(map: SDKMap): MapCollisionState {
    let state = this.collisionState.get(map);

    if (!state) {
      const newState: MapCollisionState = {
        previous: { overlap: new Map(), proximity: new Map() },
        groups: { overlap: [], proximity: [] },
        proximityPadding: DEFAULT_PROXIMITY_PADDING,
        accuracy: "high",
        behaviour: CollisionBehaviour.ALWAYS_SHOW,
        clusterRadius: DEFAULT_CLUSTER_RADIUS,
        expandedClusters: new Set(),
        pinnedClusters: new Set(),
        clusterHandlers: new Map(),
        memberHandlers: new Map(),
        collapseTimers: new Map(),
      };
      state = newState;
      this.collisionState.set(map, state);

      // the pass runs when movement settles — during camera movement markers
      // track their positions via MapLibre's own per-frame update, and in
      // dense fields the pass is quadratic in overlapping pairs, too heavy
      // for the per-frame path. States flip at rest, so the fades get to play.
      const onMoveEnd = () => {
        this.invalidateCollisions(map);
      };
      // a click that reaches the map (i.e. was not stopped by a cluster
      // representative) or a zoom change collapses all expanded clusters
      const onCollapseClusters = () => {
        if (newState.pinnedClusters.size === 0 && newState.expandedClusters.size === 0) return;
        newState.pinnedClusters.clear();
        newState.expandedClusters.clear();
        for (const timer of newState.collapseTimers.values()) clearTimeout(timer);
        newState.collapseTimers.clear();
        this.invalidateCollisions(map);
      };
      map.on("moveend", onMoveEnd);
      map.on("click", onCollapseClusters);
      map.on("zoomend", onCollapseClusters);
      void map.once("remove", () => {
        map.off("moveend", onMoveEnd);
        map.off("click", onCollapseClusters);
        map.off("zoomend", onCollapseClusters);
        for (const record of newState.clusterHandlers.values()) {
          this.detachClusterHandlers(record);
        }
        for (const id of [...newState.memberHandlers.keys()]) {
          this.detachMemberHandlers(newState, id);
        }
        for (const timer of newState.collapseTimers.values()) clearTimeout(timer);
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
   *
   * Markers outside the (margin-padded) viewport never enter the pass: they
   * are hidden outright — off screen there is nothing to show, and skipping
   * them keeps the pair scan, clustering, and placement proportional to what
   * is actually visible. They rejoin (and fade back in) on the first pass
   * that finds them near the viewport again. Consequence: collision events
   * and `getCollisionGroups` only cover on-screen markers.
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
    const cullMargin = Math.max(VIEWPORT_CULL_MARGIN_PX, state.clusterRadius * 2);
    const viewport: Bounds = {
      left: -cullMargin,
      top: -cullMargin,
      right: canvas.clientWidth + cullMargin,
      bottom: canvas.clientHeight + cullMargin,
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

    this.applyCollisionBehaviours(map, state, entries, bearing);
  }

  /**
   * The behaviour layer: turns the pass's geometry into display states.
   *
   * Two stages:
   * 1. Clustering — `cluster` markers are grouped by greedy radius
   *    clustering (see {@link deriveRadiusClusters}): compact discs around
   *    high-priority seeds, never overlap-chained irregular shapes. Each
   *    group renders as its highest-priority member at the group's average
   *    position, showing and scaling with the member count, the other
   *    members hidden. Hovering a representative expands the members at
   *    their real positions; clicking pins the expansion open until a map
   *    click or zoom.
   * 2. Greedy priority placement — everything still visible is placed in
   *    priority order; `hide-by-priority` losers hide (and stop blocking),
   *    `minimize-by-priority` losers minimize (and keep reserving their
   *    full-size box, so priority order is strict). See
   *    {@link resolveDisplayStates}.
   *
   * Hide/minimize act on *overlap* only — the proximity padding stays an
   * events-only concern; `collisionRadius` is the per-marker way to act at a
   * distance. Clustering acts on the map-level `clusterRadius` instead.
   */
  private applyCollisionBehaviours(map: SDKMap, state: MapCollisionState, entries: CollisionEntry[], bearing: number): void {
    const behaviours = entries.map((entry) => this.effectiveBehaviour(entry.marker, state));

    // ---- stage 1: clusters
    const clusterEntries = entries.filter((entry) => behaviours[entry.index] === CollisionBehaviour.CLUSTER);
    const clusterRoles = new Map<string, ClusterRole>();
    const hiddenByCluster = new Set<number>();
    // a collapsed representative blocks from where it is rendered (the
    // average position), not from its real position
    const clusterObbOverride = new Map<number, OBB>();

    if (clusterEntries.length > 1) {
      const clusterGroups = deriveRadiusClusters(
        clusterEntries.map((entry) => ({ x: entry.obb.cx, y: entry.obb.cy, priority: numericPriority(entry.marker) })),
        state.clusterRadius,
      );

      for (const memberIndices of clusterGroups) {
        const group = memberIndices.map((i) => clusterEntries[i]);
        // highest priority wins; ties keep the earliest-registered member
        let representative = group[0];
        for (const member of group) {
          if (numericPriority(member.marker) > numericPriority(representative.marker)) representative = member;
        }

        // naive mean of the members' real positions — cluster members overlap
        // on screen, so antimeridian wrapping is not a practical concern
        let lng = 0;
        let lat = 0;
        for (const member of group) {
          const position = member.marker.getLngLat();
          lng += position.lng;
          lat += position.lat;
        }
        const average: [number, number] = [lng / group.length, lat / group.length];

        const id = representative.marker.id;
        const expanded = state.expandedClusters.has(id) || state.pinnedClusters.has(id);
        clusterRoles.set(id, {
          marker: representative.marker,
          lngLat: average,
          count: group.length,
          expanded,
          members: group.map((member) => member.marker),
        });

        // expanded: every member (representative included) renders as itself
        // at its real position — nothing hidden, no box override
        if (expanded) continue;

        // collapsed: the representative renders scaled with the member count,
        // so its blocking box grows the same way (footprint is a fresh object
        // per call, safe to adjust in place)
        const footprint = representative.marker[CollisionFootprintSymbol]();
        const factor = clusterScaleFactor(group.length);
        footprint.width *= factor;
        footprint.height *= factor;
        footprint.pivot = [footprint.pivot[0] * factor, footprint.pivot[1] * factor];
        const angle = (footprint.mapAligned ? bearing : 0) + footprint.rotation;
        clusterObbOverride.set(representative.index, computeMarkerOBB(map.project(average), footprint, angle));

        for (const member of group) {
          if (member !== representative) hiddenByCluster.add(member.index);
        }
      }
    }

    this.reconcileClusterRoles(map, state, clusterRoles);

    // ---- stage 2: greedy priority placement
    const resolution: ResolutionEntry[] = [];
    const resolutionEntries: CollisionEntry[] = [];
    for (const entry of entries) {
      if (hiddenByCluster.has(entry.index)) continue;
      const behaviour = behaviours[entry.index];
      let mode: ResolutionMode = "always";
      if (behaviour === CollisionBehaviour.HIDE_BY_PRIORITY) mode = "hide";
      else if (behaviour === CollisionBehaviour.MINIMIZE_BY_PRIORITY) mode = "minimize";

      resolution.push({ mode, priority: numericPriority(entry.marker), obb: clusterObbOverride.get(entry.index) ?? entry.obb });
      resolutionEntries.push(entry);
    }

    const resolved = resolveDisplayStates(resolution, state.accuracy === "high");

    // markers left out of the resolution are exactly the cluster-hidden ones
    const displayStates = new Array<MarkerCollisionDisplayState>(entries.length).fill("hidden");
    resolutionEntries.forEach((entry, i) => (displayStates[entry.index] = resolved[i]));

    // re-enter rendering for everything that shows this pass, then flush
    // layout ONCE — the fade-in needs a reflow between un-cull and un-hide,
    // and doing it inside the per-marker apply would force one layout per
    // marker (a dense zoom threshold un-hiding hundreds stalled for frames)
    let needsReflow = false;
    for (const entry of entries) {
      if (displayStates[entry.index] === "hidden") continue;
      if (applyCollisionCulled(entry.marker.getElement(), false)) needsReflow = true;
    }
    if (needsReflow) void map.getContainer().offsetWidth;

    for (const entry of entries) {
      entry.marker[ApplyCollisionDisplayStateSymbol](displayStates[entry.index]);
    }
  }

  // resolves a marker's collision behaviour against the map default;
  // reposition-column is not implemented yet and falls back to hide
  private effectiveBehaviour(marker: Marker, state: MapCollisionState): CollisionBehaviour {
    const behaviour = marker.options.collisionBehaviour ?? state.behaviour;
    if (behaviour === CollisionBehaviour.REPOSITION_COLUMN) {
      if (!warnedRepositionColumn) {
        warnedRepositionColumn = true;
        console.warn('Marker collision behaviour "reposition-column" is not implemented yet — falling back to "hide-by-priority".');
      }
      return CollisionBehaviour.HIDE_BY_PRIORITY;
    }
    return behaviour;
  }

  /**
   * Applies the pass's cluster roles: assigns rendering and interaction to
   * new representatives, updates existing ones, and fully clears markers
   * that stopped being representatives. Expanded clusters render the
   * representative as a plain marker at its real position (the cluster
   * rendering disappears) and track hover across every member so the
   * cluster stays open while the pointer explores it.
   */
  private reconcileClusterRoles(map: SDKMap, state: MapCollisionState, roles: Map<string, ClusterRole>): void {
    for (const [id, record] of state.clusterHandlers) {
      if (roles.has(id)) continue;
      this.detachClusterHandlers(record);
      this.detachMemberHandlers(state, id);
      this.clearCollapseTimer(state, id);
      state.clusterHandlers.delete(id);
      state.expandedClusters.delete(id);
      state.pinnedClusters.delete(id);
      record.marker[SetClusterStateSymbol](null);
    }

    for (const [id, role] of roles) {
      if (role.expanded) {
        role.marker[SetClusterStateSymbol](null);
        this.syncMemberHandlers(map, state, id, role.members);
      } else {
        role.marker[SetClusterStateSymbol]({ lngLat: role.lngLat, count: role.count });
        this.detachMemberHandlers(state, id);
      }

      if (state.clusterHandlers.has(id)) continue;

      const element = role.marker.getElement();
      const onMouseEnter = () => {
        this.hoverExpand(map, state, id);
      };
      const onMouseLeave = () => {
        this.scheduleCollapse(map, state, id);
      };
      const onClick = (event: MouseEvent) => {
        // keep the click from reaching the map, which would immediately unpin
        event.stopPropagation();
        this.clearCollapseTimer(state, id);
        if (!state.pinnedClusters.delete(id)) state.pinnedClusters.add(id);
        this.invalidateCollisions(map);
      };
      element.addEventListener("mouseenter", onMouseEnter);
      element.addEventListener("mouseleave", onMouseLeave);
      element.addEventListener("click", onClick);
      state.clusterHandlers.set(id, { marker: role.marker, element, onMouseEnter, onMouseLeave, onClick });
    }
  }

  // expands a cluster on hover, cancelling any pending collapse
  private hoverExpand(map: SDKMap, state: MapCollisionState, id: string): void {
    this.clearCollapseTimer(state, id);
    if (state.expandedClusters.has(id)) return;
    state.expandedClusters.add(id);
    this.invalidateCollisions(map);
  }

  /**
   * Schedules a hover-collapse after the grace period. Expanding removes the
   * representative bubble from under the pointer, so collapsing on the raw
   * `mouseleave` would flicker — the grace window lets the pointer reach one
   * of the revealed members, whose own hover keeps the cluster open.
   */
  private scheduleCollapse(map: SDKMap, state: MapCollisionState, id: string): void {
    if (!state.expandedClusters.has(id) || state.pinnedClusters.has(id)) return;
    this.clearCollapseTimer(state, id);
    state.collapseTimers.set(
      id,
      setTimeout(() => {
        state.collapseTimers.delete(id);
        if (state.pinnedClusters.has(id)) return;
        if (state.expandedClusters.delete(id)) this.invalidateCollisions(map);
      }, CLUSTER_COLLAPSE_GRACE_MS),
    );
  }

  private clearCollapseTimer(state: MapCollisionState, id: string): void {
    const timer = state.collapseTimers.get(id);
    if (timer === undefined) return;
    clearTimeout(timer);
    state.collapseTimers.delete(id);
  }

  // attaches hover listeners to an expanded cluster's members (idempotent
  // while the membership is unchanged — passes run per-frame)
  private syncMemberHandlers(map: SDKMap, state: MapCollisionState, id: string, members: Marker[]): void {
    const existing = state.memberHandlers.get(id);
    if (existing && existing.markers.length === members.length && existing.markers.every((marker, i) => marker === members[i])) return;
    this.detachMemberHandlers(state, id);

    const records = members.map((member) => {
      const element = member.getElement();
      const onEnter = () => {
        this.hoverExpand(map, state, id);
      };
      const onLeave = () => {
        this.scheduleCollapse(map, state, id);
      };
      element.addEventListener("mouseenter", onEnter);
      element.addEventListener("mouseleave", onLeave);
      return { element, onEnter, onLeave };
    });
    state.memberHandlers.set(id, { markers: [...members], records });
  }

  private detachMemberHandlers(state: MapCollisionState, id: string): void {
    const existing = state.memberHandlers.get(id);
    if (!existing) return;
    for (const record of existing.records) {
      record.element.removeEventListener("mouseenter", record.onEnter);
      record.element.removeEventListener("mouseleave", record.onLeave);
    }
    state.memberHandlers.delete(id);
  }

  // removes a representative's interaction listeners
  private detachClusterHandlers(record: ClusterHandlerRecord): void {
    record.element.removeEventListener("mouseenter", record.onMouseEnter);
    record.element.removeEventListener("mouseleave", record.onMouseLeave);
    record.element.removeEventListener("click", record.onClick);
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

      // allocation-free steady-state check first: in a dense field a pass
      // carries thousands of *unchanged* collisions, and building the
      // entered/exited arrays for all of them is pure garbage-collector load
      if (previousSet.size === nextSet.size) {
        let changed = false;
        for (const counterpart of nextSet) {
          if (!previousSet.has(counterpart)) {
            changed = true;
            break;
          }
        }
        if (!changed) continue;
      }

      const entered = [...nextSet].filter((counterpart) => !previousSet.has(counterpart));
      const exited = [...previousSet].filter((counterpart) => !nextSet.has(counterpart));
      if (entered.length === 0 && exited.length === 0) continue;
      marker[EmitCollisionDiffSymbol]({ kind, entered, exited, current: [...nextSet] });
    }
  }

  //#endregion
}

export const MarkerManager = new MarkerManagerImpl();
