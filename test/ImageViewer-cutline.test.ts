import { describe, expect, it } from "vitest";
import { getOutsideCutlineColor, triangulateOutsideCutline, validateCutline, validateOutsideCutlineStyle, type ImageViewerCutline } from "../src/ImageViewer/cutline";

describe("validateCutline", () => {
  it("accepts an open ring of 3 points", () => {
    expect(
      validateCutline([
        [0, 0],
        [100, 0],
        [100, 50],
      ]),
    ).toEqual([
      [0, 0],
      [100, 0],
      [100, 50],
    ]);
  });

  it("accepts a closed ring of 3 distinct points", () => {
    const closed: [number, number][] = [
      [0, 0],
      [100, 0],
      [100, 50],
      [0, 0],
    ];
    expect(validateCutline(closed)).toEqual(closed);
  });

  it("returns a copy, down to the points", () => {
    const cutline: [number, number][] = [
      [0, 0],
      [100, 0],
      [100, 50],
    ];
    const validated = validateCutline(cutline);

    expect(validated).not.toBe(cutline);
    expect(validated[0]).not.toBe(cutline[0]);
  });

  it("accepts points outside of the image and with fractional coordinates", () => {
    expect(() =>
      validateCutline([
        [-10, -10],
        [10.5, 0],
        [0, 1e6],
      ]),
    ).not.toThrow();
  });

  it("throws for fewer than 3 points", () => {
    expect(() => validateCutline([])).toThrow("[ImageViewer]: `cutline` must have at least 3 points, got 0");
    expect(() => validateCutline([[0, 0]])).toThrow("got 1");
    expect(() =>
      validateCutline([
        [0, 0],
        [100, 0],
      ]),
    ).toThrow("got 2");
  });

  it("does not count the closing point", () => {
    expect(() =>
      validateCutline([
        [0, 0],
        [100, 0],
        [0, 0],
      ]),
    ).toThrow("got 2");
  });

  it("accepts up to 65532 points, the most 16-bit indices can draw", () => {
    const circle = (count: number) => Array.from({ length: count }, (_, i): [number, number] => [Math.cos(i), Math.sin(i)]);

    expect(() => validateCutline(circle(65532))).not.toThrow();
    expect(() => validateCutline(circle(65533))).toThrow("[ImageViewer]: `cutline` must have at most 65532 points, got 65533");
  });

  it("throws when the cutline is not an array", () => {
    expect(() => validateCutline(undefined)).toThrow("[ImageViewer]: `cutline` must be an array of [x, y] points");
    expect(() => validateCutline({ 0: [0, 0] })).toThrow("must be an array");
    expect(() => validateCutline("0,0 1,1 2,2")).toThrow("must be an array");
  });

  it.each([
    ["not an array", 5],
    ["too few coordinates", [0]],
    ["too many coordinates", [0, 0, 0]],
    ["a string coordinate", [0, "1"]],
    ["NaN", [0, NaN]],
    ["Infinity", [Infinity, 0]],
    ["null", null],
  ])("throws for a point that is %s, naming its index", (_, point) => {
    expect(() => validateCutline([[0, 0], [100, 0], point])).toThrow("[ImageViewer]: `cutline` point at index 2 must be an [x, y] pair of finite numbers");
  });
});

describe("validateOutsideCutlineStyle", () => {
  it("accepts hidden and overlay styles, and returns a copy without other properties", () => {
    const overlay = { type: "overlay", color: "rgba(0, 0, 0, 0.5)", extra: true };

    expect(validateOutsideCutlineStyle({ type: "hidden", color: "red" })).toEqual({ type: "hidden" });
    expect(validateOutsideCutlineStyle(overlay)).toEqual({ type: "overlay", color: "rgba(0, 0, 0, 0.5)" });
    expect(validateOutsideCutlineStyle(overlay)).not.toBe(overlay);
  });

  it.each(["red", "#ff000080", "hsl(120 50% 50% / 0.3)", "transparent"])("accepts the CSS color %s", (color) => {
    expect(() => validateOutsideCutlineStyle({ type: "overlay", color })).not.toThrow();
  });

  it.each([undefined, null, "hidden", {}, { type: "blur" }])("throws for the style %j", (style) => {
    expect(() => validateOutsideCutlineStyle(style)).toThrow('[ImageViewer]: `outsideCutlineStyle.type` must be "hidden" or "overlay"');
  });

  it.each([undefined, 5, "", "not-a-color"])("throws for the overlay color %j", (color) => {
    expect(() => validateOutsideCutlineStyle({ type: "overlay", color })).toThrow("[ImageViewer]: `outsideCutlineStyle.color` must be a valid CSS color");
  });
});

