import { describe, expect, it } from "vitest";
import { getOutsideCutlineColor, validateCutline, validateOutsideCutlineStyle } from "../src/ImageViewer/cutline";

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

  it("accepts cutlines with many points", () => {
    const circle = Array.from({ length: 100_000 }, (_, i): [number, number] => [Math.cos(i), Math.sin(i)]);

    expect(validateCutline(circle)).toHaveLength(100_000);
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
