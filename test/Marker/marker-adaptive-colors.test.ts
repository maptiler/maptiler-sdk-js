import { describe, expect, it } from "vitest";
import { ADAPTIVE_COLORS, getAdaptiveColors } from "../../src/Marker/marker-adaptive-colors";

//#region getAdaptiveColors

describe("getAdaptiveColors", () => {
  it("returns the exact style-key match when present", () => {
    expect(getAdaptiveColors("streets-dark")).toBe(ADAPTIVE_COLORS["streets-dark"]);
  });

  it("strips a version segment before matching", () => {
    expect(getAdaptiveColors("streets-v4-dark")).toBe(ADAPTIVE_COLORS["streets-dark"]);
  });

  it("falls back to the reference style without variant when no exact match exists", () => {
    // "streets-nonexistent-variant" has no direct entry, but "streets" does
    expect(getAdaptiveColors("streets-nonexistent-variant")).toBe(ADAPTIVE_COLORS.streets);
  });

  it("falls back to base when the style is entirely unknown", () => {
    expect(getAdaptiveColors("some-unknown-style")).toBe(ADAPTIVE_COLORS.base);
  });

  it("falls back to base for an empty style id", () => {
    expect(getAdaptiveColors("")).toBe(ADAPTIVE_COLORS.base);
  });

  it("matches case-insensitively", () => {
    expect(getAdaptiveColors("STREETS-DARK")).toBe(ADAPTIVE_COLORS["streets-dark"]);
  });

  it("gives every dark style a #292929 outer and content colour", () => {
    for (const key of ["base-dark", "streets-dark", "dataviz-dark"] as const) {
      expect(ADAPTIVE_COLORS[key]).toMatchObject({ outerColor: "#292929", contentColor: "#292929" });
    }
  });
});

//#endregion
