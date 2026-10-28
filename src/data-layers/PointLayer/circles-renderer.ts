import type { DataDrivenPropertyValueSpecification, ExpressionSpecification } from "maplibre-gl";
import { ColorRampCollection, type ColorRamp } from "../../ColorRamp";
import type { DataDrivenStyle } from "../../helpers/vectorlayerhelpers";
import { colorDrivenByProperty, opacityDrivenByProperty, paintColorOptionsToPaintSpec, radiusDrivenByProperty, rampedOptionsToLayerPaintSpec } from "../../helpers/stylehelper";
import type { SublayerSpecification } from "../DataLayer";
import { isExpression, usesZoom } from "../styling";
import type { PointLayerCirclesStyling } from "./types";

// Layer specs for `circles` mode. Ported from the `addPoint` helper's spec
// logic — kept as a copy rather than shared, so `addPoint` stays frozen. The
// resulting layers should match `addPoint`'s for the same options, except that
// labels too big for their circle are hidden rather than overflowing it.

//#region Types

/** Everything besides styling that the circle layers depend on. */
export type CirclesRenderContext = {
  layerId: string;
  sourceId: string;
  cluster: boolean;
  /** Adds the layer's fade at the edges of its zoom range — see `DataLayer.fadeOpacity`. */
  fadeOpacity: (opacity: number | ExpressionSpecification) => number | ExpressionSpecification;
};

//#endregion

//#region Constants

const DEFAULT_MIN_POINT_RADIUS = 10;
const DEFAULT_MAX_POINT_RADIUS = 50;
const DEFAULT_OUTLINE_COLOR = "#FFFFFF";
const DEFAULT_LABEL_COLOR = "#fff";
const DEFAULT_LABEL_SIZE = 12;
const LABEL_FONT = ["Noto Sans Regular"];

/** Steps in the generated cluster / data-driven style. */
const DATA_DRIVEN_STYLE_STEPS = 20;

/** Room kept between a label and the edge of its circle, in px. */
const LABEL_FIT_MARGIN_PX = 1;

//#endregion

//#region Styling

/**
 * Fills in `addPoint`'s defaults — all but the colour, which is required.
 * @param styling - Styling as set by the user.
 * @param cluster - Whether the layer clusters, which changes several defaults.
 */
export function resolveCirclesStyling(styling: PointLayerCirclesStyling, cluster: boolean): PointLayerCirclesStyling {
  return {
    ...styling,
    minRadius: styling.minRadius ?? DEFAULT_MIN_POINT_RADIUS,
    maxRadius: styling.maxRadius ?? DEFAULT_MAX_POINT_RADIUS,
    alignOnViewport: styling.alignOnViewport ?? true,
    showLabel: styling.showLabel ?? cluster,
    labelColor: styling.labelColor ?? DEFAULT_LABEL_COLOR,
    labelSize: styling.labelSize ?? DEFAULT_LABEL_SIZE,
    zoomCompensation: styling.zoomCompensation ?? true,
    outline: styling.outline ?? false,
    outlineColor: styling.outlineColor ?? DEFAULT_OUTLINE_COLOR,
    outlineWidth: styling.outlineWidth ?? 1,
    outlineOpacity: styling.outlineOpacity ?? 1,
  };
}

/** The ramp sizing clusters, and data-driven points, when `color` isn't a `ColorRamp` — `addPoint`'s default ramp. */
function defaultColorRamp(cluster: boolean): ColorRamp {
  return ColorRampCollection.TURBO.scale(10, cluster ? 10000 : 1000).resample("ease-out-square");
}

/** `color` when it's a `ColorRamp` — not a CSS colour or an expression. */
function colorRampOf(styling: PointLayerCirclesStyling): ColorRamp | undefined {
  return Array.isArray(styling.color) && !isExpression(styling.color) ? (styling.color as ColorRamp) : undefined;
}

/** `color` when it's used as is — a CSS colour or an expression. */
function fixedColorOf(styling: PointLayerCirclesStyling): string | ExpressionSpecification | undefined {
  return typeof styling.color === "string" || isExpression(styling.color) ? styling.color : undefined;
}

