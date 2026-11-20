import { describe, expect, it } from "vitest";
import type { ExpressionSpecification } from "maplibre-gl";
import { ColorRamp, ColorRampCollection } from "../../src/ColorRamp";
import {
  LINE_AND_POLYGON_GEOMETRY_FILTER,
  POINT_GEOMETRY_FILTER,
  fadeAtZoomEdges,
  isExpression,
  resolveColor,
  resolveDash,
  resolveNumber,
  scaleWidth,
  sumWidths,
  usesZoom,
} from "../../src/data-layers/style";

const ZOOM_INTERPOLATE: ExpressionSpecification = ["interpolate", ["linear"], ["zoom"], 5, 2, 10, 8];
const ZOOM_STEP: ExpressionSpecification = ["step", ["zoom"], 1, 8, 3, 12, 5];

describe("data layer style", () => {
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

  describe("geometry filters", () => {
    it("keep points, or everything but points", () => {
      expect(POINT_GEOMETRY_FILTER).toEqual(["==", ["geometry-type"], "Point"]);
      expect(LINE_AND_POLYGON_GEOMETRY_FILTER).toEqual(["!=", ["geometry-type"], "Point"]);
    });
  });

  describe("resolveNumber", () => {
    it("keeps a number or an expression as is", () => {
      expect(resolveNumber(3)).toBe(3);
      expect(resolveNumber(["get", "width"])).toEqual(["get", "width"]);
    });

    it("turns a zoom ramp into an interpolation over the zoom", () => {
      expect(
        resolveNumber([
          { zoom: 4, value: 1 },
          { zoom: 12, value: 6 },
        ]),
      ).toEqual(["interpolate", ["linear"], ["zoom"], 4, 1, 12, 6]);
    });
  });

  describe("resolveColor", () => {
    const ramp = new ColorRamp({
      stops: [
        { value: 10, color: [0, 0, 255, 255] },
        { value: 0, color: [255, 0, 0, 127.5] },
      ],
    });

    it("keeps a CSS colour or an expression as is", () => {
      expect(resolveColor("#ff0000", "mag")).toBe("#ff0000");
      expect(resolveColor(["get", "color"], undefined)).toEqual(["get", "color"]);
    });

    it("turns a zoom ramp into an interpolation over the zoom", () => {
      expect(
        resolveColor(
          [
            { zoom: 2, value: "red" },
            { zoom: 8, value: "blue" },
          ],
          undefined,
        ),
      ).toEqual(["interpolate", ["linear"], ["zoom"], 2, "red", 8, "blue"]);
    });

    it("interpolates a colour ramp over the property, its stops sorted and alpha kept", () => {
      expect(resolveColor(ramp, "mag")).toEqual(["interpolate", ["linear"], ["to-number", ["get", "mag"], 0], 0, "rgba(255, 0, 0, 0.5)", 10, "rgba(0, 0, 255, 1)"]);
    });

    it("takes a colour ramp's lowest colour without a property", () => {
      expect(resolveColor(ramp, undefined)).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("takes a one-stop colour ramp's colour, even with a property", () => {
      const single = new ColorRamp({ stops: [{ value: 3, color: [0, 128, 0, 255] }] });
      expect(resolveColor(single, "mag")).toBe("rgba(0, 128, 0, 1)");
    });
  });

  describe("resolveDash", () => {
    it("is undefined for a solid line", () => {
      expect(resolveDash(undefined)).toBeUndefined();
      expect(resolveDash(false)).toBeUndefined();
    });

    it("gives the same dashes for true and dashed, and dots for dotted", () => {
      expect(resolveDash(true)).toEqual([2, 1.5]);
      expect(resolveDash("dashed")).toEqual([2, 1.5]);
      expect(resolveDash("dotted")).toEqual([0.5, 2]);
    });

    it("keeps a number array, and reads the underscore shorthand", () => {
      expect(resolveDash([3, 1])).toEqual([3, 1]);
      expect(resolveDash("___ _ ")).toEqual([3, 1, 1, 1]);
    });
  });

  describe("scaleWidth", () => {
    it("scales a number", () => {
      expect(scaleWidth(4, 1.5)).toBe(6);
    });

    it("wraps an expression that doesn't read the zoom", () => {
      expect(scaleWidth(["get", "width"], 2)).toEqual(["*", 2, ["get", "width"]]);
    });

    it("scales each output of a top-level zoom interpolation or step", () => {
      expect(scaleWidth(ZOOM_INTERPOLATE, 2)).toEqual(["interpolate", ["linear"], ["zoom"], 5, 4, 10, 16]);
      expect(scaleWidth(["interpolate-hcl", ["linear"], ["zoom"], 0, 1, 10, 2] as never, 3)).toEqual(["interpolate-hcl", ["linear"], ["zoom"], 0, 3, 10, 6]);
      expect(scaleWidth(ZOOM_STEP, 2)).toEqual(["step", ["zoom"], 2, 8, 6, 12, 10]);
    });

    it("wraps a data-driven output of a zoom curve", () => {
      expect(scaleWidth(["interpolate", ["linear"], ["zoom"], 5, ["get", "w"], 10, 8], 2)).toEqual(["interpolate", ["linear"], ["zoom"], 5, ["*", 2, ["get", "w"]], 10, 16]);
    });

    it("can't scale the zoom nested below the top level, or a curve whose outputs read the zoom", () => {
      expect(scaleWidth(["*", 2, ZOOM_INTERPOLATE], 2)).toBeUndefined();
      expect(scaleWidth(["interpolate", ["linear"], ["zoom"], 5, ZOOM_STEP, 10, 8], 2)).toBeUndefined();
      expect(scaleWidth(["step", ["zoom"], ZOOM_STEP, 8, 3], 2)).toBeUndefined();
    });
  });

  describe("sumWidths", () => {
    it("adds numbers, and wraps expressions that don't read the zoom", () => {
      expect(sumWidths(2, 3)).toBe(5);
      expect(sumWidths(2, ["get", "w"])).toEqual(["+", 2, ["get", "w"]]);
    });

    it("adds the other width to each output of a zoom curve, whichever side it's on", () => {
      expect(sumWidths(ZOOM_INTERPOLATE, 1)).toEqual(["interpolate", ["linear"], ["zoom"], 5, 3, 10, 9]);
      expect(sumWidths(1, ZOOM_STEP)).toEqual(["step", ["zoom"], 2, 8, 4, 12, 6]);
      expect(sumWidths(ZOOM_INTERPOLATE, ["get", "w"])).toEqual(["interpolate", ["linear"], ["zoom"], 5, ["+", 2, ["get", "w"]], 10, ["+", 8, ["get", "w"]]]);
    });

    it("can't add two widths that both read the zoom, or one reading it below the top level", () => {
      expect(sumWidths(ZOOM_INTERPOLATE, ZOOM_STEP)).toBeUndefined();
      expect(sumWidths(["*", 2, ZOOM_INTERPOLATE], 1)).toBeUndefined();
    });
  });
});
