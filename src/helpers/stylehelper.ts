import {
  DataDrivenPropertyValueSpecification,
  ExpressionSpecification,
} from "maplibre-gl";
import { generateRandomString } from "../tools";
import { ColorRamp, RgbaColor } from "../colorramp";
import {
  DataDrivenStyle,
  PropertyValues,
  ZoomNumberValues,
  ZoomStringValues,
} from "./vectorlayerhelpers";

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

export function rampedPropertyValueWeight(
  ramp: PropertyValues,
  property: string,
): DataDrivenPropertyValueSpecification<number> {
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

export function colorDrivenByProperty(
  style: DataDrivenStyle,
  property: string,
): DataDrivenPropertyValueSpecification<string> {
  return [
    "interpolate",
    ["linear"],
    ["get", property],
    ...style.map((el) => [el.value, el.color]).flat(),
  ];
}

export function radiusDrivenByProperty(
  style: DataDrivenStyle,
  property: string,
  zoomCompensation = true,
): DataDrivenPropertyValueSpecification<number> {
  if (!zoomCompensation) {
    return [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.value, el.pointRadius]).flat(),
    ];
  }

  return [
    "interpolate",
    ["linear"],
    ["zoom"],

    0,
    [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.value, el.pointRadius * 0.025]).flat(),
    ],

    2,
    [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.value, el.pointRadius * 0.05]).flat(),
    ],

    4,
    [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.value, el.pointRadius * 0.1]).flat(),
    ],

    8,
    [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.value, el.pointRadius * 0.25]).flat(),
    ],

    16,
    [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.value, el.pointRadius]).flat(),
    ],
  ];
}

export function radiusDrivenByPropertyHeatmap(
  style: PropertyValues,
  property: string,
  zoomCompensation = true,
): DataDrivenPropertyValueSpecification<number> {
  if (!zoomCompensation) {
    return [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.propertyValue, el.value]).flat(),
    ];
  }

  return [
    "interpolate",
    ["linear"],
    ["zoom"],

    0,
    [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.propertyValue, el.value * 0.025]).flat(),
    ],

    2,
    [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.propertyValue, el.value * 0.05]).flat(),
    ],

    4,
    [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.propertyValue, el.value * 0.1]).flat(),
    ],

    8,
    [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.propertyValue, el.value * 0.25]).flat(),
    ],

    16,
    [
      "interpolate",
      ["linear"],
      ["get", property],
      ...style.map((el) => [el.propertyValue, el.value]).flat(),
    ],
  ];
}

/**
 * Turns a ColorRamp instance into a MapLibre style for ramping the opacity, driven by a property
 */
export function opacityDrivenByProperty(
  colorramp: ColorRamp,
  property: string,
): DataDrivenPropertyValueSpecification<number> {
  // If all opacities are the same, just return the number without any ramping logic
  if (colorramp.every((el) => el.color[3] === colorramp[0].color[3])) {
    return colorramp[0].color[3] ? colorramp[0].color[3] / 255 : 1;
  }

  return [
    "interpolate",
    ["linear"],
    ["get", property],
    ...colorramp
      .getRawColorStops()
      .map((el) => {
        const value = el.value;
        const color: RgbaColor = el.color;
        return [value, color.length === 4 ? color[3] / 255 : 1];
      })
      .flat(),
  ];
}

export function heatmapIntensityFromColorRamp(
  colorRamp: ColorRamp,
  steps = 10,
): ExpressionSpecification {
  return [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    ...Array.from({ length: steps + 1 }, (_, i) => {
      const unitStep = i / steps;
      return [unitStep, colorRamp.getColorHex(unitStep)];
    }).flat(),
  ];
}