/** `radius` when it's set: a number as is, a zoom ramp as an interpolation, an expression as is. */
function setRadiusOf(styling: PointLayerCirclesStyling): DataDrivenPropertyValueSpecification<number> | undefined {
  const { radius } = styling;
  if (radius === undefined || typeof radius === "number" || isExpression(radius)) return radius;
  return rampedOptionsToLayerPaintSpec(radius);
}

//#endregion

//#region Layers

/** Ids of the circle sublayers, so a layer can tell which of them exist. */
export function getCircleLayerIds(layerId: string) {
  return {
    cluster: `${layerId}-cluster`,
    point: `${layerId}-point`,
    label: `${layerId}-label`,
  };
}

/**
 * Builds the circle sublayers, bottom first: clusters (when clustering),
 * points, then labels (when shown).
 * @param styling - Resolved styling (see {@link resolveCirclesStyling}).
 * @param context - Ids, clustering and the zoom range fade.
 */
export function buildCircleLayers(styling: PointLayerCirclesStyling, context: CirclesRenderContext): SublayerSpecification[] {
  const { sourceId, cluster } = context;
  const ids = getCircleLayerIds(context.layerId);

  const minRadius = styling.minRadius ?? DEFAULT_MIN_POINT_RADIUS;
  const maxRadius = styling.maxRadius ?? DEFAULT_MAX_POINT_RADIUS;
  const fixedColor = fixedColorOf(styling);
  const setRadius = setRadiusOf(styling);
  const colorRamp = colorRampOf(styling) ?? defaultColorRamp(cluster);
  const colorRampBounds = colorRamp.getBounds();
  const alignOnViewport = styling.alignOnViewport ?? true;
  const zoomCompensation = styling.zoomCompensation ?? true;
  const opacity = resolveOpacity(styling, colorRamp, context);
  const outlinePaint = buildOutlinePaint(styling, context.fadeOpacity);

  const layers: SublayerSpecification[] = [];
  /** Radius of the circles that carry labels — clusters when clustering, else the points. */
  let labelledRadius: DataDrivenPropertyValueSpecification<number>;

  if (cluster) {
    // clusters are sized and coloured by their point count, never by zoom or a property
    const clusterStyle: DataDrivenStyle = Array.from({ length: DATA_DRIVEN_STYLE_STEPS }, (_, i) => {
      const value = colorRampBounds.min + (i * (colorRampBounds.max - colorRampBounds.min)) / (DATA_DRIVEN_STYLE_STEPS - 1);
      return {
        value,
        pointRadius: minRadius + (maxRadius - minRadius) * (i / (DATA_DRIVEN_STYLE_STEPS - 1)) ** 0.5,
        color: colorRamp.getColorHex(value),
      };
    });

    labelledRadius = setRadius ?? radiusDrivenByProperty(clusterStyle, "point_count", false);

    layers.push({
      id: ids.cluster,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": fixedColor ?? colorDrivenByProperty(clusterStyle, "point_count"),
        "circle-radius": labelledRadius,
        "circle-pitch-alignment": alignOnViewport ? "viewport" : "map",
        "circle-pitch-scale": "map", // scale with camera distance regardless of viewport/map alignment
        "circle-opacity": opacity,
        ...outlinePaint,
      },
    });

    // unclustered points, visible only once ungrouped
    layers.push({
      id: ids.point,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-pitch-alignment": alignOnViewport ? "viewport" : "map",
        "circle-pitch-scale": "map",
        "circle-color": fixedColor ?? colorRamp.getColorHex(colorRampBounds.min),
        "circle-radius": setRadius ?? clusterStyle[0].pointRadius * 0.75,
        "circle-opacity": opacity,
        ...outlinePaint,
      },
    });
  } else {
    // a colour ramp without a property uses its first colour
    let pointColor: DataDrivenPropertyValueSpecification<string> = fixedColor ?? colorRamp.getColorHex(colorRampBounds.min);

    let pointRadius: DataDrivenPropertyValueSpecification<number> =
      typeof styling.radius === "number"
        ? zoomCompensation
          ? rampedOptionsToLayerPaintSpec([
              { zoom: 0, value: styling.radius * 0.025 },
              { zoom: 2, value: styling.radius * 0.05 },
              { zoom: 4, value: styling.radius * 0.1 },
              { zoom: 8, value: styling.radius * 0.25 },
              { zoom: 16, value: styling.radius * 1 },
            ])
          : styling.radius
        : (setRadius ??
          (zoomCompensation
            ? rampedOptionsToLayerPaintSpec([
                { zoom: 0, value: minRadius * 0.05 },
                { zoom: 2, value: minRadius * 0.1 },
                { zoom: 4, value: minRadius * 0.2 },
                { zoom: 8, value: minRadius * 0.5 },
                { zoom: 16, value: minRadius * 1 },
              ])
            : minRadius));

    // colour and radius driven by a property need a colour ramp to read from — a radius expression still wins
    if (styling.property && colorRampOf(styling)) {
      const dataDrivenStyle: DataDrivenStyle = Array.from({ length: DATA_DRIVEN_STYLE_STEPS }, (_, i) => {
        const value = colorRampBounds.min + (i * (colorRampBounds.max - colorRampBounds.min)) / (DATA_DRIVEN_STYLE_STEPS - 1);
        return {
          value,
          pointRadius: typeof styling.radius === "number" ? styling.radius : minRadius + (maxRadius - minRadius) * (i / (DATA_DRIVEN_STYLE_STEPS - 1)) ** 0.5,
          color: colorRamp.getColorHex(value),
        };
      });
      pointColor = colorDrivenByProperty(dataDrivenStyle, styling.property);
      if (!isExpression(styling.radius)) pointRadius = radiusDrivenByProperty(dataDrivenStyle, styling.property, zoomCompensation);
    }
    labelledRadius = pointRadius;

    layers.push({
      id: ids.point,
      type: "circle",
      source: sourceId,
      layout: {
        // unlike labels, small circles should sit in front — circle-sort-key runs the opposite way to symbol-sort-key
        "circle-sort-key": styling.property ? ["/", 1, ["get", styling.property]] : 0,
      },
      paint: {
        "circle-pitch-alignment": alignOnViewport ? "viewport" : "map",
        "circle-pitch-scale": "map",
        "circle-color": pointColor,
        "circle-opacity": opacity,
        "circle-radius": pointRadius,
        ...outlinePaint,
      },
    });
  }

  // labels show the cluster count, or the `property` value — only when `showLabel` (defaulting to `cluster`) is on
  const labelProperty = cluster ? "point_count" : styling.property;
  const showLabel = styling.showLabel ?? cluster;
  if (showLabel && labelProperty) {
    const labelSize = styling.labelSize ?? DEFAULT_LABEL_SIZE;

    layers.push({
      id: ids.label,
      type: "symbol",
      source: sourceId,
      filter: ["has", labelProperty],
      layout: {
        "text-field": cluster ? "{point_count_abbreviated}" : `{${labelProperty}}`,
        "text-font": LABEL_FONT,
        "text-size": labelSize,
        "text-pitch-alignment": alignOnViewport ? "viewport" : "map",
        "symbol-sort-key": ["/", 1, ["get", labelProperty]], // so that the largest value goes on top
      },
      paint: {
        // hidden where it wouldn't fit its circle — in the colour, as the opacity already carries the point opacity
        "text-color": hideUnfittingLabels(styling.labelColor ?? DEFAULT_LABEL_COLOR, labelSize, labelledRadius),
        "text-opacity": opacity,
      },
    });
  }

  return layers;
}

