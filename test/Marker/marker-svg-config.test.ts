import { describe, expect, it } from "vitest";
import { SHAPES, getShapeAnchorOffset, getShapeGeometry } from "../../src/Marker/marker-svg-config";
import { CONTENT_METRICS, DEFAULT_SHAPE, DEFAULT_SIZE, SHADOW_FILTER, SIZE_PX } from "../../src/Marker/marker-constants";

describe("SIZE_PX / SHAPES tables", () => {
  it("has a pixel size for every marker size key", () => {
    const sizes = ["xs", "s", "m", "l"];
    for (const key of Object.keys(SIZE_PX)) {
      expect(sizes).toContain(key);
    }
  });

  it("sizes increase monotonically from xs to l", () => {
    const ordered = (["xs", "s", "m", "l"] as const).map((s) => SIZE_PX[s]);
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i]).toBeGreaterThan(ordered[i - 1]);
    }
  });

  it("every shape has an anchor and geometry for every shape size", () => {
    for (const key of Object.keys(SHAPES) as (keyof typeof SHAPES)[]) {
      const shape = SHAPES[key];
      expect(["bottom", "center"]).toContain(shape.anchor);
      for (const size of ["s", "m", "l"] as const) {
        const geometry = shape.sizes[size];
        expect(["path", "circle", "rect"]).toContain(geometry.outer.type);
        expect(geometry.inner.length).toBeGreaterThan(0);
        expect(geometry.clip.w).toBeGreaterThan(0);
      }
    }
  });

  it("keeps every shape's content box inside its marker box", () => {
    for (const key of Object.keys(SHAPES) as (keyof typeof SHAPES)[]) {
      for (const size of ["s", "m", "l"] as const) {
        const { content } = getShapeGeometry(key, size);
        const half = CONTENT_METRICS[size].box / 2;
        expect(content.cx - half).toBeGreaterThanOrEqual(0);
        expect(content.cy + half).toBeLessThanOrEqual(SIZE_PX[size]);
      }
    }
  });

  it("uses the design's content metrics per size", () => {
    expect(CONTENT_METRICS.l).toEqual({ box: 20, icon: 16, font: 14, baseline: 5, singleChar: { font: 15.5, baseline: 5.5 } });
    expect(CONTENT_METRICS.m).toEqual({ box: 16, icon: 12, font: 12, baseline: 4, singleChar: { font: 13, baseline: 4.5 } });
    expect(CONTENT_METRICS.s).toEqual({ box: 12, icon: 8, font: 8, baseline: 3, singleChar: { font: 10, baseline: 3.5 } });
  });

  it("resolves xs to the fallback size's geometry", () => {
    expect(getShapeGeometry("circle", "xs")).toBe(SHAPES.circle.sizes.m);
    expect(getShapeGeometry("circle", "xs", "l")).toBe(SHAPES.circle.sizes.l);
  });

  it("has a drop-shadow filter for every shadow intensity", () => {
    const shadows = ["none", "soft", "medium", "strong"];
    for (const key of Object.keys(SHADOW_FILTER)) {
      expect(shadows).toContain(key);
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
    const large = getShapeAnchorOffset("bubble-square", "l")[1];
    expect(Math.abs(large)).toBeGreaterThan(Math.abs(small));
  });

  it("puts the tip of a bottom-anchored shape on the lngLat (half the box height up)", () => {
    for (const sizeKey of ["s", "m", "l"] as const) {
      for (const shapeKey of ["bubble-circle", "bubble-square", "maptiler", "maptiler-full"] as const) {
        expect(SHAPES[shapeKey].anchor).toBe("bottom");
        expect(getShapeAnchorOffset(shapeKey, sizeKey)).toEqual([0, -SIZE_PX[sizeKey] / 2]);
      }
    }
  });
});
