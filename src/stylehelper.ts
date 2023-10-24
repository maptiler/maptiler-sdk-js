import { FeatureCollection } from "geojson";
import { DataDrivenPropertyValueSpecification, ExpressionSpecification, Properties } from "maplibre-gl";
import { generateRandomString } from "./tools";
import { ColorRamp, RgbaColor } from "./colorramp";

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


export type PropertyValues = Array<{
  /**
   * Value of the property (input)
   */
  propertyValue: number,

  /**
   * Value to associate it with (output)
   */
  value: number,
}>;


/**
 * Describes how to render a cluster of points
 */
export type DataDrivenStyle = Array<{
  /**
   * Numerical value to observe and apply the style upon.
   * In case of clusters, the value to observe is automatically the number of elements in a cluster.
   * In other cases, it can be a provided value.
   */
  value: number,

  /**
   * Radius of the cluster circle
   */
  pointRadius: number,

  /**
   * Color of the cluster
   */
  color: string,
}>


/**
 * Linera interpolation to find a value at an arbitrary zoom level, given a list of tuple zoom-value
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

export type CommonShapeLayerOptions = {
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
   * Zoom level at which it starts to show.
   * Default: `0`
   */
  minzoom?: number;

  /**
   * Zoom level after which it no longer show.
   * Default: `22`
   */
  maxzoom?: number;

  /**
   * Whether or not to add an outline.
   * Default: `false`
   */
  outline?: boolean;

  /**
   * Color of the outline. This is can be a constant color string or a definition based on zoom levels.
   * Applies only if `.outline` is `true`.
   * Default: `white`
   */
  outlineColor?: string | ZoomStringValues;

  /**
   * Width of the outline (relative to screen-space). This is can be a constant width or a definition based on zoom levels.
   * Applies only if `.outline` is `true`.
   * Default: `1`
   */
  outlineWidth?: number | ZoomNumberValues;

  /**
   * Opacity of the outline. This is can be a constant opacity in [0, 1] or a definition based on zoom levels
   * Applies only if `.outline` is `true`.
   * Default: `1`
   */
  outlineOpacity?: number | ZoomNumberValues;
};

export type PolylineLayerOptions = CommonShapeLayerOptions & {
  /**
   * Color of the line (or polyline). This is can be a constant color string or a definition based on zoom levels.
   * Default: a color randomly pick from a list
   */
  lineColor?: string | ZoomStringValues;

  /**
   * Width of the line (relative to screen-space). This is can be a constant width or a definition based on zoom levels
   * Default: `3`
   */
  lineWidth?: number | ZoomNumberValues;

  /**
   * Opacity of the line. This is can be a constant opacity in [0, 1] or a definition based on zoom levels.
   * Default: `1`
   */
  lineOpacity?: number | ZoomNumberValues;

  /**
   * How blury the line is, with `0` being no blur and `10` and beyond being quite blurry.
   * Default: `0`
   */
  lineBlur?: number | ZoomNumberValues;

  /**
   * Draws a line casing outside of a line's actual path. Value indicates the width of the inner gap.
   * Default: `0`
   */
  lineGapWidth?: number | ZoomNumberValues;

  /**
   * Sequence of line and void to create a dash pattern. The unit is the line width so that
   * a dash array value of `[3, 1]` will create a segment worth 3 times the width of the line,
   * followed by a spacing worth 1 time the line width, and then repeat.
   *
   * Alternatively, this property can be a string made of underscore and whitespace characters
   * such as `"___ _ "` and internaly this will be translated into [3, 1, 1, 1]. Note that
   * this way of describing dash arrays with a string only works for integer values.
   *
   * Dash arrays can contain more than 2 element to create more complex patters. For instance
   * a dash array value of [3, 2, 1, 2] will create the following sequence:
   * - a segment worth 3 times the width
   * - a spacing worth 2 times the width
   * - a segment worth 1 times the width
   * - a spacing worth 2 times the width
   * - repeat
   *
   * Default: no dash pattern
   */
  lineDashArray?: Array<number> | string;

  /**
   * The display of line endings for both the line and the outline (if `.outline` is `true`)
   * - "butt": A cap with a squared-off end which is drawn to the exact endpoint of the line.
   * - "round": A cap with a rounded end which is drawn beyond the endpoint of the line at a radius of one-half of the line's width and centered on the endpoint of the line.
   * - "square": A cap with a squared-off end which is drawn beyond the endpoint of the line at a distance of one-half of the line's width.
   * Default: "round"
   */
  lineCap?: "butt" | "round" | "square";

  /**
   * The display of lines when joining for both the line and the outline (if `.outline` is `true`)
   * - "bevel": A join with a squared-off end which is drawn beyond the endpoint of the line at a distance of one-half of the line's width.
   * - "round": A join with a rounded end which is drawn beyond the endpoint of the line at a radius of one-half of the line's width and centered on the endpoint of the line.
   * - "miter": A join with a sharp, angled corner which is drawn with the outer sides beyond the endpoint of the path until they meet.
   * Default: "round"
   */
  lineJoin?: "bevel" | "round" | "miter";

  /**
   * How blury the outline is, with `0` being no blur and `10` and beyond being quite blurry.
   * Applies only if `.outline` is `true`.
   * Default: `0`
   */
  outlineBlur?: number | ZoomNumberValues;
};

