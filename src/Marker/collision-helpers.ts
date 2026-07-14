import type { MarkerOptions } from "maplibre-gl";

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
  let dx = 0;
  let dy = 0;
  if (anchor.includes("left")) dx = width / 2;
  else if (anchor.includes("right")) dx = -width / 2;
  if (anchor.includes("top")) dy = height / 2;
  else if (anchor.includes("bottom")) dy = -height / 2;
  return [dx, dy];
}

/**
 * Computes the screen-space AABB of a rotated marker box.
 *
 * The box is rotated by `angleDeg` (map bearing for map-aligned markers plus
 * the marker's own rotation) and the enclosing axis-aligned box is returned.
 * For unrotated (viewport-aligned) markers the rotation terms collapse to
 * the plain box. Pitch is deliberately ignored — under pitch the true
 * footprint foreshortens, so the full-height box over-reserves space, which
 * fails safe.
 *
 * @param position - The marker's *screen* position (normally
 *   `map.project(lngLat)`). Taken as an explicit argument so behaviours that
 *   render a marker somewhere other than its geographic position can pass
 *   the rendered point instead.
 * @param footprint - The marker's resolved footprint.
 * @param angleDeg - Total clockwise rotation of the box in degrees.
 * @param padding - Inflates the box on every side; `0` gives the exact box.
 */
export function computeMarkerAABB(position: ScreenPoint, footprint: MarkerFootprint, angleDeg: number, padding = 0): Bounds {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // the anchor displacement rotates with the element; the offset is applied
  // by MapLibre in screen space before the rotation transform, so it doesn't
  const [adx, ady] = anchorToCenter(footprint.anchor, footprint.width, footprint.height);
  const cx = position.x + footprint.offset[0] + (adx * cos - ady * sin);
  const cy = position.y + footprint.offset[1] + (adx * sin + ady * cos);

  const ex = (footprint.width / 2) * Math.abs(cos) + (footprint.height / 2) * Math.abs(sin) + padding;
  const ey = (footprint.width / 2) * Math.abs(sin) + (footprint.height / 2) * Math.abs(cos) + padding;

  return { left: cx - ex, right: cx + ex, top: cy - ey, bottom: cy + ey };
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

//#region Grouping

/**
 * Derives collision groups (connected components) from pairwise collisions.
 *
 * Groups keep the *full set* of mutually-colliding items — no winners or
 * losers. Behaviours like reposition-column and cluster need every member to
 * compute an average position, which winner/loser output cannot provide.
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
