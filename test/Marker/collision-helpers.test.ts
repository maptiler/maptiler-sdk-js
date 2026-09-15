import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROXIMITY_PADDING,
  boundsIntersect,
  computeMarkerOBB,
  createCandidateSource,
  deriveCollisionGroups,
  inflateBounds,
  obbIntersect,
  obbToAABB,
  resolveDisplayStates,
  type Bounds,
  type MarkerFootprint,
  type OBB,
  type ResolutionEntry,
} from "../../src/Marker/collision-helpers";

function footprint(overrides: Partial<MarkerFootprint> = {}): MarkerFootprint {
  return {
    width: 40,
    height: 40,
    anchor: "center",
    offset: [0, 0],
    pivot: [0, 0],
    rotation: 0,
    mapAligned: false,
    ...overrides,
  };
}

//#region computeMarkerOBB

describe("computeMarkerOBB", () => {
  it("centers the box on the anchor point for a center-anchored, unrotated marker", () => {
    const obb = computeMarkerOBB({ x: 100, y: 100 }, footprint(), 0);
    expect(obb.cx).toBe(100);
    expect(obb.cy).toBe(100);
    expect(obb.hw).toBe(20);
    expect(obb.hh).toBe(20);
    expect(obb.cos).toBeCloseTo(1);
    expect(obb.sin).toBeCloseTo(0);
  });

  it("shifts the center up for a bottom-anchored marker", () => {
    const obb = computeMarkerOBB({ x: 0, y: 0 }, footprint({ anchor: "bottom", height: 40, width: 20 }), 0);
    expect(obb.cx).toBe(0);
    expect(obb.cy).toBe(-20);
  });

  it("applies an explicit screen-space offset", () => {
    const obb = computeMarkerOBB({ x: 0, y: 0 }, footprint({ offset: [10, -5] }), 0);
    expect(obb.cx).toBe(10);
    expect(obb.cy).toBe(-5);
  });

  it("rotates around the pivot, not the element center", () => {
    // bottom-anchored shape rotating around its tip: pivot = [0, height/2]
    const obb = computeMarkerOBB({ x: 0, y: 0 }, footprint({ anchor: "bottom", width: 40, height: 40, pivot: [0, 20] }), 90);
    // unrotated center would be at (0, -20); rotating 90deg cw around the tip (0,0) puts it at (20, 0)
    expect(obb.cx).toBeCloseTo(20);
    expect(obb.cy).toBeCloseTo(0);
  });

  it("shifts the center diagonally for a corner-anchored marker (dx and dy both nonzero)", () => {
    const obb = computeMarkerOBB({ x: 0, y: 0 }, footprint({ anchor: "top-left", width: 40, height: 20 }), 0);
    expect(obb.cx).toBeCloseTo(20); // width/2
    expect(obb.cy).toBeCloseTo(10); // height/2
  });

  it("computes cos/sin for a 90 degree rotation", () => {
    const obb = computeMarkerOBB({ x: 0, y: 0 }, footprint(), 90);
    expect(obb.cos).toBeCloseTo(0);
    expect(obb.sin).toBeCloseTo(1);
  });
});

//#endregion

//#region obbToAABB

describe("obbToAABB", () => {
  it("returns the exact box for an axis-aligned OBB", () => {
    const obb: OBB = { cx: 10, cy: 10, hw: 5, hh: 3, cos: 1, sin: 0 };
    expect(obbToAABB(obb)).toEqual({ left: 5, right: 15, top: 7, bottom: 13 });
  });

  it("adds padding on every side", () => {
    const obb: OBB = { cx: 0, cy: 0, hw: 5, hh: 5, cos: 1, sin: 0 };
    expect(obbToAABB(obb, 2)).toEqual({ left: -7, right: 7, top: -7, bottom: 7 });
  });

  it("grows the enclosing box for a 45 degree rotated square", () => {
    const cos = Math.SQRT1_2;
    const sin = Math.SQRT1_2;
    const obb: OBB = { cx: 0, cy: 0, hw: 10, hh: 10, cos, sin };
    const aabb = obbToAABB(obb);
    // a rotated square's enclosing box grows to hw*sqrt2
    expect(aabb.right).toBeCloseTo(10 * Math.SQRT2);
    expect(aabb.bottom).toBeCloseTo(10 * Math.SQRT2);
  });
});

//#endregion

//#region obbIntersect

