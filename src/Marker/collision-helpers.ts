import type { MarkerOptions } from "maplibre-gl";
import type { MarkerCollisionDisplayState } from "./types";

/**
 * Pure geometry and grouping helpers for marker collision detection.
 *
 */

//#region Types

/** Screen-space axis-aligned bounding box, in CSS pixels (+y down). */
export type Bounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};
/** A point in screen space from top left in px. */
export type ScreenPoint = { x: number; y: number };

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

//#endregion

//#region Config

/**
 * Default proximity threshold in CSS px: two markers whose boxes come within
 * this distance of each other are "in proximity". Overlap always uses 0.
 */
export const DEFAULT_PROXIMITY_PADDING = 4;

//#endregion

//#region Geometry

/**
 * Displacement from the anchor point to the element center, unrotated.
 * E.g. a `bottom` anchor puts the element's bottom edge on the point, so the
 * center sits half a height *above* it (-y).
 */
function anchorToCenter(anchor: MarkerFootprint["anchor"], width: number, height: number): [number, number] {
  const dx = anchor.includes("left") ? width / 2 : anchor.includes("right") ? -width / 2 : 0;
  const dy = anchor.includes("top") ? height / 2 : anchor.includes("bottom") ? -height / 2 : 0;
  return [dx, dy];
}

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
export function computeMarkerOBB(position: ScreenPoint, footprint: MarkerFootprint, angleDeg: number): OBB {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // MapLibre applies the anchor translate and offset on the outer container,
  // before the inner wrapper's rotation transform — neither rotates. The
  // rotation happens around the wrapper's transform-origin, so the element
  // center swings around that pivot: with origin O = C0 + p, the rotated
  // center is C = O - R·p.
  const [adx, ady] = anchorToCenter(footprint.anchor, footprint.width, footprint.height);
  const [px, py] = footprint.pivot;
  const cx = position.x + footprint.offset[0] + adx + px - (px * cos - py * sin);
  const cy = position.y + footprint.offset[1] + ady + py - (px * sin + py * cos);

  return { cx, cy, hw: footprint.width / 2, hh: footprint.height / 2, cos, sin };
}

/**
 * Returns the axis-aligned box enclosing an oriented box, inflated by
 * `padding` on every side. Used as the broad-phase box: it can only
 * over-include, never miss a real intersection.
 */
export function obbToAABB(obb: OBB, padding = 0): Bounds {
  const ex = obb.hw * Math.abs(obb.cos) + obb.hh * Math.abs(obb.sin) + padding;
  const ey = obb.hw * Math.abs(obb.sin) + obb.hh * Math.abs(obb.cos) + padding;
  return { left: obb.cx - ex, right: obb.cx + ex, top: obb.cy - ey, bottom: obb.cy + ey };
}

/**
 * Exact intersection test for two oriented boxes via the separating axis
 * theorem: two convex boxes are disjoint iff some axis of either box
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
export function obbIntersect(a: OBB, b: OBB, padding = 0): boolean {
  const ahw = a.hw + padding;
  const ahh = a.hh + padding;
  const bhw = b.hw + padding;
  const bhh = b.hh + padding;
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;

  // both boxes' local axes: (cos, sin) is the x-axis, (-sin, cos) the y-axis
  const axes: [number, number][] = [
    [a.cos, a.sin],
    [-a.sin, a.cos],
    [b.cos, b.sin],
    [-b.sin, b.cos],
  ];

  for (const [nx, ny] of axes) {
    // projection radius of each box onto the axis: sum of its half-extent
    // vectors' absolute projections
    const ra = ahw * Math.abs(a.cos * nx + a.sin * ny) + ahh * Math.abs(-a.sin * nx + a.cos * ny);
    const rb = bhw * Math.abs(b.cos * nx + b.sin * ny) + bhh * Math.abs(-b.sin * nx + b.cos * ny);
    if (Math.abs(dx * nx + dy * ny) > ra + rb) return false;
  }
  return true;
}

/** Returns `bounds` grown by `padding` px on every side. */
export function inflateBounds(bounds: Bounds, padding: number): Bounds {
  return {
    left: bounds.left - padding,
    right: bounds.right + padding,
    top: bounds.top - padding,
    bottom: bounds.bottom + padding,
  };
}

/** The single intersection test — overlap and proximity both go through here. */
export function boundsIntersect(a: Bounds, b: Bounds): boolean {
  return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom;
}

//#endregion

//#region Candidate Search

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
export function createCandidateSource<T>(items: readonly T[], boundsOf: (item: T) => Bounds): CollisionCandidateSource<T> {
  return {
    query(bounds: Bounds): readonly T[] {
      return items.filter((item) => boundsIntersect(boundsOf(item), bounds));
    },
  };
}

//#endregion

//#region Behaviour Resolution

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
export function resolveDisplayStates(entries: readonly ResolutionEntry[], exact = true): MarkerCollisionDisplayState[] {
  const order = entries.map((_, i) => i).sort((a, b) => entries[b].priority - entries[a].priority || a - b);

  const states: MarkerCollisionDisplayState[] = new Array<MarkerCollisionDisplayState>(entries.length).fill("visible");
  const placed: { obb: OBB; bounds: Bounds }[] = [];

  // broad-phase on the enclosing upright boxes, then (at high accuracy) the
  // exact rotated-box test — same two-tier scheme as the detection pass
  const collides = (obb: OBB, bounds: Bounds): boolean => placed.some((p) => boundsIntersect(p.bounds, bounds) && (!exact || obbIntersect(p.obb, obb)));
  const place = (obb: OBB): void => {
    placed.push({ obb, bounds: obbToAABB(obb) });
  };

  for (const i of order) {
    const entry = entries[i];
    if (entry.mode === "always" || !collides(entry.obb, obbToAABB(entry.obb))) {
      place(entry.obb);
      continue;
    }
    if (entry.mode === "hide") {
      states[i] = "hidden";
      continue;
    }
    states[i] = "minimized";
    place(entry.obb);
  }

  return states;
}

//#endregion

//#region Grouping

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
export function deriveCollisionGroups<T>(items: readonly T[], pairs: readonly [number, number][]): T[][] {
  // union-find with path compression
  const parent = items.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  for (const [a, b] of pairs) {
    parent[find(a)] = find(b);
  }

  const components = new Map<number, T[]>();
  for (let i = 0; i < items.length; i++) {
    const root = find(i);
    const members = components.get(root);
    if (members) members.push(items[i]);
    else components.set(root, [items[i]]);
  }

  return [...components.values()].filter((group) => group.length > 1);
}

//#endregion
