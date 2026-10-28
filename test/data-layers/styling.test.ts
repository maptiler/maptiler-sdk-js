import { describe, expect, it } from "vitest";
import { ColorRampCollection } from "../../src/ColorRamp";
import { fadeAtZoomEdges, isExpression, usesZoom } from "../../src/data-layers/styling";

describe("data layer styling", () => {
  describe("isExpression", () => {
    it("tells expressions from ramps", () => {
      expect(isExpression(["get", "mag"])).toBe(true);
      expect(isExpression([{ zoom: 0, value: 1 }])).toBe(false);
      expect(isExpression(ColorRampCollection.TURBO)).toBe(false);
      expect(isExpression("#ff0000")).toBe(false);
      expect(isExpression(1)).toBe(false);
    });
  });

  describe("usesZoom", () => {
    it("finds the zoom at any depth", () => {
      expect(usesZoom(["interpolate", ["linear"], ["zoom"], 0, 1, 10, 2])).toBe(true);
      expect(usesZoom(["*", 2, ["step", ["zoom"], 1, 5, 2]])).toBe(true);
      expect(usesZoom(["get", "zoom"])).toBe(false);
      expect(usesZoom(1)).toBe(false);
    });
  });

  describe("fadeAtZoomEdges", () => {
    it("fades in after minzoom and out before maxzoom", () => {
      expect(fadeAtZoomEdges(0.8, 2, 10, 0.5)).toEqual(["interpolate", ["linear"], ["zoom"], 2, 0, 2.5, 0.8, 9.5, 0.8, 10, 0]);
    });

    it("fades a data-driven opacity", () => {
      const opacity = ["get", "alpha"];
      expect(fadeAtZoomEdges(opacity as never, 2, 10, 1)).toEqual(["interpolate", ["linear"], ["zoom"], 2, 0, 3, opacity, 9, opacity, 10, 0]);
    });

    it("doesn't fade at the map's own zoom limits", () => {
      expect(fadeAtZoomEdges(1, 0, 24, 0.25)).toBe(1);
      expect(fadeAtZoomEdges(1, 0, 10, 1)).toEqual(["interpolate", ["linear"], ["zoom"], 9, 1, 10, 0]);
      expect(fadeAtZoomEdges(1, 9, 24, 1)).toEqual(["interpolate", ["linear"], ["zoom"], 9, 0, 10, 1]);
    });

    it("fades in and straight back out in a range narrower than its fades", () => {
      expect(fadeAtZoomEdges(1, 4, 5, 1)).toEqual(["interpolate", ["linear"], ["zoom"], 4, 0, 4.5, 1, 5, 0]);
      expect(fadeAtZoomEdges(1, 4, 6, 1)).toEqual(["interpolate", ["linear"], ["zoom"], 4, 0, 5, 1, 6, 0]);
    });

    it("leaves the opacity as is without a fade or a range", () => {
      expect(fadeAtZoomEdges(0.5, 2, 10, 0)).toBe(0.5);
      expect(fadeAtZoomEdges(0.5, 5, 5, 1)).toBe(0.5);
    });
  });
});