describe("obbIntersect", () => {
  it("detects overlapping unrotated boxes", () => {
    const a: OBB = { cx: 0, cy: 0, hw: 10, hh: 10, cos: 1, sin: 0 };
    const b: OBB = { cx: 15, cy: 0, hw: 10, hh: 10, cos: 1, sin: 0 };
    expect(obbIntersect(a, b)).toBe(true);
  });

  it("detects non-overlapping unrotated boxes", () => {
    const a: OBB = { cx: 0, cy: 0, hw: 10, hh: 10, cos: 1, sin: 0 };
    const b: OBB = { cx: 30, cy: 0, hw: 10, hh: 10, cos: 1, sin: 0 };
    expect(obbIntersect(a, b)).toBe(false);
  });

  it("padding brings separated boxes into contact", () => {
    const a: OBB = { cx: 0, cy: 0, hw: 10, hh: 10, cos: 1, sin: 0 };
    const b: OBB = { cx: 25, cy: 0, hw: 10, hh: 10, cos: 1, sin: 0 };
    expect(obbIntersect(a, b)).toBe(false);
    expect(obbIntersect(a, b, 3)).toBe(true);
  });

  it("separates two rotated boxes whose upright AABBs overlap but the exact boxes don't", () => {
    // a wide, near-flat bar rotated 45deg — its own AABB is a square, but the
    // actual rectangle is thin along its short (rotated) axis
    const cos45 = Math.SQRT1_2;
    const sin45 = Math.SQRT1_2;
    const a: OBB = { cx: 0, cy: 0, hw: 20, hh: 1, cos: cos45, sin: sin45 };
    // a small box sitting in the AABB's corner, off the thin rotated bar itself
    const b: OBB = { cx: 12, cy: -12, hw: 2, hh: 2, cos: 1, sin: 0 };
    expect(obbIntersect(a, b)).toBe(false);
  });

  it("two thin bars crossing through a shared center do intersect", () => {
    const cos45 = Math.SQRT1_2;
    const sin45 = Math.SQRT1_2;
    const a: OBB = { cx: 0, cy: 0, hw: 20, hh: 1, cos: cos45, sin: sin45 };
    const b: OBB = { cx: 0, cy: 0, hw: 20, hh: 1, cos: cos45, sin: -sin45 };
    expect(obbIntersect(a, b)).toBe(true);
  });

  it("is symmetric", () => {
    const a: OBB = { cx: 0, cy: 0, hw: 10, hh: 10, cos: 0.8, sin: 0.6 };
    const b: OBB = { cx: 12, cy: 5, hw: 8, hh: 8, cos: 1, sin: 0 };
    expect(obbIntersect(a, b)).toBe(obbIntersect(b, a));
  });
});

//#endregion

//#region inflateBounds / boundsIntersect

describe("inflateBounds", () => {
  it("grows bounds on every side", () => {
    const bounds: Bounds = { left: 0, right: 10, top: 0, bottom: 10 };
    expect(inflateBounds(bounds, 5)).toEqual({ left: -5, right: 15, top: -5, bottom: 15 });
  });

  it("shrinks bounds with negative padding", () => {
    const bounds: Bounds = { left: 0, right: 10, top: 0, bottom: 10 };
    expect(inflateBounds(bounds, -2)).toEqual({ left: 2, right: 8, top: 2, bottom: 8 });
  });
});

describe("boundsIntersect", () => {
  it("detects overlap", () => {
    expect(boundsIntersect({ left: 0, right: 10, top: 0, bottom: 10 }, { left: 5, right: 15, top: 5, bottom: 15 })).toBe(true);
  });

  it("detects touching edges as intersecting (inclusive)", () => {
    expect(boundsIntersect({ left: 0, right: 10, top: 0, bottom: 10 }, { left: 10, right: 20, top: 0, bottom: 10 })).toBe(true);
  });

  it("detects disjoint boxes", () => {
    expect(boundsIntersect({ left: 0, right: 10, top: 0, bottom: 10 }, { left: 11, right: 20, top: 0, bottom: 10 })).toBe(false);
  });
});

//#endregion

//#region createCandidateSource

describe("createCandidateSource", () => {
  it("returns only items whose bounds intersect the query box", () => {
    const items = [
      { id: "a", bounds: { left: 0, right: 10, top: 0, bottom: 10 } },
      { id: "b", bounds: { left: 20, right: 30, top: 20, bottom: 30 } },
    ];
    const source = createCandidateSource(items, (item) => item.bounds);
    const results = source.query({ left: 5, right: 15, top: 5, bottom: 15 });
    expect(results.map((i) => i.id)).toEqual(["a"]);
  });

  it("returns an empty array when nothing matches", () => {
    const source = createCandidateSource([{ bounds: { left: 0, right: 1, top: 0, bottom: 1 } }], (item) => item.bounds);
    expect(source.query({ left: 100, right: 101, top: 100, bottom: 101 })).toEqual([]);
  });
});

//#endregion

//#region resolveDisplayStates

function obbAt(cx: number, cy: number, half = 10): OBB {
  return { cx, cy, hw: half, hh: half, cos: 1, sin: 0 };
}