export type PolylgonLayerOptions = CommonShapeLayerOptions & {
  /**
   * Color of the polygon. This is can be a constant color string or a definition based on zoom levels.
   * Default: a color randomly pick from a list
   */
  fillColor?: string | ZoomStringValues;

  /**
   * Opacity of the polygon. This is can be a constant opacity in [0, 1] or a definition based on zoom levels
   * Default: `1`
   */
  fillOpacity?: ZoomNumberValues;

  /**
   * Position of the outline with regard to the polygon edge (when `.outline` is `true`)
   * Default: `"center"`
   */
  outlinePosition: "center" | "inside" | "outside";

  /**
   * Sequence of line and void to create a dash pattern. The unit is the line width so that
   * a dash array value of `[3, 1]` will create a segment worth 3 times the width of the line,
   * followed by a spacing worth 1 time the line width, and then repeat.
   *
   * Alternatively, this property can be a string made of underscore and whitespace characters
   * such as `"___ _ "` and internaly this will be translated into [3, 1, 1, 1]. Note that
   * this way of describing dash arrays with a string only works for integer values.
   *
   * Dash arrays can contain more than 2 element to create more complex patters. For instance
   * a dash array value of [3, 2, 1, 2] will create the following sequence:
   * - a segment worth 3 times the width
   * - a spacing worth 2 times the width
   * - a segment worth 1 times the width
   * - a spacing worth 2 times the width
   * - repeat
   *
   * Default: no dash pattern
   */
  outlineDashArray?: Array<number> | string;

  /**
   * The display of line endings for both the line and the outline (if `.outline` is `true`)
   * - "butt": A cap with a squared-off end which is drawn to the exact endpoint of the line.
   * - "round": A cap with a rounded end which is drawn beyond the endpoint of the line at a radius of one-half of the line's width and centered on the endpoint of the line.
   * - "square": A cap with a squared-off end which is drawn beyond the endpoint of the line at a distance of one-half of the line's width.
   * Default: "round"
   */
  outlineCap?: "butt" | "round" | "square";

  /**
   * The display of lines when joining for both the line and the outline (if `.outline` is `true`)
   * - "bevel": A join with a squared-off end which is drawn beyond the endpoint of the line at a distance of one-half of the line's width.
   * - "round": A join with a rounded end which is drawn beyond the endpoint of the line at a radius of one-half of the line's width and centered on the endpoint of the line.
   * - "miter": A join with a sharp, angled corner which is drawn with the outer sides beyond the endpoint of the path until they meet.
   * Default: "round"
   */
  outlineJoin?: "bevel" | "round" | "miter";

  /**
   * The pattern is an image URL to be put as a repeated background pattern of the polygon.
   * Default: `null` (no pattern, `fillColor` will be used)
   */
  pattern?: string | null;

  /**
   * How blury the outline is, with `0` being no blur and `10` and beyond being quite blurry.
   * Applies only if `.outline` is `true`.
   * Default: `0`
   */
  outlineBlur?: number | ZoomNumberValues;
};




