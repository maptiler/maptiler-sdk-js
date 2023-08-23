import { FeatureCollection } from "geojson";
import { DataDrivenPropertyValueSpecification } from "maplibre-gl";
import { generateRandomString } from "./tools";

export type ColorPalette = [string, string, string, string];

export const colorPalettes: Array<ColorPalette> = [
  // https://colorhunt.co/palette/1d5b79468b97ef6262f3aa60
  ["#1D5B79", "#468B97", "#EF6262", "#F3AA60"],

  // https://colorhunt.co/palette/614bc333bbc585e6c5c8ffe0
  ["#614BC3", "#33BBC5", "#85E6C5", "#C8FFE0"],

  // https://colorhunt.co/palette/4619597a316fcd6688aed8cc
  ["#461959", "#7A316F", "#CD6688", "#AED8CC"],

  // https://colorhunt.co/palette/0079ff00dfa2f6fa70ff0060
  ["#0079FF", "#00DFA2", "#F6FA70", "#FF0060"],

  //https://colorhunt.co/palette/39b5e0a31acbff78f0f5ea5a
  ["#39B5E0", "#A31ACB", "#FF78F0", "#F5EA5A"],

  // https://colorhunt.co/palette/37e2d5590696c70a80fbcb0a
  ["#37E2D5", "#590696", "#C70A80", "#FBCB0A"],

  // https://colorhunt.co/palette/ffd36efff56d99ffcd9fb4ff
  ["#FFD36E", "#FFF56D", "#99FFCD", "#9FB4FF"],

  // https://colorhunt.co/palette/00ead3fff5b7ff449f005f99
  ["#00EAD3", "#FFF5B7", "#FF449F", "#005F99"],

  // https://colorhunt.co/palette/10a19d540375ff7000ffbf00
  ["#10A19D", "#540375", "#FF7000", "#FFBF00"],
];

export function getRandomColor(): string {
  return colorPalettes[~~(Math.random() * colorPalettes.length)][
    ~~(Math.random() * 4)
  ];
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
  zoom: number;

  /**
   * Value for the given zoom level
   */
  value: string;
}>;

/**
 *
 * Array of number values that depend on zoom level
 */
export type ZoomNumberValues = Array<{
  /**
   * Zoom level
   */
  zoom: number;

  /**
   * Value for the given zoom level
   */
  value: number;
}>;

/**
 * Linera interpolation to find a value at an arbitrary zoom level, given a list of tuple zoom-value
 * @param znv
 * @param z
 */
export function lerpZoomNumberValues(znv: ZoomNumberValues, z: number): number {
  // before the range
  if (z <= znv[0].zoom) {
    return znv[0].value;
  }

  // after the range
  if (z >= znv[znv.length - 1].zoom) {
    return znv[znv.length - 1].value;
  }

  // somewhere within the range
  for (let i = 0; i < znv.length - 1; i += 1) {
    if (z >= znv[i].zoom && z < znv[i + 1].zoom) {
      const zoomRange = znv[i + 1].zoom - znv[i].zoom;
      const normalizedDistanceFromLowerBound = (z - znv[i].zoom) / zoomRange;
      return (
        normalizedDistanceFromLowerBound * znv[i + 1].value +
        (1 - normalizedDistanceFromLowerBound) * znv[i].value
      );
    }
  }

  return 0;
}

