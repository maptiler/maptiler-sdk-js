import type { DataDrivenPropertyValueSpecification, ExpressionSpecification, PropertyValueSpecification } from "maplibre-gl";
import type { ColorRamp } from "../../ColorRamp";
import type { PropertyValues, ZoomNumberValues } from "../../helpers/vectorlayerhelpers";
import { heatmapIntensityFromColorRamp, radiusDrivenByPropertyHeatmap, rampedOptionsToLayerPaintSpec, rampedPropertyValueWeight } from "../../helpers/stylehelper";
import type { SublayerSpecification } from "../DataLayer";
import { isExpression } from "../style";
import type { HeatmapLayerStyle } from "./types";

// Layer spec for the heatmap. Ported from the `addHeatmap` helper's spec
// logic — kept as a copy rather than shared, so `addHeatmap` stays frozen. The
// resulting layer should match `addHeatmap`'s for the same options, except
// that `property` alone weights the points by its value.

//#region Types

/** Everything besides style that the heatmap layer depends on. */
export type HeatmapRenderContext = {
  layerId: string;
  sourceId: string;
  /** Adds the layer's fade at the edges of its zoom range — see `DataLayer.fadeOpacity`. */
  fadeOpacity: (opacity: number | ExpressionSpecification) => number | ExpressionSpecification;
};

//#endregion

//#region Constants

const DEFAULT_INTENSITY: ZoomNumberValues = [
  { zoom: 0, value: 0.01 },
  { zoom: 4, value: 0.2 },
  { zoom: 16, value: 1 },
];

const DEFAULT_RADIUS: ZoomNumberValues = [
  { zoom: 0, value: 50 * 0.025 },
  { zoom: 2, value: 50 * 0.05 },
  { zoom: 4, value: 50 * 0.1 },
  { zoom: 8, value: 50 * 0.25 },
  { zoom: 16, value: 50 },
];

/** Radius without `zoomCompensation`. */
const DEFAULT_FIXED_RADIUS = 10;

//#endregion

//#region Style

/**
 * Fills in `addHeatmap`'s defaults — all but the colour, which is required.
 * @param style - Style as set by the user.
 */
export function resolveHeatmapStyle(style: HeatmapLayerStyle): HeatmapLayerStyle {
  const zoomCompensation = style.zoomCompensation ?? true;
  return {
    ...style,
    radius: style.radius ?? (zoomCompensation ? DEFAULT_RADIUS : DEFAULT_FIXED_RADIUS),
    intensity: style.intensity ?? DEFAULT_INTENSITY,
    zoomCompensation,
  };
}

/** `color` scaled to `[0, 1]` with a transparent start, as `heatmap-color` reads it along the density. */
export function normalizeHeatmapRamp(color: ColorRamp): ColorRamp {
  // always scaled, as that copies the colours too: transparentStart() adds alpha to the colours it's given, which would change the user's ramp
  const scaled = color.scale(0, 1);
  return scaled.hasTransparentStart() ? scaled : scaled.transparentStart();
}

//#endregion

//#region Layers

/** Id of the heatmap sublayer. */
export function getHeatmapLayerId(layerId: string): string {
  return `${layerId}-heatmap`;
}

/**
 * Builds the heatmap sublayer.
 * @param style - Resolved style (see {@link resolveHeatmapStyle}).
 * @param context - Ids and the zoom range fade.
 */
export function buildHeatmapLayers(style: HeatmapLayerStyle, context: HeatmapRenderContext): SublayerSpecification[] {
  return [
    {
      id: getHeatmapLayerId(context.layerId),
      type: "heatmap",
      source: context.sourceId,
      paint: {
        "heatmap-weight": resolveWeight(style),
        "heatmap-intensity": resolveIntensity(style),
        "heatmap-color": heatmapIntensityFromColorRamp(normalizeHeatmapRamp(style.color)),
        "heatmap-radius": resolveRadius(style),
        "heatmap-opacity": resolveOpacity(style, context),
      },
    },
  ];
}

/** `weight` as set, else `property`'s value, else `1`. */
function resolveWeight(style: HeatmapLayerStyle): DataDrivenPropertyValueSpecification<number> {
  const { weight, property } = style;

  if (typeof weight === "number" || isExpression(weight)) return weight;
  if (weight !== undefined) {
    if (property) return rampedPropertyValueWeight(weight, property);
    console.warn("HeatmapLayer: a `PropertyValues` `weight` needs `property`, so every point weighs 1.");
    return 1;
  }
  // a missing or negative value would subtract from the density
  return property ? ["max", 0, ["to-number", ["get", property], 0]] : 1;
}

/** `radius` as set — `PropertyValues` read at `property` — else the zoom-driven default. */
function resolveRadius(style: HeatmapLayerStyle): DataDrivenPropertyValueSpecification<number> {
  const { radius, property } = style;
  const zoomCompensation = style.zoomCompensation ?? true;

  if (radius === undefined) return zoomCompensation ? rampedOptionsToLayerPaintSpec(DEFAULT_RADIUS) : DEFAULT_FIXED_RADIUS;
  if (typeof radius === "number" || isExpression(radius)) return radius;
  if (!isPropertyValues(radius)) return rampedOptionsToLayerPaintSpec(radius);
  if (property) return radiusDrivenByPropertyHeatmap(radius, property, zoomCompensation);

  console.warn("HeatmapLayer: a `PropertyValues` `radius` needs `property`, so the default radius is used.");
  return rampedOptionsToLayerPaintSpec(DEFAULT_RADIUS);
}

function resolveIntensity(style: HeatmapLayerStyle): PropertyValueSpecification<number> {
  const intensity = style.intensity ?? DEFAULT_INTENSITY;
  if (typeof intensity === "number" || isExpression(intensity)) return intensity;
  return rampedOptionsToLayerPaintSpec(intensity) as PropertyValueSpecification<number>;
}

/** `opacity`, else opaque — faded at the zoom range's edges unless it depends on the zoom itself. */
function resolveOpacity(style: HeatmapLayerStyle, context: HeatmapRenderContext): PropertyValueSpecification<number> {
  const { opacity = 1 } = style;
  if (typeof opacity === "number" || isExpression(opacity)) return context.fadeOpacity(opacity) as PropertyValueSpecification<number>;
  return context.fadeOpacity(rampedOptionsToLayerPaintSpec(opacity) as ExpressionSpecification) as PropertyValueSpecification<number>;
}

function isPropertyValues(values: ZoomNumberValues | PropertyValues): values is PropertyValues {
  return values.length > 0 && "propertyValue" in values[0];
}

//#endregion
