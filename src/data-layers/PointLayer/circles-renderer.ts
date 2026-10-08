import type { DataDrivenPropertyValueSpecification } from "maplibre-gl";
import { ColorRampCollection, type ColorRamp } from "../../ColorRamp";
import type { DataDrivenStyle } from "../../helpers/vectorlayerhelpers";
import { colorDrivenByProperty, opacityDrivenByProperty, paintColorOptionsToPaintSpec, radiusDrivenByProperty, rampedOptionsToLayerPaintSpec } from "../../helpers/stylehelper";
import type { SublayerSpecification } from "../DataLayer";
import type { PointLayerCirclesStyling } from "./types";

// Layer specs for `circles` mode. Ported from the `addPoint` helper's spec
// logic — kept as a copy rather than shared, so `addPoint` stays frozen. The
// resulting layers should match `addPoint`'s for the same options.

//#region Types

/** Everything besides styling that the circle layers depend on. */
export type CirclesRenderContext = {
  layerId: string;
  sourceId: string;
  cluster: boolean;
  minzoom: number;
  maxzoom: number;
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

//#endregion

//#region Styling

/**
 * Fills in `addPoint`'s defaults.
 * @param styling - Styling as set by the user.
 * @param defaultColor - Colour used when `pointColor` is unset and not clustering — picked once per layer, as `addPoint` picks one per call.
 * @param cluster - Whether the layer clusters, which changes several defaults.
 */
export function resolveCirclesStyling(styling: PointLayerCirclesStyling, defaultColor: string, cluster: boolean): PointLayerCirclesStyling {
  return {
    ...styling,
    pointColor: styling.pointColor ?? (cluster ? defaultColorRamp(cluster) : defaultColor),
    minPointRadius: styling.minPointRadius ?? DEFAULT_MIN_POINT_RADIUS,
    maxPointRadius: styling.maxPointRadius ?? DEFAULT_MAX_POINT_RADIUS,
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

function defaultColorRamp(cluster: boolean): ColorRamp {
  return ColorRampCollection.TURBO.scale(10, cluster ? 10000 : 1000).resample("ease-out-square");
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
 * @param context - Ids, clustering and zoom range.
 */
export function buildCircleLayers(styling: PointLayerCirclesStyling, context: CirclesRenderContext): SublayerSpecification[] {
  const { sourceId, cluster } = context;
  const ids = getCircleLayerIds(context.layerId);

  const minPointRadius = styling.minPointRadius ?? DEFAULT_MIN_POINT_RADIUS;
  const maxPointRadius = styling.maxPointRadius ?? DEFAULT_MAX_POINT_RADIUS;
  const colorramp = Array.isArray(styling.pointColor) ? styling.pointColor : defaultColorRamp(cluster);
  const colorRampBounds = colorramp.getBounds();
  const alignOnViewport = styling.alignOnViewport ?? true;
  const zoomCompensation = styling.zoomCompensation ?? true;
  const pointOpacity = resolvePointOpacity(styling, colorramp, context);
  const outlinePaint = buildOutlinePaint(styling);

  const layers: SublayerSpecification[] = [];

  if (cluster) {
    // clusters are sized and coloured by their point count, never by zoom or a property
    const clusterStyle: DataDrivenStyle = Array.from({ length: DATA_DRIVEN_STYLE_STEPS }, (_, i) => {
      const value = colorRampBounds.min + (i * (colorRampBounds.max - colorRampBounds.min)) / (DATA_DRIVEN_STYLE_STEPS - 1);
      return {
        value,
        pointRadius: minPointRadius + (maxPointRadius - minPointRadius) * (i / (DATA_DRIVEN_STYLE_STEPS - 1)) ** 0.5,
        color: colorramp.getColorHex(value),
      };
    });

    layers.push({
      id: ids.cluster,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": typeof styling.pointColor === "string" ? styling.pointColor : colorDrivenByProperty(clusterStyle, "point_count"),
        "circle-radius":
          typeof styling.pointRadius === "number"
            ? styling.pointRadius
            : Array.isArray(styling.pointRadius)
              ? rampedOptionsToLayerPaintSpec(styling.pointRadius)
              : radiusDrivenByProperty(clusterStyle, "point_count", false),
        "circle-pitch-alignment": alignOnViewport ? "viewport" : "map",
        "circle-pitch-scale": "map", // scale with camera distance regardless of viewport/map alignment
        "circle-opacity": pointOpacity,
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
        "circle-color": typeof styling.pointColor === "string" ? styling.pointColor : colorramp.getColorHex(colorramp.getBounds().min),
        "circle-radius":
          typeof styling.pointRadius === "number"
            ? styling.pointRadius
            : Array.isArray(styling.pointRadius)
              ? rampedOptionsToLayerPaintSpec(styling.pointRadius)
              : clusterStyle[0].pointRadius * 0.75,
        "circle-opacity": pointOpacity,
        ...outlinePaint,
      },
    });
  } else {
    let pointColor: DataDrivenPropertyValueSpecification<string> =
      typeof styling.pointColor === "string"
        ? styling.pointColor
        : // a colour ramp without a property uses its first colour
          colorramp.getColorHex(colorramp.getBounds().min);

    let pointRadius: DataDrivenPropertyValueSpecification<number> =
      typeof styling.pointRadius === "number"
        ? zoomCompensation
          ? rampedOptionsToLayerPaintSpec([
              { zoom: 0, value: styling.pointRadius * 0.025 },
              { zoom: 2, value: styling.pointRadius * 0.05 },
              { zoom: 4, value: styling.pointRadius * 0.1 },
              { zoom: 8, value: styling.pointRadius * 0.25 },
              { zoom: 16, value: styling.pointRadius * 1 },
            ])
          : styling.pointRadius
        : Array.isArray(styling.pointRadius)
          ? rampedOptionsToLayerPaintSpec(styling.pointRadius)
          : zoomCompensation
            ? rampedOptionsToLayerPaintSpec([
                { zoom: 0, value: minPointRadius * 0.05 },
                { zoom: 2, value: minPointRadius * 0.1 },
                { zoom: 4, value: minPointRadius * 0.2 },
                { zoom: 8, value: minPointRadius * 0.5 },
                { zoom: 16, value: minPointRadius * 1 },
              ])
            : minPointRadius;

    // colour and radius driven by a property need a colour ramp to read from
    if (styling.property && Array.isArray(styling.pointColor)) {
      const dataDrivenStyle: DataDrivenStyle = Array.from({ length: DATA_DRIVEN_STYLE_STEPS }, (_, i) => {
        const value = colorRampBounds.min + (i * (colorRampBounds.max - colorRampBounds.min)) / (DATA_DRIVEN_STYLE_STEPS - 1);
        return {
          value,
          pointRadius:
            typeof styling.pointRadius === "number" ? styling.pointRadius : minPointRadius + (maxPointRadius - minPointRadius) * (i / (DATA_DRIVEN_STYLE_STEPS - 1)) ** 0.5,
          color: colorramp.getColorHex(value),
        };
      });
      pointColor = colorDrivenByProperty(dataDrivenStyle, styling.property);
      pointRadius = radiusDrivenByProperty(dataDrivenStyle, styling.property, zoomCompensation);
    }

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
        "circle-opacity": pointOpacity,
        "circle-radius": pointRadius,
        ...outlinePaint,
      },
    });
  }

  // labels show the cluster count, or the `property` value — only when `showLabel` (defaulting to `cluster`) is on
  const labelProperty = cluster ? "point_count" : styling.property;
  const showLabel = styling.showLabel ?? cluster;
  if (showLabel && labelProperty) {
    layers.push({
      id: ids.label,
      type: "symbol",
      source: sourceId,
      filter: ["has", labelProperty],
      layout: {
        "text-field": cluster ? "{point_count_abbreviated}" : `{${labelProperty}}`,
        "text-font": LABEL_FONT,
        "text-size": styling.labelSize ?? DEFAULT_LABEL_SIZE,
        "text-pitch-alignment": alignOnViewport ? "viewport" : "map",
        "symbol-sort-key": ["/", 1, ["get", labelProperty]], // so that the largest value goes on top
      },
      paint: {
        "text-color": styling.labelColor ?? DEFAULT_LABEL_COLOR,
        "text-opacity": pointOpacity,
      },
    });
  }

  return layers;
}