export type PolylineLayerOptions = {
  /**
   * ID to give to the layer.
   * If not provided, an auto-generated ID of the for "maptiler-layer-xxxxxx" will be auto-generated,
   * with "xxxxxx" being a random string.
   */
  layerId?: string;

  /**
   * ID to give to the geojson source.
   * If not provided, an auto-generated ID of the for "maptiler-source-xxxxxx" will be auto-generated,
   * with "xxxxxx" being a random string.
   */
  sourceId?: string;

  /**
   * A geojson Feature collection or a URL to a geojson or the UUID of a MapTiler Cloud dataset.
   */
  data: FeatureCollection | string;

  /**
   * The ID of an existing layer to insert the new layer before, resulting in the new layer appearing
   * visually beneath the existing layer. If this argument is not specified, the layer will be appended
   * to the end of the layers array and appear visually above all other layers.
   */
  beforeId?: string;

  /**
   * Zoom level at which it starts to show. Default: `0`
   */
  minzoom?: number;

  /**
   * Zoom level after which it no longer show. Default: `22`
   */
  maxzoom?: number;

  /**
   * Color of the line (or polyline). This is can be a constant color string or a definition based on zoom levels
   */
  lineColor?: string | ZoomStringValues;

  /**
   * Width of the line (relative to screen-space). This is can be a constant width or a definition based on zoom levels
   */
  lineWidth?: number | ZoomNumberValues;

  /**
   * Opacity of the line. This is can be a constant opacity in [0, 1] or a definition based on zoom levels
   */
  lineOpacity?: number | ZoomNumberValues;

  /**
   * Whether or not to add an outline (default: false)
   */
  outline?: boolean;

  /**
   * Color of the outline. This is can be a constant color string or a definition based on zoom levels
   */
  outlineColor?: string | ZoomStringValues;

  /**
   * Width of the outline (relative to screen-space). This is can be a constant width or a definition based on zoom levels
   */
  outlineWidth?: number | ZoomNumberValues;

  /**
   * Opacity of the outline. This is can be a constant opacity in [0, 1] or a definition based on zoom levels
   */
  outlineOpacity?: number | ZoomNumberValues;
};

export function lineColorOptionsToLineLayerPaintSpec(
  color: ZoomStringValues,
): DataDrivenPropertyValueSpecification<string> {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    ...color.map((el) => [el.zoom, el.value]).flat(),
  ];
}

export function lineWidthOptionsToLineLayerPaintSpec(
  width: ZoomNumberValues,
): DataDrivenPropertyValueSpecification<number> {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    ...width.map((el) => [el.zoom, el.value]).flat(),
  ];
}

export function lineOpacityOptionsToLineLayerPaintSpec(
  opacity: ZoomNumberValues,
): DataDrivenPropertyValueSpecification<number> {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    ...opacity.map((el) => [el.zoom, el.value]).flat(),
  ];
}

export function computeRampedOutlineWidth(
  lineWidth: number | ZoomNumberValues,
  outlineWidth: number | ZoomNumberValues,
): number | DataDrivenPropertyValueSpecification<number> {
  // case 1: the line is fixed-width and the outline is fixed-width
  if (typeof outlineWidth === "number" && typeof lineWidth === "number") {
    return 2 * outlineWidth + lineWidth;
  }

  // case 2: the line is ramped-width, the outline is fixed-width
  else if (typeof outlineWidth === "number" && Array.isArray(lineWidth)) {
    return [
      "interpolate",
      ["linear"],
      ["zoom"],
      ...lineWidth.map((el) => [el.zoom, 2 * outlineWidth + el.value]).flat(),
    ];
  }

  // case 3: the line is fixed-width, the outline is ramped-width
  else if (typeof lineWidth === "number" && Array.isArray(outlineWidth)) {
    return [
      "interpolate",
      ["linear"],
      ["zoom"],
      ...outlineWidth.map((el) => [el.zoom, 2 * el.value + lineWidth]).flat(),
    ];
  }

  // case 4: the line is ramped-width, the outline is ramped-width
  if (Array.isArray(lineWidth) && Array.isArray(outlineWidth)) {
    // We must create an artificial set of zoom stops that includes all the zoom stops from both lists
    // const allStops = [...lineWidth.map(el => el.zoom), ...outlineWidth.map(el => el.zoom)].sort((a: number, b: number) => a < b ? -1 : 1);
    const allStops = Array.from(
      new Set([
        ...lineWidth.map((el) => el.zoom),
        ...outlineWidth.map((el) => el.zoom),
      ]),
    ).sort((a: number, b: number) => (a < b ? -1 : 1));

    return [
      "interpolate",
      ["linear"],
      ["zoom"],
      ...allStops
        .map((z) => [
          z,
          2 * lerpZoomNumberValues(outlineWidth, z) +
            lerpZoomNumberValues(lineWidth, z),
        ])
        .flat(),
    ];
  }

  return 0;
}
