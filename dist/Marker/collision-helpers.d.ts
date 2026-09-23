import { MarkerOptions } from 'maplibre-gl';
import { MarkerCollisionDisplayState } from './types';
/**
 * Pure geometry and grouping helpers for marker collision detection.
 *
 */
/** Screen-space axis-aligned bounding box, in CSS pixels (+y down). */
export type Bounds = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};
/** A point in screen space from top left in px. */
export type ScreenPoint = {
    x: number;
    y: number;
};
/**
 * Screen-space oriented bounding box: the marker's actual rotated rectangle.
 * `cos`/`sin` are precomputed from the rotation angle so both the SAT test
 * and the enclosing-AABB derivation reuse them.
 */
export type OBB = {
    /** Box center, screen px. */
    cx: number;
    cy: number;
    /** Half extents along the box's own axes, px. */
    hw: number;
    hh: number;
    /** Rotation of the box's axes (cos/sin of the angle). */
    cos: number;
    sin: number;
};
/**
 * A marker's screen footprint, resolved from its props once per pass —
 * never measured from the DOM inside the pass. (.getBoundingClientRect triggers layout)
 */
export type MarkerFootprint = {
    /** Rendered width in CSS px, with 2-D scale applied. */
    width: number;
    /** Rendered height in CSS px, with 2-D scale applied. */
    height: number;
    /** Which point of the element sits on the marker's screen position. */
    anchor: NonNullable<MarkerOptions["anchor"]>;
    /** Screen-space pixel offset applied after projection (+y down). */
    offset: [number, number];
    /**
     * Displacement from the element center to the rotation origin, in CSS px
     * (+y down). Mirrors the inner wrapper's CSS `transform-origin`: `[0, 0]`
     * for center-origin elements, `[0, height / 2]` for bottom-anchored shapes
     * that rotate around their tip.
     */
    pivot: [number, number];
    /** The marker's own rotation in degrees (its inner-shell CSS rotation). */
    rotation: number;
    /** `true` when the marker rotates with the map bearing (`rotationAlignment: "map"`). */
    mapAligned: boolean;
};
/**
 * Default proximity threshold in CSS px: two markers whose boxes come within
 * this distance of each other are "in proximity". Overlap always uses 0.
 */
export declare const DEFAULT_PROXIMITY_PADDING = 4;
/**
 * Computes the screen-space oriented box of a marker.
 *
 * The box is rotated by `angleDeg` (map bearing for map-aligned markers plus
 * the marker's own rotation). For unrotated (viewport-aligned) markers the
 * rotation terms collapse to the plain box. Pitch is deliberately ignored —
 * under pitch the true footprint foreshortens, so the full-height box
 * over-reserves space, which fails safe.
 *
 * @param position - The marker's *screen* position (normally
 *   `map.project(lngLat)`). Taken as an explicit argument so behaviours that
 *   render a marker somewhere other than its geographic position can pass
 *   the rendered point instead.
 * @param footprint - The marker's resolved footprint.
 * @param angleDeg - Total clockwise rotation of the box in degrees.
 */
export declare function computeMarkerOBB(position: ScreenPoint, footprint: MarkerFootprint, angleDeg: number): OBB;
/**
 * Returns the axis-aligned box enclosing an oriented box, inflated by
 * `padding` on every side. Used as the broad-phase box: it can only
 * over-include, never miss a real intersection.
 */
export declare function obbToAABB(obb: OBB, padding?: number): Bounds;
/**
 * Exact intersection test for two oriented boxes via the separating axis
 * theorem: two convex boxes are disjoint if some axis of either box
 * separates their projections, so only the four box axes need testing.
 *
 * SAT is the computational form of Minkowski-difference collision detection
 * for convex polytopes — see
 * https://en.wikipedia.org/wiki/Minkowski_addition#Collision_detection
 *
 * @param padding - Inflates both boxes' half extents; the two-box test then
 *   answers "are the exact boxes within `2 * padding` of each other" the same
 *   way the pre-inflated AABBs do for the axis-aligned path.
 */
export declare function obbIntersect(a: OBB, b: OBB, padding?: number): boolean;
/** Returns `bounds` grown by `padding` px on every side. */
export declare function inflateBounds(bounds: Bounds, padding: number): Bounds;
/** The single intersection test — overlap and proximity both go through here. */
export declare function boundsIntersect(a: Bounds, b: Bounds): boolean;
/** Answers "which entries are near this box" for the detection pass. */
export type CollisionCandidateSource<T> = {
    query(bounds: Bounds): readonly T[];
};
/**
 * The seam between the pairwise scan and the grouping/event logic.
 *
 * Currently a linear scan (O(n) per query, O(n²) per pass). When marker
 * counts demand it, replace the internals with a spatial index (rbush /
 * uniform grid) — callers only depend on `query`.
 */
export declare function createCandidateSource<T>(items: readonly T[], boundsOf: (item: T) => Bounds): CollisionCandidateSource<T>;
/**
 * How a marker participates in the greedy priority resolution.
 * - `always` — always shown, but still reserves its space (blocks losers).
 * - `hide` — hidden when it collides with an already-placed marker; frees
 *   its space.
 * - `minimize` — minimized when it collides with an already-placed marker;
 *   still reserves its *full-size* box (renders small, blocks full), so
 *   priority order is strict: a lower-priority marker can never show
 *   full-size in space a minimized higher-priority marker occupies.
 */
export type ResolutionMode = "always" | "hide" | "minimize";
/** One marker's input to {@link resolveDisplayStates}. */
export type ResolutionEntry = {
    mode: ResolutionMode;
    /** Numeric priority; higher wins. */
    priority: number;
    /** Full-size box at the marker's rendered position. */
    obb: OBB;
};
/**
 * Greedy priority placement — the winner/loser resolution behind the
 * hide/minimize collision behaviours.
 *
 * Entries are placed in priority order (ties: input order, i.e. registration
 * order). Each entry is tested only against already-placed boxes; hidden
 * markers free their space for lower-priority ones, while `always` and
 * minimized markers keep reserving their full box. Rerunning on the same
 * input always yields the same output — placement never feeds back into the
 * boxes it is tested against, so results cannot oscillate between passes.
 *
 * @param entries - One entry per marker still in contention, in registration order.
 * @param exact - `true` tests the rotated boxes (SAT), `false` their enclosing
 *   upright boxes — mirrors the detection pass's `accuracy` setting.
 * @returns Display state per entry, indexed like `entries`.
 */
export declare function resolveDisplayStates(entries: readonly ResolutionEntry[], exact?: boolean): MarkerCollisionDisplayState[];
/**
 * Derives collision groups (connected components) from pairwise collisions.
 *
 * Groups keep the *full set* of mutually-colliding items — no winners or
 * losers — so consumers can inspect full collision sets rather than only
 * the greedy placement outcome.
 *
 * @param items - All entries in the pass, indexable by the pair indices.
 * @param pairs - Colliding index pairs `[i, j]`.
 * @returns Components with two or more members; singletons are not groups.
 */
export declare function deriveCollisionGroups<T>(items: readonly T[], pairs: readonly [number, number][]): T[][];