describe("resolveDisplayStates", () => {
  it("keeps non-colliding markers visible", () => {
    const entries: ResolutionEntry[] = [
      { mode: "hide", priority: 1, obb: obbAt(0, 0) },
      { mode: "hide", priority: 1, obb: obbAt(100, 100) },
    ];
    expect(resolveDisplayStates(entries)).toEqual(["visible", "visible"]);
  });

  it("hides the lower-priority marker on overlap with mode 'hide'", () => {
    const entries: ResolutionEntry[] = [
      { mode: "hide", priority: 2, obb: obbAt(0, 0) },
      { mode: "hide", priority: 1, obb: obbAt(5, 0) },
    ];
    expect(resolveDisplayStates(entries)).toEqual(["visible", "hidden"]);
  });

  it("minimizes the lower-priority marker with mode 'minimize', and it still reserves its full box", () => {
    const entries: ResolutionEntry[] = [
      { mode: "minimize", priority: 3, obb: obbAt(0, 0) },
      { mode: "minimize", priority: 2, obb: obbAt(5, 0) },
      { mode: "minimize", priority: 1, obb: obbAt(5, 0) },
    ];
    // the third entry collides with the minimized (but still full-size, still placed) second entry
    expect(resolveDisplayStates(entries)).toEqual(["visible", "minimized", "minimized"]);
  });

  it("'always' mode is never hidden but still blocks lower-priority markers", () => {
    const entries: ResolutionEntry[] = [
      { mode: "always", priority: 5, obb: obbAt(0, 0) },
      { mode: "hide", priority: 1, obb: obbAt(5, 0) },
    ];
    expect(resolveDisplayStates(entries)).toEqual(["visible", "hidden"]);
  });

  it("'always' mode stays visible even while colliding with a higher-priority marker", () => {
    const entries: ResolutionEntry[] = [
      { mode: "hide", priority: 5, obb: obbAt(0, 0) },
      { mode: "always", priority: 1, obb: obbAt(5, 0) },
    ];
    expect(resolveDisplayStates(entries)).toEqual(["visible", "visible"]);
  });

  it("resolves priority ties by input (registration) order", () => {
    const entries: ResolutionEntry[] = [
      { mode: "hide", priority: 1, obb: obbAt(0, 0) },
      { mode: "hide", priority: 1, obb: obbAt(5, 0) },
    ];
    expect(resolveDisplayStates(entries)).toEqual(["visible", "hidden"]);
  });

  it("is deterministic across reruns on the same input", () => {
    const entries: ResolutionEntry[] = [
      { mode: "hide", priority: 3, obb: obbAt(0, 0) },
      { mode: "hide", priority: 2, obb: obbAt(5, 0) },
      { mode: "hide", priority: 1, obb: obbAt(10, 0) },
    ];
    const first = resolveDisplayStates(entries);
    const second = resolveDisplayStates(entries);
    expect(second).toEqual(first);
  });

  it("returns an empty array for no entries", () => {
    expect(resolveDisplayStates([])).toEqual([]);
  });

  it("exact=false uses the upright enclosing box even for rotated OBBs", () => {
    const rotated: OBB = { cx: 0, cy: 0, hw: 10, hh: 1, cos: Math.SQRT1_2, sin: Math.SQRT1_2 };
    // this box's own AABB overlaps rotated's enclosing AABB (right edge ~7.78)
    const other: OBB = { cx: 8, cy: 0, hw: 1, hh: 1, cos: 1, sin: 0 };
    const entries: ResolutionEntry[] = [
      { mode: "hide", priority: 2, obb: rotated },
      { mode: "hide", priority: 1, obb: other },
    ];
    const states = resolveDisplayStates(entries, false);
    expect(states[1]).toBe("hidden");
  });
});

//#endregion

//#region deriveCollisionGroups

describe("deriveCollisionGroups", () => {
  it("groups items connected directly or transitively", () => {
    const items = ["a", "b", "c", "d"];
    const pairs: [number, number][] = [
      [0, 1],
      [1, 2],
    ];
    const groups = deriveCollisionGroups(items, pairs);
    expect(groups).toHaveLength(1);
    expect(groups[0].sort()).toEqual(["a", "b", "c"]);
  });

  it("excludes singletons with no collisions", () => {
    const items = ["a", "b", "c"];
    const groups = deriveCollisionGroups(items, [[0, 1]]);
    expect(groups).toHaveLength(1);
    expect(groups[0].sort()).toEqual(["a", "b"]);
  });

  it("returns multiple independent groups", () => {
    const items = ["a", "b", "c", "d"];
    const pairs: [number, number][] = [
      [0, 1],
      [2, 3],
    ];
    const groups = deriveCollisionGroups(items, pairs);
    expect(groups).toHaveLength(2);
  });

  it("returns an empty array when there are no pairs", () => {
    expect(deriveCollisionGroups(["a", "b"], [])).toEqual([]);
  });
});

//#endregion

//#region Config

describe("DEFAULT_PROXIMITY_PADDING", () => {
  it("is 4px", () => {
    expect(DEFAULT_PROXIMITY_PADDING).toBe(4);
  });
});

//#endregion