/** `opacity`, else ramp-driven opacity, else opaque — faded at the zoom range's edges unless it depends on the zoom itself. */
function resolveOpacity(styling: PointLayerCirclesStyling, colorRamp: ColorRamp, context: CirclesRenderContext): DataDrivenPropertyValueSpecification<number> {
  const { cluster, fadeOpacity } = context;

  if (typeof styling.opacity === "number" || isExpression(styling.opacity)) return fadeOpacity(styling.opacity);
  if (Array.isArray(styling.opacity)) return fadeOpacity(rampedOptionsToLayerPaintSpec(styling.opacity) as ExpressionSpecification);
  if (cluster) return fadeOpacity(opacityDrivenByProperty(colorRamp, "point_count") as number | ExpressionSpecification);
  if (styling.property) return fadeOpacity(opacityDrivenByProperty(colorRamp, styling.property) as number | ExpressionSpecification);

  return fadeOpacity(1);
}

/** The outline, its opacity faded with the circles' at the zoom range's edges. */
function buildOutlinePaint(styling: PointLayerCirclesStyling, fadeOpacity: CirclesRenderContext["fadeOpacity"]) {
  if (!styling.outline) return {};

  const outlineOpacity = styling.outlineOpacity ?? 1;
  const outlineWidth = styling.outlineWidth ?? 1;
  const outlineColor = styling.outlineColor ?? DEFAULT_OUTLINE_COLOR;

  return {
    "circle-stroke-opacity": fadeOpacity(typeof outlineOpacity === "number" ? outlineOpacity : (rampedOptionsToLayerPaintSpec(outlineOpacity) as ExpressionSpecification)),
    "circle-stroke-width": typeof outlineWidth === "number" ? outlineWidth : rampedOptionsToLayerPaintSpec(outlineWidth),
    "circle-stroke-color": typeof outlineColor === "string" ? outlineColor : paintColorOptionsToPaintSpec(outlineColor),
  };
}

