import { describe, expect, it } from "vitest";
import { ADAPTIVE_COLORS, getAdaptiveBgColor, resolveAdaptiveColor, type AdaptiveColor } from "../../src/Marker/marker-adaptive-colors";

//#region resolveAdaptiveColor

describe("resolveAdaptiveColor", () => {
  it("resolves a built-in palette name to its definition", () => {
    expect(resolveAdaptiveColor("blue")).toBe(ADAPTIVE_COLORS.blue);
  });

  it("passes a custom AdaptiveColor definition through unchanged", () => {
    const custom: AdaptiveColor = { name: "Custom", bgColors: { base: "#123456" } };
    expect(resolveAdaptiveColor(custom)).toBe(custom);
  });

  it("returns undefined for an unknown name (untyped caller)", () => {
    expect(resolveAdaptiveColor("not-a-color" as never)).toBeUndefined();
  });
});

//#endregion

//#region getAdaptiveBgColor

describe("getAdaptiveBgColor", () => {
  it("returns the exact style-key match when present", () => {
    expect(getAdaptiveBgColor(ADAPTIVE_COLORS.blue, "streets-dark")).toBe(ADAPTIVE_COLORS.blue.bgColors["streets-dark"]);
  });

  it("strips a version segment before matching", () => {
    expect(getAdaptiveBgColor(ADAPTIVE_COLORS.blue, "streets-v4-dark")).toBe(ADAPTIVE_COLORS.blue.bgColors["streets-dark"]);
  });

  it("falls back to the reference style without variant when no exact match exists", () => {
    // "streets-nonexistent-variant" has no direct entry, but "streets" does
    expect(getAdaptiveBgColor(ADAPTIVE_COLORS.blue, "streets-nonexistent-variant")).toBe(ADAPTIVE_COLORS.blue.bgColors.streets);
  });

  it("falls back to base when the style is entirely unknown", () => {
    expect(getAdaptiveBgColor(ADAPTIVE_COLORS.blue, "some-unknown-style")).toBe(ADAPTIVE_COLORS.blue.bgColors.base);
  });

  it("matches case-insensitively", () => {
    expect(getAdaptiveBgColor(ADAPTIVE_COLORS.red, "STREETS-DARK")).toBe(ADAPTIVE_COLORS.red.bgColors["streets-dark"]);
  });

  it("falls back to base for a custom color with no matching keys at all", () => {
    const custom: AdaptiveColor = { name: "Custom", bgColors: { base: "#abcdef" } };
    expect(getAdaptiveBgColor(custom, "streets-v4-dark")).toBe("#abcdef");
  });
});

//#endregion