/** `pointOpacity`, else ramp-driven opacity, else a fade in/out at the zoom range's edges. */
function resolvePointOpacity(styling: PointLayerCirclesStyling, colorramp: ColorRamp, context: CirclesRenderContext): DataDrivenPropertyValueSpecification<number> {
  const { cluster, minzoom, maxzoom } = context;

  if (typeof styling.pointOpacity === "number") return styling.pointOpacity;
  if (Array.isArray(styling.pointOpacity)) return rampedOptionsToLayerPaintSpec(styling.pointOpacity);
  if (cluster) return opacityDrivenByProperty(colorramp, "point_count");
  if (styling.property) return opacityDrivenByProperty(colorramp, styling.property);

  return rampedOptionsToLayerPaintSpec([
    { zoom: minzoom, value: 0 },
    { zoom: minzoom + 0.25, value: 1 },
    { zoom: maxzoom - 0.25, value: 1 },
    { zoom: maxzoom, value: 0 },
  ]);
}

function buildOutlinePaint(styling: PointLayerCirclesStyling) {
  if (!styling.outline) return {};

  const outlineOpacity = styling.outlineOpacity ?? 1;
  const outlineWidth = styling.outlineWidth ?? 1;
  const outlineColor = styling.outlineColor ?? DEFAULT_OUTLINE_COLOR;

  return {
    "circle-stroke-opacity": typeof outlineOpacity === "number" ? outlineOpacity : rampedOptionsToLayerPaintSpec(outlineOpacity),
    "circle-stroke-width": typeof outlineWidth === "number" ? outlineWidth : rampedOptionsToLayerPaintSpec(outlineWidth),
    "circle-stroke-color": typeof outlineColor === "string" ? outlineColor : paintColorOptionsToPaintSpec(outlineColor),
  };
}

//#endregion