//#endregion

//#region Label Fitting

/**
 * Label colour that turns transparent where the circle is narrower than the
 * label is tall — a naive check that ignores the label's length.
 *
 * `["zoom"]` may only be the input of a top-level step / interpolate, so a
 * zoom-dependent radius is checked at its ramp's own stops, as a zoom `step`.
 * The radius grows between stops while the step holds the lower stop's
 * result, so a label may show up late, but never overflows.
 * @param color - Colour of a label that fits.
 * @param size - Label font size, in px.
 * @param radius - Radius of the circle the label sits on, as given to `circle-radius`.
 */
function hideUnfittingLabels(color: string, size: number, radius: DataDrivenPropertyValueSpecification<number>): DataDrivenPropertyValueSpecification<string> {
  const ramp = parseZoomRamp(radius);
  // a zoom-dependent radius expression of the user's own can't be nested, so its labels go unchecked
  if (!ramp && usesZoom(radius)) return color;
  if (!ramp) return fitColor(color, size, radius as number | ExpressionSpecification);

  const [first, ...rest] = ramp;
  return ["step", ["zoom"], fitColor(color, size, first.value), ...rest.flatMap((stop) => [stop.zoom, fitColor(color, size, stop.value)])] as ExpressionSpecification;
}

/** `color` where a circle of `radius` is at least `size` across, else transparent. */
function fitColor(color: string, size: number, radius: number | ExpressionSpecification): ExpressionSpecification {
  return ["case", [">=", ["-", ["*", 2, radius], 2 * LABEL_FIT_MARGIN_PX], size], color, "rgba(0, 0, 0, 0)"];
}

type ZoomRampStop = { zoom: number; value: number | ExpressionSpecification };

/** Stops of a linear zoom interpolation (`rampedOptionsToLayerPaintSpec`, `radiusDrivenByProperty`), or `null` for a radius that doesn't depend on zoom. */
function parseZoomRamp(value: DataDrivenPropertyValueSpecification<number>): ZoomRampStop[] | null {
  if (!Array.isArray(value) || value[0] !== "interpolate") return null;
  const [, , input, ...stops] = value as unknown[];
  if (!Array.isArray(input) || input[0] !== "zoom") return null;

  const ramp: ZoomRampStop[] = [];
  for (let i = 0; i < stops.length; i += 2) {
    ramp.push({ zoom: stops[i] as number, value: stops[i + 1] as number | ExpressionSpecification });
  }
  return ramp;
}

//#endregion