export type PointLayerOptions = CommonShapeLayerOptions & {
  /**
   * Can be a unique point color as a string (CSS color such as "#FF0000" or "red").
   * Alternatively, the color can be a ColorRamp with a range.
   * In case of `.cluster` being `true`, the range of the ColorRamp will be addressed with the number of elements in
   * the cluster. If `.cluster` is `false`, the color will be addressed using the value of the `.property`.
   * If no `.property` is given but `.pointColor` is a ColorRamp, the chosen color is the one at the lower bound of the ColorRamp.
   * Default: a color randomly pick from a list
   */
  pointColor?: string | ColorRamp;

  /**
   * Radius of the points. Can be a fixed size or a value dependant on the zoom.
   * If `.pointRadius` is not provided, the radius will depend on the size of each cluster (if `.cluster` is `true`)
   * or on the value of each point (if `.property` is provided and `.pointColor` is a ColorRamp).
   * The radius will be between `.minPointRadius` and `.maxPointRadius`
   */
  pointRadius?: number | ZoomNumberValues;

  /**
   * The minimum point radius posible.
   * Default: `10`
   */
  minPointRadius?: number;

  /**
   * The maximum point radius posible.
   * Default: `40`
   */
  maxPointRadius?: number;

  /**
   * The point property to observe and apply the radius and color upon.
   * This is ignored if `.cluster` is `true` as the observed value will be fiorced to being the number
   * of elements in each cluster.
   * 
   * Default: none
   */
  property?: string;
  

  /**
   * Opacity of the point or icon. This is can be a constant opacity in [0, 1] or a definition based on zoom levels.
   * Alternatively, if not provided but the `.pointColor` is a ColorRamp, the opacity will be extracted from tha alpha
   * component if present.
   * Default: `1`
   */
  pointOpacity?: number | ZoomNumberValues;

  /**
   * If `true`, the points will keep their circular shape align with the wiewport.
   * If `false`, the points will be like flatten on the map. This difference shows
   * when the map is tilted.
   * Default: `true`
   */
  alignOnViewport?: boolean;

  /**
   * Whether the points should cluster
   */
  cluster?: boolean;

  /**
   * Shows a label with the numerical value id `true`.
   * If `.cluster` is `true`, the value will be the numebr of elements in the cluster.
   * 
   * 
   * Default: `true` if `cluster` or `dataDrivenStyleProperty` are used, `false` otherwise.
   */
  showLabel?: boolean;

  /**
   * text color used for the number elements in each cluster.
   * Applicable only when `cluster` is `true`.
   * Default: `#000000` (black)
   */
  labelColor?: string;

  /**
   * text size used for the number elements in each cluster.
   * Applicable only when `cluster` is `true`.
   * Default: `12`
   */
  labelSize?: number;

  /**
   * Only if `.cluster` is `false`.
   * If the radius is driven by a property, then it will also scale by zoomming if `.zoomCompensation` is `true`.
   * If `false`, the radius will not adapt according to the zoom level.
   * Default: `true`
   */
  zoomCompensation?: boolean,
};


