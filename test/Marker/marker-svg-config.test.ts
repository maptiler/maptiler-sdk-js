import { describe, expect, it } from "vitest";
import { DEFAULT_SHAPE, DEFAULT_SIZE, SHADOW_FILTER, SHAPES, SIZE_PX, getShapeAnchorOffset } from "../../src/Marker/marker-svg-config";

describe("SIZE_PX / SHAPES tables", () => {
  it("has a pixel size for every marker size key", () => {
    for (const size of ["xs", "s", "m", "l", "xl"] as const) {
      expect(SIZE_PX[size]).toBeGreaterThan(0);
    }
  });

  it("sizes increase monotonically from xs to xl", () => {
    const ordered = (["xs", "s", "m", "l", "xl"] as const).map((s) => SIZE_PX[s]);
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i]).toBeGreaterThan(ordered[i - 1]);
    }
  });

  it("every shape has a viewBox and an anchor", () => {
    for (const key of Object.keys(SHAPES) as (keyof typeof SHAPES)[]) {
      const shape = SHAPES[key];
      expect(shape.viewBox).toHaveLength(2);
      expect(["bottom", "center"]).toContain(shape.anchor);
    }
  });

  it("has a drop-shadow filter for every shadow intensity", () => {
    for (const shadow of ["soft", "medium", "strong"] as const) {
      expect(SHADOW_FILTER[shadow]).toContain("drop-shadow");
    }
  });

  it("DEFAULT_SHAPE and DEFAULT_SIZE are valid keys in their tables", () => {
    expect(SHAPES[DEFAULT_SHAPE]).toBeDefined();
    expect(SIZE_PX[DEFAULT_SIZE]).toBeDefined();
  });
});

describe("getShapeAnchorOffset", () => {
  it("returns [0, 0] at xs regardless of shape", () => {
    expect(getShapeAnchorOffset("bubble-square", "xs")).toEqual([0, 0]);
    expect(getShapeAnchorOffset("circle", "xs")).toEqual([0, 0]);
  });

  it("returns [0, 0] for center-anchored shapes", () => {
    expect(SHAPES.circle.anchor).toBe("center");
    expect(getShapeAnchorOffset("circle", "m")).toEqual([0, 0]);
  });

  it("shifts a bottom-anchored shape up so its tip sits on the lngLat", () => {
    const [x, y] = getShapeAnchorOffset("bubble-square", "m");
    expect(x).toBe(0);
    expect(y).toBeLessThan(0);
  });

  it("scales the offset with size", () => {
    const small = getShapeAnchorOffset("bubble-square", "s")[1];
    const large = getShapeAnchorOffset("bubble-square", "xl")[1];
    expect(Math.abs(large)).toBeGreaterThan(Math.abs(small));
  });

  it("matches the manual formula for a bottom-anchored shape", () => {
    const shapeKey = "rounded" as const;
    const sizeKey = "m" as const;
    const shape = SHAPES[shapeKey];
    const heightPx = SIZE_PX[sizeKey];
    const scale = heightPx / shape.viewBox[1];
    const expectedY = -(shape.anchorY * scale - heightPx / 2);
    expect(getShapeAnchorOffset(shapeKey, sizeKey)).toEqual([0, expectedY]);
  });

  it("matches the manual formula for every other bottom-anchored shape", () => {
    const sizeKey = "m" as const;
    for (const shapeKey of ["bubble-circle", "bulb", "squircle", "shield"] as const) {
      const shape = SHAPES[shapeKey];
      expect(shape.anchor).toBe("bottom");
      const heightPx = SIZE_PX[sizeKey];
      const scale = heightPx / shape.viewBox[1];
      const expectedY = -(shape.anchorY * scale - heightPx / 2);
      expect(getShapeAnchorOffset(shapeKey, sizeKey)).toEqual([0, expectedY]);
    }
  });
});
