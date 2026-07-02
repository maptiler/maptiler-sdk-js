import type { MapTilerMarkerBaseOptions } from "./types";

//#region Types

export type ShapeDescriptor = {
  viewBox: [number, number];
  outerPath: string;
  innerPath: string;
  /** Center of the content area in viewBox coordinates. */
  contentCenter: [number, number];
  /** Height of the body region (excluding pointer) — used to scale font size. */
  contentAreaHeight: number;
};

//#endregion

//#region Lookup Tables

export const SIZE_PX: Record<NonNullable<MapTilerMarkerBaseOptions["size"]>, number> = {
  xs: 5,
  s: 16,
  m: 28,
  L: 40,
  XL: 56,
};

export const SHADOW_FILTER: Record<NonNullable<MapTilerMarkerBaseOptions["shadow"]>, string> = {
  soft: "drop-shadow(0 1px 2px rgba(0,0,0,0.20))",
  medium: "drop-shadow(0 2px 2px rgba(0,0,0,0.28)) drop-shadow(0 4px 4px rgba(0,0,0,0.15))",
  strong: "drop-shadow(0 4px 6px rgba(0,0,0,0.35)) drop-shadow(0 8px 10px rgba(0,0,0,0.20))",
};

//#endregion

//#region Shapes

// TODO: these will be updated when it comes to applying the presets.
export const SHAPES: Record<NonNullable<MapTilerMarkerBaseOptions["shape"]>, ShapeDescriptor> = {
  rounded: {
    viewBox: [110, 110],
    outerPath: "M 20,0 H 90 A 20,20 0 0 1 110,20 V 90 A 20,20 0 0 1 90,110 H 20 A 20,20 0 0 1 0,90 V 20 A 20,20 0 0 1 20,0 Z",
    innerPath: "M 20,10 H 90 A 10,10 0 0 1 100,20 V 90 A 10,10 0 0 1 90,100 H 20 A 10,10 0 0 1 10,90 V 20 A 10,10 0 0 1 20,10 Z",
    contentCenter: [55, 55],
    contentAreaHeight: 80,
  },
  circle: {
    viewBox: [110, 110],
    outerPath: "M 55,0 A 55,55 0 0 1 110,55 A 55,55 0 0 1 55,110 A 55,55 0 0 1 0,55 A 55,55 0 0 1 55,0 Z",
    innerPath: "M 55,10 A 45,45 0 0 1 100,55 A 45,45 0 0 1 55,100 A 45,45 0 0 1 10,55 A 45,45 0 0 1 55,10 Z",
    contentCenter: [55, 55],
    contentAreaHeight: 90,
  },
  "bubble-circle": {
    viewBox: [110, 140],
    outerPath: "M 55,0 A 55,55 0 0 1 110,55 A 55,55 0 0 1 85,101 L 55,140 L 25,101 A 55,55 0 0 1 0,55 A 55,55 0 0 1 55,0 Z",
    innerPath: "M 55,10 A 45,45 0 0 1 100,55 A 45,45 0 0 1 76,95 L 55,128 L 34,95 A 45,45 0 0 1 10,55 A 45,45 0 0 1 55,10 Z",
    contentCenter: [55, 55],
    contentAreaHeight: 90,
  },
  "bubble-square": {
    viewBox: [122.96108, 126.06905],
    outerPath:
      "M 19.453125,0 C 8.677726,0 0,10.046094 0,22.527344 v 63.957031 c 0,12.473956 8.677426,22.527345 19.453125,22.527345 h 23.261719 l 12.401718,13.67578 c 4.170654,4.62119 5.628911,4.39488 10.506563,0 l 14.615157,-13.67578 h 23.257808 c 10.7754,0 19.45899,-10.046096 19.45899,-22.527345 l 0.006,-63.957031 C 122.96098,10.053387 114.28369,0 103.50199,0 Z",
    innerPath:
      "M 20.18,10.09 H 102.78 A 10.09,10.09 0 0 1 112.87,20.18 V 88.84 A 10.09,10.09 0 0 1 102.78,98.93 H 80.57 L 64.48,111.91 C 64.02,112.33 63.58,112.54 63.10,112.54 C 62.59,112.54 62.11,112.30 61.60,111.91 L 42.39,98.93 H 20.18 A 10.09,10.09 0 0 1 10.09,88.84 V 20.18 A 10.09,10.09 0 0 1 20.18,10.09 Z",
    contentCenter: [61.66, 54.55],
    contentAreaHeight: 98.93,
  },
  square: {
    viewBox: [110, 110],
    outerPath: "M 0,0 H 110 V 110 H 0 Z",
    innerPath: "M 10,10 H 100 V 100 H 10 Z",
    contentCenter: [55, 55],
    contentAreaHeight: 80,
  },
  bulb: {
    viewBox: [110, 160],
    outerPath: "M 55,5 C 85,5 105,25 105,55 C 105,85 85,100 70,110 C 60,120 55,160 55,160 C 55,160 50,120 40,110 C 25,100 5,85 5,55 C 5,25 25,5 55,5 Z",
    innerPath: "M 55,15 C 80,15 95,30 95,55 C 95,80 78,93 65,103 C 58,115 55,150 55,150 C 55,150 52,115 45,103 C 32,93 15,80 15,55 C 15,30 30,15 55,15 Z",
    contentCenter: [55, 55],
    contentAreaHeight: 80,
  },
  squircle: {
    viewBox: [110, 110],
    outerPath: "M 55,0 C 97.35,0 110,12.65 110,55 C 110,97.35 97.35,110 55,110 C 12.65,110 0,97.35 0,55 C 0,12.65 12.65,0 55,0 Z",
    innerPath: "M 55,10 C 89.65,10 100,20.35 100,55 C 100,89.65 89.65,100 55,100 C 20.35,100 10,89.65 10,55 C 10,20.35 20.35,10 55,10 Z",
    contentCenter: [55, 55],
    contentAreaHeight: 80,
  },
  shield: {
    viewBox: [110, 130],
    outerPath: "M 5,0 H 105 A 5,5 0 0 1 110,5 V 65 Q 110,110 55,130 Q 0,110 0,65 V 5 A 5,5 0 0 1 5,0 Z",
    innerPath: "M 10,10 H 100 V 65 Q 100,100 55,118 Q 10,100 10,65 V 10 Z",
    contentCenter: [55, 50],
    contentAreaHeight: 80,
  },
};

//#endregion

//#region Defaults

export const DEFAULT_SHAPE: NonNullable<MapTilerMarkerBaseOptions["shape"]> = "bubble-square";
export const DEFAULT_SIZE: NonNullable<MapTilerMarkerBaseOptions["size"]> = "m";
export const DEFAULT_OUTLINE_WIDTH = 2;
export const DEFAULT_OUTER_COLOR = "#FFFFFF";
export const DEFAULT_INNER_COLOR = "hsl(223, 100%, 65%)";
export const DEFAULT_CONTENT_COLOR = "#FFFFFF";

// TODO: Default Y offsets, this is to ensure that the markers are positioned correctly depending on their size / viewbox
// as right now they are just centered.
export const DEFAULT_OFFSET_Y: Record<NonNullable<MapTilerMarkerBaseOptions["size"]>, number> = {
  xs: 0,
  s: 0,
  m: 0,
  L: 0,
  XL: 0,
};

//#endregion