describe("getOutsideCutlineColor", () => {
  it("is fully transparent for hidden", () => {
    expect(getOutsideCutlineColor({ type: "hidden" })).toEqual([0, 0, 0, 0]);
  });

  it("is the premultiplied overlay color", () => {
    expect(getOutsideCutlineColor({ type: "overlay", color: "rgba(255, 0, 0, 0.5)" })).toEqual([0.5, 0, 0, 0.5]);
    expect(getOutsideCutlineColor({ type: "overlay", color: "black" })).toEqual([0, 0, 0, 1]);
  });
});

describe("triangulateOutsideCutline", () => {
  const IMAGE_SIZE: [number, number] = [4096, 2048];

  function getTriangles({ vertices, indices }: ReturnType<typeof triangulateOutsideCutline>) {
    const triangles: [number, number][][] = [];
    for (let i = 0; i < indices.length; i += 3) {
      triangles.push(indices.slice(i, i + 3).map((index) => [vertices[index * 2], vertices[index * 2 + 1]]));
    }
    return triangles;
  }

  function getArea(ring: [number, number][]) {
    let area = 0;
    for (let i = 0; i < ring.length; i++) {
      const [x0, y0] = ring[i];
      const [x1, y1] = ring[(i + 1) % ring.length];
      area += x0 * y1 - x1 * y0;
    }
    return Math.abs(area) / 2;
  }

  function isInside([x, y]: [number, number], ring: [number, number][]) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  // checks the triangles cover the outer box minus the cutline, without overlapping it
  function expectOutsideOf(cutline: ImageViewerCutline, outerArea: number) {
    const triangles = getTriangles(triangulateOutsideCutline(cutline, IMAGE_SIZE));
    const area = triangles.reduce((sum, triangle) => sum + getArea(triangle), 0);

    expect(area).toBeCloseTo(outerArea - getArea(cutline));
    for (const triangle of triangles) {
      const centroid: [number, number] = [(triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3, (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3];
      expect(isInside(centroid, cutline)).toBe(false);
    }
  }

  const square: ImageViewerCutline = [
    [256, 256],
    [3840, 256],
    [3840, 1792],
    [256, 1792],
  ];

  it("starts with the corners around the image, padded by its size, followed by the cutline", () => {
    const { vertices } = triangulateOutsideCutline(square, IMAGE_SIZE);

    expect(vertices).toEqual([-4096, -4096, 8192, -4096, 8192, 6144, -4096, 6144, ...square.flat()]);
  });

  it("drops the closing point of the cutline", () => {
    const { vertices } = triangulateOutsideCutline([...square, square[0]], IMAGE_SIZE);

    expect(vertices).toHaveLength((4 + 4) * 2);
  });

  // the image, padded by its size on each side
  const OUTER_AREA = 4096 * 3 * (2048 + 4096 * 2);

  it("covers the image outside of a square cutline", () => {
    expectOutsideOf(square, OUTER_AREA);
  });

  it("covers the image outside of a concave cutline, whichever its winding", () => {
    const lShape: ImageViewerCutline = [
      [256, 256],
      [2048, 256],
      [2048, 1024],
      [3840, 1024],
      [3840, 1792],
      [256, 1792],
    ];

    expectOutsideOf(lShape, OUTER_AREA);
    expectOutsideOf([...lShape].reverse(), OUTER_AREA);
  });

  it("extends around a cutline that goes beyond the image", () => {
    const beyond: ImageViewerCutline = [
      [-100, 100],
      [5000, 100],
      [5000, 3000],
    ];
    const { vertices } = triangulateOutsideCutline(beyond, IMAGE_SIZE);

    expect(vertices.slice(0, 8)).toEqual([-4196, -4096, 9096, -4096, 9096, 7096, -4196, 7096]);
    expectOutsideOf(beyond, (5100 + 4096 * 2) * (3000 + 4096 * 2));
  });
});
