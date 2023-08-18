import { DataDrivenPropertyValueSpecification } from "maplibre-gl";
import { generateRandomString } from "./tools";

export type ColorPalette = [string, string, string, string];

const DEFAULT_LINE_WIDTH = 4;

export const colorPalettes: Array<ColorPalette> = [
  // https://colorhunt.co/palette/1d5b79468b97ef6262f3aa60
  [
    "#1D5B79",
    "#468B97",
    "#EF6262",
    "#F3AA60",
  ],
  
  // https://colorhunt.co/palette/614bc333bbc585e6c5c8ffe0
  [
    "#614BC3",
    "#33BBC5",
    "#85E6C5",
    "#C8FFE0",
  ],
  
  // https://colorhunt.co/palette/4619597a316fcd6688aed8cc
  [
    "#461959",
    "#7A316F",
    "#CD6688",
    "#AED8CC",
  ],
  
  // https://colorhunt.co/palette/0079ff00dfa2f6fa70ff0060
  [
    "#0079FF",
    "#00DFA2",
    "#F6FA70",
    "#FF0060",
  ],
  
  //https://colorhunt.co/palette/39b5e0a31acbff78f0f5ea5a
  [
    "#39B5E0",
    "#A31ACB",
    "#FF78F0",
    "#F5EA5A",
  ],

  // https://colorhunt.co/palette/37e2d5590696c70a80fbcb0a
  [
    "#37E2D5",
    "#590696",
    "#C70A80",
    "#FBCB0A",
  ],

  // https://colorhunt.co/palette/ffd36efff56d99ffcd9fb4ff
  [
    "#FFD36E",
    "#FFF56D",
    "#99FFCD",
    "#9FB4FF",
  ],

  // https://colorhunt.co/palette/00ead3fff5b7ff449f005f99
  [
    "#00EAD3",
    "#FFF5B7",
    "#FF449F",
    "#005F99",
  ],

  // https://colorhunt.co/palette/10a19d540375ff7000ffbf00
  [
    "#10A19D",
    "#540375",
    "#FF7000",
    "#FFBF00",
  ]
]


export function getRandomColor(): string {
  return colorPalettes[~~(Math.random() * colorPalettes.length)][~~(Math.random() * 4)];
}

export function generateRandomSourceName(): string {
  return `maptiler_source_${generateRandomString()}`;
}


export function generateRandomLayerName(): string {
  return `maptiler_layer_${generateRandomString()}`;
}


/**
 * Array of string values that depend on zoom level
 */
export type ZoomStringValues = Array<{
  /**
   * Zoom level
   */
  zoom: number,
  
  /**
   * Value for the given zoom level
   */
  value: string
}>;

/**
 * 
 * Array of number values that depend on zoom level
 */
export type ZoomNumberValues = Array<{
  /**
   * Zoom level
   */
  zoom: number,
  
  /**
   * Value for the given zoom level
   */
  value: number
}>;



export type PolylineLayerOptions = {
  /**
   * ID to give to the layer. 
   * If not provided, an auto-generated ID of the for "maptiler-layer-xxxxxx" will be auto-generated,
   * with "xxxxxx" being a random string.
   */
  layerId?: string,

  /**
   * ID to give to the geojson source. 
   * If not provided, an auto-generated ID of the for "maptiler-source-xxxxxx" will be auto-generated,
   * with "xxxxxx" being a random string.
   */
  sourceId?: string,

  /**
   * The ID of an existing layer to insert the new layer before, resulting in the new layer appearing
   * visually beneath the existing layer. If this argument is not specified, the layer will be appended 
   * to the end of the layers array and appear visually above all other layers.
   */
  beforeId?: string,

  /**
   * Color of the line (or polyline). This is can be a constant color string or a definition based on zoom levels
   */
  lineColor?: string | ZoomStringValues,

  /**
   * Width of the line (relative to screen-space). This is can be a constant width or a definition based on zoom levels
   */
  lineWidth?: number | ZoomNumberValues,

  /**
   * Opacity of the line. This is can be a constant opacity in [0, 1] or a definition based on zoom levels
   */
  lineOpacity?: number | ZoomNumberValues,

  /**
   * Whether or not to add an outline (default: false)
   */
  outline?: boolean,

  /**
   * Color of the outline. This is can be a constant color string or a definition based on zoom levels
   */
  outlineColor?: string | ZoomStringValues,

  /**
   * Width of the outline (relative to screen-space). This is can be a constant width or a definition based on zoom levels
   */
  outlineWidth?: number | ZoomNumberValues,

  /**
   * Opacity of the outline. This is can be a constant opacity in [0, 1] or a definition based on zoom levels
   */
  outlineOpacity?: number | ZoomNumberValues,
}