export type HeatmapLayerOptions = {
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
   * Zoom level at which it starts to show.
   * Default: `0`
   */
  minzoom?: number;

  /**
   * Zoom level after which it no longer show.
   * Default: `22`
   */
  maxzoom?: number;

  /**
   * The ColorRamp instance to use for visualization. The color ramp is expected to be defined in the 
   * range `[0, 1]` or else will be forced to this range.
   * Default: `ColorRampCollection.TURBO`
   */
  colorRamp?: ColorRamp,

  /**
   * Use a property to apply a weight to each data point. Using a property requires also using
   * the options `.propertyValueWeight` or otherwise will be ignored.
   * Default: none, the points will all have a weight of `1`.
   */
  property?: string,

  /**
   * The weight to give to each data point. If of type `PropertyValueWeights`, then the options `.property` 
   * must also be provided. If used a number, all data points will be weighted by the same number (which is of little interest)
   */
  weight?: PropertyValues | number,

  /**
   * The radius (in screenspace) can be:
   * - a fixed number that will be constant across zoom level
   * - of type `ZoomNumberValues` to be ramped accoding to zoom level (`.zoomCompensation` will then be ignored)
   * - of type `PropertyValues` to be driven by the value of a property. 
   *   If so, the option `.property` must be provided and will still be resized according to zoom level,
   *   unless the option `.zoomCompensation` is set to `false`.
   * 
   * Default: 
   */
  radius?: number | ZoomNumberValues | PropertyValues,

  /**
   * The opacity can be a fixed value or zoom-driven.
   * Default: fades-in 0.25z after minzoom and fade-out 0.25z before maxzoom
   */
  opacity?: number | ZoomNumberValues,

  /**
   * The intensity is zoom-dependent. By default, the intensity is going to be scaled by zoom to preserve
   * a natural aspect or the data distribution.
   */
  intensity?: number | ZoomNumberValues,

  /**
   * If the radius is driven by a property, then it will also scale by zoomming if `.zoomCompensation` is `true`.
   * If `false`, the radius will not adapt according to the zoom level.
   * Default: `true`
   */
  zoomCompensation?: boolean,
}


export function paintColorOptionsToPaintSpec(
  color: ZoomStringValues,
): DataDrivenPropertyValueSpecification<string> {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    ...color.map((el) => [el.zoom, el.value]).flat(),
  ];
}


export function rampedOptionsToLayerPaintSpec(
  ramp: ZoomNumberValues,
): DataDrivenPropertyValueSpecification<number> {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    ...ramp.map((el) => [el.zoom, el.value]).flat(),
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


export function rampedPropertyValueWeight(ramp: PropertyValues, property: string): DataDrivenPropertyValueSpecification<number> {
  return [
    "interpolate",
    ["linear"],
    ["get", property],
    ...ramp.map((el) => [el.propertyValue, el.value]).flat(),
  ];
}


/**
 * Create a dash array from a string pattern that uses underscore and whitespace characters
 */
export function dashArrayMaker(pattern: string): Array<number> {
  // if the pattern starts with whitespaces, then move them towards the end
  const startTrimmedPattern = pattern.trimStart();
  const fixedPattern = `${startTrimmedPattern}${" ".repeat(
    pattern.length - startTrimmedPattern.length,
  )}`;
  const patternArr = Array.from(fixedPattern);

  const isOnlyDashesAndSpaces = patternArr.every((c) => c === " " || c === "_");
  if (!isOnlyDashesAndSpaces) {
    throw new Error(
      "A dash pattern must be composed only of whitespace and underscore characters.",
    );
  }

  const hasBothDashesAndWhitespaces =
    patternArr.some((c) => c === "_") && patternArr.some((c) => c === " ");
  if (!hasBothDashesAndWhitespaces) {
    throw new Error(
      "A dash pattern must contain at least one underscore and one whitespace character",
    );
  }

  const dashArray = [1];

  for (let i = 1; i < patternArr.length; i += 1) {
    const previous = patternArr[i - 1];
    const current = patternArr[i];

    if (previous === current) {
      dashArray[dashArray.length - 1] += 1;
    } else {
      dashArray.push(1);
    }
  }

  return dashArray;
}



export function colorDrivenByProperty(style: DataDrivenStyle, property: string): DataDrivenPropertyValueSpecification<string> {
  return [
    "interpolate",
    ["linear"],
    ["get", property],
    ... style.map(el => [el.value, el.color]).flat(),
  ];
}


export function radiusDrivenByProperty(style: DataDrivenStyle, property: string, zoomCompensation:boolean = true): DataDrivenPropertyValueSpecification<number> {

  if (!zoomCompensation) {
    return [
      "interpolate",
      ["linear"],
      ["get", property],
      ... style.map(el => [el.value, el.pointRadius]).flat(),
    ];
  }

  return [
    'interpolate',
    ['linear'],
    ['zoom'],
    
    0, [
      'interpolate',['linear'], ['get', property], 
      ... style.map(el => [el.value, el.pointRadius * 0.025]).flat(),
    ],

    2, [
      'interpolate',['linear'], ['get', property], 
      ... style.map(el => [el.value, el.pointRadius * 0.05]).flat(),
    ],

    4, [
      'interpolate',['linear'], ['get', property], 
      ... style.map(el => [el.value, el.pointRadius * 0.1]).flat(),
    ],

    8, [
      'interpolate',['linear'], ['get', property], 
      ... style.map(el => [el.value, el.pointRadius * 0.25]).flat(),
    ],

    16, [
      'interpolate', ['linear'], ['get', property],
      ... style.map(el => [el.value, el.pointRadius]).flat(),
    ]
  ]
}


export function radiusDrivenByPropertyHeatmap(style: PropertyValues, property: string, zoomCompensation:boolean = true): DataDrivenPropertyValueSpecification<number> {

  if (!zoomCompensation) {
    return [
      "interpolate",
      ["linear"],
      ["get", property],
      ... style.map(el => [el.propertyValue, el.value]).flat(),
    ];
  }

  return [
    'interpolate',
    ['linear'],
    ['zoom'],
    
    0, [
      'interpolate',['linear'], ['get', property], 
      ... style.map(el => [el.propertyValue, el.value * 0.025]).flat(),
    ],

    2, [
      'interpolate',['linear'], ['get', property], 
      ... style.map(el => [el.propertyValue, el.value * 0.05]).flat(),
    ],

    4, [
      'interpolate',['linear'], ['get', property], 
      ... style.map(el => [el.propertyValue, el.value * 0.1]).flat(),
    ],

    8, [
      'interpolate',['linear'], ['get', property], 
      ... style.map(el => [el.propertyValue, el.value * 0.25]).flat(),
    ],

    16, [
      'interpolate', ['linear'], ['get', property],
      ... style.map(el => [el.propertyValue, el.value]).flat(),
    ]
  ]
}


/**
 * Turns a ColorRamp instance into a MapLibre style for ramping the opacity, driven by a property
 */
export function opacityDrivenByProperty(colorramp: ColorRamp, property: string): DataDrivenPropertyValueSpecification<number> {

  // If all opacities are the same, just return the number without any ramping logic
  if (colorramp.every(el => el.color[3] === colorramp[0].color[3])) {
    return colorramp[0].color[3] ? colorramp[0].color[3] / 255 : 1;
  }

  return [
    "interpolate",
    ["linear"],
    ["get", property],
    ... colorramp.getRawColorStops().map(el => {
      const value = el.value;
      const color: RgbaColor = el.color;
      return [value, color.length === 4 ? color[3] / 255 : 1];
    }).flat(),
  ];
}

export function heatmapIntensityFromColorRamp(colorRamp: ColorRamp, steps: number = 10): ExpressionSpecification {
  return [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    ... Array.from({length: steps + 1}, (_, i) => {
      const unitStep = i / steps
      return [
        unitStep,
        colorRamp.getColorHex(unitStep),
      ]
    }).flat()
  ];
}