export function lineColorOptionsToLineLayerPaintSpec(color: undefined | string | ZoomStringValues, defaultColor?: string): string | DataDrivenPropertyValueSpecification<string> {
  if (typeof color === "string") {
    return color;
  }

  // assuming color is of type ZoomStringValues
  if (Array.isArray(color)) {
    const c = color as ZoomStringValues;
    return [
      "interpolate",
      ["linear"],
      ['zoom'],
      ...c.map((el) => [el.zoom, el.value]).flat(),  
    ]
  }

  if (defaultColor) {
    return defaultColor;
  }

  return getRandomColor();
}


export function lineWidthOptionsToLineLayerPaintSpec(width: undefined | number | ZoomNumberValues): number | DataDrivenPropertyValueSpecification<number> {
  if (typeof width === "number") {
    return width;
  }

  // assuming color is of type ZoomStringValues
  if (Array.isArray(width)) {
    const w = width as ZoomNumberValues;
    return [
      "interpolate",
      ["linear"],
      ['zoom'],
      ...w.map((el) => [el.zoom, el.value]).flat(),  
    ]
  }

  return DEFAULT_LINE_WIDTH;
}


export function lineOpacityOptionsToLineLayerPaintSpec(opacity: undefined | number | ZoomNumberValues): number | DataDrivenPropertyValueSpecification<number> {
  if (typeof opacity === "number") {
    return opacity;
  }

  // assuming color is of type ZoomStringValues
  if (Array.isArray(opacity)) {
    const w = opacity as ZoomNumberValues;
    return [
      "interpolate",
      ["linear"],
      ['zoom'],
      ...w.map((el) => [el.zoom, el.value]).flat(),  
    ]
  }

  return 1;
}



export function outlineColorOptionsToOutlineLayerPaintSpec(color: undefined | string | ZoomStringValues): string | DataDrivenPropertyValueSpecification<string> {
  if (typeof color === "string") {
    return color;
  }

  // assuming color is of type ZoomStringValues
  if (Array.isArray(color)) {
    const c = color as ZoomStringValues;
    return [
      "interpolate",
      ["linear"],
      ['zoom'],
      ...c.map((el) => [el.zoom, el.value]).flat(),  
    ]
  }

  return getRandomColor();
}

export function lineWidthOptionsToOutlineLayerPaintSpec(lineWidth: undefined | number | ZoomNumberValues, outlineWidth: number | undefined): number | DataDrivenPropertyValueSpecification<number> {
  const actualOutlineWidth = outlineWidth ?? 1;
  
  if (typeof lineWidth === "number") {
    return lineWidth + 2 * actualOutlineWidth;
  }

  // assuming color is of type ZoomStringValues
  if (Array.isArray(lineWidth)) {
    const w = lineWidth as ZoomNumberValues;
    return [
      "interpolate",
      ["linear"],
      ['zoom'],
      ...w.map((el) => [el.zoom, el.value + 2 * actualOutlineWidth]).flat(),  
    ]
  }

  return DEFAULT_LINE_WIDTH + 2 * actualOutlineWidth;
}