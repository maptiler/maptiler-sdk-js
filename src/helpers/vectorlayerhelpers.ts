import type { Geometry, FeatureCollection, GeoJsonProperties } from "geojson";
import type {
  DataDrivenPropertyValueSpecification,
  PropertyValueSpecification,
} from "maplibre-gl";
import type { Map } from "../Map";
import { config } from "../config";
import { isUUID, jsonParseNoThrow } from "../tools";
import {
  computeRampedOutlineWidth,
  generateRandomLayerName,
  generateRandomSourceName,
  getRandomColor,
  paintColorOptionsToPaintSpec,
  rampedOptionsToLayerPaintSpec,
  dashArrayMaker,
  colorDrivenByProperty,
  radiusDrivenByProperty,
  opacityDrivenByProperty,
  heatmapIntensityFromColorRamp,
  rampedPropertyValueWeight,
  radiusDrivenByPropertyHeatmap,
} from "./stylehelper";

import { gpx, gpxOrKml, kml } from "../converters";
import { ColorRampCollection, ColorRamp } from "../colorramp";

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
  propertyValue: number;

  /**
   * Value to associate it with (output)
   */
  value: number;
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
  value: number;

  /**
   * Radius of the cluster circle
   */
  pointRadius: number;

  /**
   * Color of the cluster
   */
  color: string;
}>;

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

export type PolygonLayerOptions = CommonShapeLayerOptions & {
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
  zoomCompensation?: boolean;
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
  colorRamp?: ColorRamp;

  /**
   * Use a property to apply a weight to each data point. Using a property requires also using
   * the options `.propertyValueWeight` or otherwise will be ignored.
   * Default: none, the points will all have a weight of `1`.
   */
  property?: string;

  /**
   * The weight to give to each data point. If of type `PropertyValueWeights`, then the options `.property`
   * must also be provided. If used a number, all data points will be weighted by the same number (which is of little interest)
   */
  weight?: PropertyValues | number;

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
  radius?: number | ZoomNumberValues | PropertyValues;

  /**
   * The opacity can be a fixed value or zoom-driven.
   * Default: fades-in 0.25z after minzoom and fade-out 0.25z before maxzoom
   */
  opacity?: number | ZoomNumberValues;

  /**
   * The intensity is zoom-dependent. By default, the intensity is going to be scaled by zoom to preserve
   * a natural aspect or the data distribution.
   */
  intensity?: number | ZoomNumberValues;

  /**
   * If the radius is driven by a property, then it will also scale by zoomming if `.zoomCompensation` is `true`.
   * If `false`, the radius will not adapt according to the zoom level.
   * Default: `true`
   */
  zoomCompensation?: boolean;
};

/**
 * Add a polyline to the map from various sources and with builtin styling.
 * Compatible sources:
 * - gpx content as string
 * - gpx file from URL
 * - kml content from string
 * - kml from url
 * - geojson from url
 * - geojson content as string
 * - geojson content as JS object
 * - uuid of a MapTiler Cloud dataset
 *
 * The method also gives the possibility to add an outline layer (if `options.outline` is `true`)
 * and if so , the returned property `polylineOutlineLayerId` will be a string. As a result, two layers
 * would be added.
 *
 * The default styling creates a line layer of constant width of 3px, the color will be randomly picked
 * from a curated list of colors and the opacity will be 1.
 * If the outline is enabled, the outline width is of 1px at all zoom levels, the color is white and
 * the opacity is 1.
 *
 * Those style properties can be changed and ramped according to zoom level using an easier syntax.
 *
 */
export async function addPolyline(
  /**
   * Map instance to add a polyline layer to
   */
  map: Map,
  /**
   * Options related to adding a polyline layer
   */
  options: PolylineLayerOptions,
  /**
   * When the polyline data is loaded from a distant source, these options are propagated to the call of `fetch`
   */
  fetchOptions: RequestInit = {},
): Promise<{
  polylineLayerId: string;
  polylineOutlineLayerId: string;
  polylineSourceId: string;
}> {
  // We need to have the sourceId of the sourceData
  if (!options.sourceId && !options.data) {
    throw new Error(
      "Creating a polyline layer requires an existing .sourceId or a valid .data property",
    );
  }

  // We are going to evaluate the content of .data, if provided
  let data = options.data;

  if (typeof data === "string") {
    // if options.data exists and is a uuid string, we consider that it points to a MapTiler Dataset
    if (isUUID(data)) {
      data = `https://api.maptiler.com/data/${options.data}/features.json?key=${config.apiKey}`;
    }

    // options.data could be a url to a .gpx file
    else if (data.split(".").pop()?.toLowerCase().trim() === "gpx") {
      // fetch the file
      const res = await fetch(data, fetchOptions);
      const gpxStr = await res.text();
      // Convert it to geojson. Will throw is invalid GPX content
      data = gpx(gpxStr);
    }

    // options.data could be a url to a .kml file
    else if (data.split(".").pop()?.toLowerCase().trim() === "kml") {
      // fetch the file
      const res = await fetch(data, fetchOptions);
      const kmlStr = await res.text();
      // Convert it to geojson. Will throw is invalid GPX content
      data = kml(kmlStr);
    } else {
      // From this point, we consider that the string content provided could
      // be the string content of one of the compatible format (GeoJSON, KML, GPX)
      const tmpData =
        jsonParseNoThrow<FeatureCollection<Geometry, GeoJsonProperties>>(
          data,
        ) ?? gpxOrKml(data);
      if (tmpData) data = tmpData;
    }

    if (!data) {
      throw new Error(
        "Polyline data was provided as string but is incompatible with valid formats.",
      );
    }
  }

  return addGeoJSONPolyline(map, {
    ...options,
    data,
  });
}

/**
 * Add a polyline from a GeoJSON object
 */
function addGeoJSONPolyline(
  map: Map,
  // The data or data source is expected to contain LineStrings or MultiLineStrings
  options: PolylineLayerOptions,
): {
  /**
   * ID of the main line layer
   */
  polylineLayerId: string;

  /**
   * ID of the outline layer (will be `""` if no outline)
   */
  polylineOutlineLayerId: string;

  /**
   * ID of the data source
   */
  polylineSourceId: string;
} {
  if (options.layerId && map.getLayer(options.layerId)) {
    throw new Error(
      `A layer already exists with the layer id: ${options.layerId}`,
    );
  }

  const sourceId = options.sourceId ?? generateRandomSourceName();
  const layerId = options.layerId ?? generateRandomLayerName();

  const returnedInfo = {
    polylineLayerId: layerId,
    polylineOutlineLayerId: "",
    polylineSourceId: sourceId,
  };

  // A new source is added if the map does not have this sourceId and the data is provided
  if (options.data && !map.getSource(sourceId)) {
    // Adding the source
    map.addSource(sourceId, {
      type: "geojson",
      data: options.data,
    });
  }

  const lineWidth = options.lineWidth ?? 3;
  const lineColor = options.lineColor ?? getRandomColor();
  const lineOpacity = options.lineOpacity ?? 1;
  const lineBlur = options.lineBlur ?? 0;
  const lineGapWidth = options.lineGapWidth ?? 0;
  let lineDashArray = options.lineDashArray ?? null;
  const outlineWidth = options.outlineWidth ?? 1;
  const outlineColor = options.outlineColor ?? "#FFFFFF";
  const outlineOpacity = options.outlineOpacity ?? 1;
  const outlineBlur = options.outlineBlur ?? 0;

  if (typeof lineDashArray === "string") {
    lineDashArray = dashArrayMaker(lineDashArray);
  }

  // We want to create an outline for this line layer
  if (options.outline === true) {
    const outlineLayerId = `${layerId}_outline`;
    returnedInfo.polylineOutlineLayerId = outlineLayerId;

    map.addLayer(
      {
        id: outlineLayerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": options.lineJoin ?? "round",
          "line-cap": options.lineCap ?? "round",
        },
        minzoom: options.minzoom ?? 0,
        maxzoom: options.maxzoom ?? 23,
        paint: {
          "line-opacity":
            typeof outlineOpacity === "number"
              ? outlineOpacity
              : rampedOptionsToLayerPaintSpec(outlineOpacity),
          "line-color":
            typeof outlineColor === "string"
              ? outlineColor
              : paintColorOptionsToPaintSpec(outlineColor),
          "line-width": computeRampedOutlineWidth(lineWidth, outlineWidth),
          "line-blur":
            typeof outlineBlur === "number"
              ? outlineBlur
              : rampedOptionsToLayerPaintSpec(outlineBlur),
        },
      },
      options.beforeId,
    );
  }

  map.addLayer(
    {
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": options.lineJoin ?? "round",
        "line-cap": options.lineCap ?? "round",
      },
      minzoom: options.minzoom ?? 0,
      maxzoom: options.maxzoom ?? 23,
      paint: {
        "line-opacity":
          typeof lineOpacity === "number"
            ? lineOpacity
            : rampedOptionsToLayerPaintSpec(lineOpacity),
        "line-color":
          typeof lineColor === "string"
            ? lineColor
            : paintColorOptionsToPaintSpec(lineColor),
        "line-width":
          typeof lineWidth === "number"
            ? lineWidth
            : rampedOptionsToLayerPaintSpec(lineWidth),

        "line-blur":
          typeof lineBlur === "number"
            ? lineBlur
            : rampedOptionsToLayerPaintSpec(lineBlur),

        "line-gap-width":
          typeof lineGapWidth === "number"
            ? lineGapWidth
            : rampedOptionsToLayerPaintSpec(lineGapWidth),

        // For some reasons passing "line-dasharray" with the value "undefined"
        // results in no showing the line while it should have the same behavior
        // of not adding the property "line-dasharray" as all.
        // As a workaround, we are inlining the addition of the prop with a conditional
        // which is less readable.
        ...(lineDashArray && { "line-dasharray": lineDashArray }),
      },
    },
    options.beforeId,
  );

  return returnedInfo;
}

/**
 * Add a polygon with styling options.
 */
export function addPolygon(
  map: Map,
  // this Feature collection is expected to contain on LineStrings and MultiLinestrings
  options: PolygonLayerOptions,
): {
  /**
   * ID of the fill layer
   */
  polygonLayerId: string;

  /**
   * ID of the outline layer (will be `""` if no outline)
   */
  polygonOutlineLayerId: string;

  /**
   * ID of the source that contains the data
   */
  polygonSourceId: string;
} {
  if (options.layerId && map.getLayer(options.layerId)) {
    throw new Error(
      `A layer already exists with the layer id: ${options.layerId}`,
    );
  }

  const sourceId = options.sourceId ?? generateRandomSourceName();
  const layerId = options.layerId ?? generateRandomLayerName();

  const returnedInfo = {
    polygonLayerId: layerId,
    polygonOutlineLayerId: options.outline ? `${layerId}_outline` : "",
    polygonSourceId: sourceId,
  };

  // A new source is added if the map does not have this sourceId and the data is provided
  if (options.data && !map.getSource(sourceId)) {
    let data: string | FeatureCollection = options.data;

    // If is a UUID, we extend it to be the URL to a MapTiler Cloud hosted dataset
    if (typeof data === "string" && isUUID(data)) {
      data = `https://api.maptiler.com/data/${data}/features.json?key=${config.apiKey}`;
    }

    // Adding the source
    map.addSource(sourceId, {
      type: "geojson",
      data: data,
    });
  }

  let outlineDashArray = options.outlineDashArray ?? null;
  const outlineWidth = options.outlineWidth ?? 1;
  const outlineColor = options.outlineColor ?? "#FFFFFF";
  const outlineOpacity = options.outlineOpacity ?? 1;
  const outlineBlur = options.outlineBlur ?? 0;
  const fillColor = options.fillColor ?? getRandomColor();
  const fillOpacity = options.fillOpacity ?? 1;
  const outlinePosition = options.outlinePosition ?? "center";
  const pattern = options.pattern ?? null;

  if (typeof outlineDashArray === "string") {
    outlineDashArray = dashArrayMaker(outlineDashArray);
  }

  const addLayers = (patternImageId: string | null = null) => {
    map.addLayer(
      {
        id: layerId,
        type: "fill",
        source: sourceId,
        minzoom: options.minzoom ?? 0,
        maxzoom: options.maxzoom ?? 23,
        paint: {
          "fill-color":
            typeof fillColor === "string"
              ? fillColor
              : paintColorOptionsToPaintSpec(fillColor),

          "fill-opacity":
            typeof fillOpacity === "number"
              ? fillOpacity
              : rampedOptionsToLayerPaintSpec(fillOpacity),

          // Adding a pattern if provided
          ...(patternImageId && { "fill-pattern": patternImageId }),
        },
      },
      options.beforeId,
    );

    // We want to create an outline for this line layer
    if (options.outline === true) {
      let computedOutlineOffset:
        | DataDrivenPropertyValueSpecification<number>
        | number;

      if (outlinePosition === "inside") {
        if (typeof outlineWidth === "number") {
          computedOutlineOffset = 0.5 * outlineWidth;
        } else {
          computedOutlineOffset = rampedOptionsToLayerPaintSpec(
            outlineWidth.map(({ zoom, value }) => ({
              zoom,
              value: 0.5 * value,
            })),
          );
        }
      } else if (outlinePosition === "outside") {
        if (typeof outlineWidth === "number") {
          computedOutlineOffset = -0.5 * outlineWidth;
        } else {
          computedOutlineOffset = rampedOptionsToLayerPaintSpec(
            outlineWidth.map((el) => ({
              zoom: el.zoom,
              value: -0.5 * el.value,
            })),
          );
        }
      } else {
        computedOutlineOffset = 0;
      }

      map.addLayer(
        {
          id: returnedInfo.polygonOutlineLayerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": options.outlineJoin ?? "round",
            "line-cap": options.outlineCap ?? "butt",
          },
          minzoom: options.minzoom ?? 0,
          maxzoom: options.maxzoom ?? 23,
          paint: {
            "line-opacity":
              typeof outlineOpacity === "number"
                ? outlineOpacity
                : rampedOptionsToLayerPaintSpec(outlineOpacity),
            "line-color":
              typeof outlineColor === "string"
                ? outlineColor
                : paintColorOptionsToPaintSpec(outlineColor),
            "line-width":
              typeof outlineWidth === "number"
                ? outlineWidth
                : rampedOptionsToLayerPaintSpec(outlineWidth),
            "line-blur":
              typeof outlineBlur === "number"
                ? outlineBlur
                : rampedOptionsToLayerPaintSpec(outlineBlur),

            "line-offset": computedOutlineOffset,

            // For some reasons passing "line-dasharray" with the value "undefined"
            // results in no showing the line while it should have the same behavior
            // of not adding the property "line-dasharray" as all.
            // As a workaround, we are inlining the addition of the prop with a conditional
            // which is less readable.
            ...(outlineDashArray && {
              "line-dasharray": outlineDashArray as PropertyValueSpecification<
                number[]
              >,
            }),
          },
        },
        options.beforeId,
      );
    }
  };

  if (pattern) {
    if (map.hasImage(pattern)) {
      addLayers(pattern);
    } else {
      map.loadImage(
        pattern,

        // (error?: Error | null, image?: HTMLImageElement | ImageBitmap | null, expiry?: ExpiryData | null)
        (
          error: Error | null | undefined,
          image: HTMLImageElement | ImageBitmap | null | undefined,
        ) => {
          // Throw an error if something goes wrong.
          if (error) {
            console.error("Could not load the pattern image.", error.message);
            return addLayers();
          }

          if (!image) {
            console.error(
              `An image cannot be created from the pattern URL ${pattern}.`,
            );
            return addLayers();
          }

          // Add the image to the map style, using the image URL as an ID
          map.addImage(pattern, image);

          addLayers(pattern);
        },
      );
    }
  } else {
    addLayers();
  }

  return returnedInfo;
}

/**
 * Add a point layer from a GeoJSON source (or an existing sourceId) with many styling options
 */
export function addPoint(
  /**
   * The Map instance to add a point layer to
   */
  map: Map,
  // The data or data source is expected to contain LineStrings or MultiLineStrings
  options: PointLayerOptions,
): {
  /**
   * ID of the unclustered point layer
   */
  pointLayerId: string;

  /**
   * ID of the clustered point layer (empty if `cluster` options id `false`)
   */
  clusterLayerId: string;

  /**
   * ID of the layer that shows the count of elements in each cluster (empty if `cluster` options id `false`)
   */
  labelLayerId: string;

  /**
   * ID of the data source
   */
  pointSourceId: string;
} {
  if (options.layerId && map.getLayer(options.layerId)) {
    throw new Error(
      `A layer already exists with the layer id: ${options.layerId}`,
    );
  }

  const minPointRadius = options.minPointRadius ?? 10;
  const maxPointRadius = options.maxPointRadius ?? 50;
  const cluster = options.cluster ?? false;
  const nbDefaultDataDrivenStyleSteps = 20;
  const colorramp = Array.isArray(options.pointColor)
    ? options.pointColor
    : ColorRampCollection.TURBO.scale(
        10,
        options.cluster ? 10000 : 1000,
      ).resample("ease-out-square");
  const colorRampBounds = colorramp.getBounds();
  const sourceId = options.sourceId ?? generateRandomSourceName();
  const layerId = options.layerId ?? generateRandomLayerName();
  const showLabel = options.showLabel ?? cluster;
  const alignOnViewport = options.alignOnViewport ?? true;
  const outline = options.outline ?? false;
  const outlineOpacity = options.outlineOpacity ?? 1;
  const outlineWidth = options.outlineWidth ?? 1;
  const outlineColor = options.outlineColor ?? "#FFFFFF";
  let pointOpacity;
  const zoomCompensation = options.zoomCompensation ?? true;
  const minzoom = options.minzoom ?? 0;
  const maxzoom = options.maxzoom ?? 23;

  if (typeof options.pointOpacity === "number") {
    pointOpacity = options.pointOpacity;
  } else if (Array.isArray(options.pointOpacity)) {
    pointOpacity = rampedOptionsToLayerPaintSpec(options.pointOpacity);
  } else if (options.cluster) {
    pointOpacity = opacityDrivenByProperty(colorramp, "point_count");
  } else if (options.property) {
    pointOpacity = opacityDrivenByProperty(colorramp, options.property);
  } else {
    pointOpacity = rampedOptionsToLayerPaintSpec([
      { zoom: minzoom, value: 0 },
      { zoom: minzoom + 0.25, value: 1 },
      { zoom: maxzoom - 0.25, value: 1 },
      { zoom: maxzoom, value: 0 },
    ]);
  }

  const returnedInfo = {
    pointLayerId: layerId,
    clusterLayerId: "",
    labelLayerId: "",
    pointSourceId: sourceId,
  };

  // A new source is added if the map does not have this sourceId and the data is provided
  if (options.data && !map.getSource(sourceId)) {
    let data: string | FeatureCollection = options.data;

    // If is a UUID, we extend it to be the URL to a MapTiler Cloud hosted dataset
    if (typeof data === "string" && isUUID(data)) {
      data = `https://api.maptiler.com/data/${data}/features.json?key=${config.apiKey}`;
    }

    // Adding the source
    map.addSource(sourceId, {
      type: "geojson",
      data: data,
      cluster,
    });
  }

  if (cluster) {
    // If using clusters, the size and color of the circles (clusters) are driven by the
    // numbner of elements they contain and cannot be driven by the zoom level or a property

    returnedInfo.clusterLayerId = `${layerId}_cluster`;

    const clusterStyle: DataDrivenStyle = Array.from(
      { length: nbDefaultDataDrivenStyleSteps },
      (_, i) => {
        const value =
          colorRampBounds.min +
          (i * (colorRampBounds.max - colorRampBounds.min)) /
            (nbDefaultDataDrivenStyleSteps - 1);
        return {
          value,
          pointRadius:
            minPointRadius +
            (maxPointRadius - minPointRadius) *
              Math.pow(i / (nbDefaultDataDrivenStyleSteps - 1), 0.5),
          color: colorramp.getColorHex(value),
        };
      },
    );

    map.addLayer(
      {
        id: returnedInfo.clusterLayerId,
        type: "circle",
        source: sourceId,
        filter: ["has", "point_count"],
        paint: {
          // 'circle-color': options.pointColor ?? colorDrivenByProperty(clusterStyle, "point_count"),
          "circle-color":
            typeof options.pointColor === "string"
              ? options.pointColor
              : colorDrivenByProperty(clusterStyle, "point_count"),

          "circle-radius":
            typeof options.pointRadius === "number"
              ? options.pointRadius
              : Array.isArray(options.pointRadius)
              ? rampedOptionsToLayerPaintSpec(options.pointRadius)
              : radiusDrivenByProperty(clusterStyle, "point_count", false),

          "circle-pitch-alignment": alignOnViewport ? "viewport" : "map",
          "circle-pitch-scale": "map", // scale with camera distance regardless of viewport/biewport alignement
          "circle-opacity": pointOpacity,
          ...(outline && {
            "circle-stroke-opacity":
              typeof outlineOpacity === "number"
                ? outlineOpacity
                : rampedOptionsToLayerPaintSpec(outlineOpacity),

            "circle-stroke-width":
              typeof outlineWidth === "number"
                ? outlineWidth
                : rampedOptionsToLayerPaintSpec(outlineWidth),

            "circle-stroke-color":
              typeof outlineColor === "string"
                ? outlineColor
                : paintColorOptionsToPaintSpec(outlineColor),
          }),
        },
        minzoom,
        maxzoom,
      },
      options.beforeId,
    );

    // Adding the layer of unclustered point (visible only when ungrouped)
    map.addLayer(
      {
        id: returnedInfo.pointLayerId,
        type: "circle",
        source: sourceId,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-pitch-alignment": alignOnViewport ? "viewport" : "map",
          "circle-pitch-scale": "map", // scale with camera distance regardless of viewport/biewport alignement
          // 'circle-color':  options.pointColor ?? clusterStyle[0].color,
          "circle-color":
            typeof options.pointColor === "string"
              ? options.pointColor
              : colorramp.getColorHex(colorramp.getBounds().min),
          "circle-radius":
            typeof options.pointRadius === "number"
              ? options.pointRadius
              : Array.isArray(options.pointRadius)
              ? rampedOptionsToLayerPaintSpec(options.pointRadius)
              : clusterStyle[0].pointRadius * 0.75,
          "circle-opacity": pointOpacity,
          ...(outline && {
            "circle-stroke-opacity":
              typeof outlineOpacity === "number"
                ? outlineOpacity
                : rampedOptionsToLayerPaintSpec(outlineOpacity),

            "circle-stroke-width":
              typeof outlineWidth === "number"
                ? outlineWidth
                : rampedOptionsToLayerPaintSpec(outlineWidth),

            "circle-stroke-color":
              typeof outlineColor === "string"
                ? outlineColor
                : paintColorOptionsToPaintSpec(outlineColor),
          }),
        },
        minzoom,
        maxzoom,
      },
      options.beforeId,
    );
  }

  // Not displaying clusters
  else {
    let pointColor: DataDrivenPropertyValueSpecification<string> =
      typeof options.pointColor === "string"
        ? options.pointColor
        : Array.isArray(options.pointColor)
        ? options.pointColor.getColorHex(options.pointColor.getBounds().min) // if color ramp is given, we choose the first color of it, even if the property may not be provided
        : getRandomColor();

    let pointRadius: DataDrivenPropertyValueSpecification<number> =
      typeof options.pointRadius === "number"
        ? zoomCompensation
          ? rampedOptionsToLayerPaintSpec([
              { zoom: 0, value: options.pointRadius * 0.025 },
              { zoom: 2, value: options.pointRadius * 0.05 },
              { zoom: 4, value: options.pointRadius * 0.1 },
              { zoom: 8, value: options.pointRadius * 0.25 },
              { zoom: 16, value: options.pointRadius * 1 },
            ])
          : options.pointRadius
        : Array.isArray(options.pointRadius)
        ? rampedOptionsToLayerPaintSpec(options.pointRadius)
        : zoomCompensation
        ? rampedOptionsToLayerPaintSpec([
            { zoom: 0, value: minPointRadius * 0.05 },
            { zoom: 2, value: minPointRadius * 0.1 },
            { zoom: 4, value: minPointRadius * 0.2 },
            { zoom: 8, value: minPointRadius * 0.5 },
            { zoom: 16, value: minPointRadius * 1 },
          ])
        : minPointRadius;

    // If the styling depends on a property, then we build a custom style
    if (options.property && Array.isArray(options.pointColor)) {
      const dataDrivenStyle: DataDrivenStyle = Array.from(
        { length: nbDefaultDataDrivenStyleSteps },
        (_, i) => {
          const value =
            colorRampBounds.min +
            (i * (colorRampBounds.max - colorRampBounds.min)) /
              (nbDefaultDataDrivenStyleSteps - 1);
          return {
            value,
            pointRadius:
              typeof options.pointRadius === "number"
                ? options.pointRadius
                : minPointRadius +
                  (maxPointRadius - minPointRadius) *
                    Math.pow(i / (nbDefaultDataDrivenStyleSteps - 1), 0.5),
            color:
              typeof options.pointColor === "string"
                ? options.pointColor
                : colorramp.getColorHex(value),
          };
        },
      );
      pointColor = colorDrivenByProperty(dataDrivenStyle, options.property);
      pointRadius = radiusDrivenByProperty(
        dataDrivenStyle,
        options.property,
        zoomCompensation,
      );
    }

    // Adding the layer of unclustered point
    map.addLayer(
      {
        id: returnedInfo.pointLayerId,
        type: "circle",
        source: sourceId,
        layout: {
          // Contrary to labels, we want to see the small one in front. Weirdly "circle-sort-key" works in the opposite direction as "symbol-sort-key".
          "circle-sort-key": options.property
            ? ["/", 1, ["get", options.property]]
            : 0,
        },
        paint: {
          "circle-pitch-alignment": alignOnViewport ? "viewport" : "map",
          "circle-pitch-scale": "map", // scale with camera distance regardless of viewport/biewport alignement
          "circle-color": pointColor,
          "circle-opacity": pointOpacity,
          "circle-radius": pointRadius,

          ...(outline && {
            "circle-stroke-opacity":
              typeof outlineOpacity === "number"
                ? outlineOpacity
                : rampedOptionsToLayerPaintSpec(outlineOpacity),

            "circle-stroke-width":
              typeof outlineWidth === "number"
                ? outlineWidth
                : rampedOptionsToLayerPaintSpec(outlineWidth),

            "circle-stroke-color":
              typeof outlineColor === "string"
                ? outlineColor
                : paintColorOptionsToPaintSpec(outlineColor),
          }),
        },
        minzoom,
        maxzoom,
      },
      options.beforeId,
    );
  }

  if (showLabel !== false && (options.cluster || options.property)) {
    returnedInfo.labelLayerId = `${layerId}_label`;
    const labelColor = options.labelColor ?? "#fff";
    const labelSize = options.labelSize ?? 12;

    // With clusters, a layer with clouster count is also added
    map.addLayer(
      {
        id: returnedInfo.labelLayerId,
        type: "symbol",
        source: sourceId,
        filter: [
          "has",
          options.cluster ? "point_count" : (options.property as string),
        ],
        layout: {
          "text-field": options.cluster
            ? "{point_count_abbreviated}"
            : `{${options.property as string}}`,
          "text-font": ["Noto Sans Regular"],
          "text-size": labelSize,
          "text-pitch-alignment": alignOnViewport ? "viewport" : "map",
          "symbol-sort-key": [
            "/",
            1,
            [
              "get",
              options.cluster ? "point_count" : (options.property as string),
            ],
          ], // so that the largest value goes on top
        },
        paint: {
          "text-color": labelColor,
          "text-opacity": pointOpacity,
        },
        minzoom,
        maxzoom,
      },
      options.beforeId,
    );
  }
  return returnedInfo;
}

/**
 * Add a polyline witgh optional outline from a GeoJSON object
 */
export function addHeatmap(
  /**
   * Map instance to add a heatmap layer to
   */
  map: Map,
  // The data or data source is expected to contain LineStrings or MultiLineStrings
  options: HeatmapLayerOptions,
): {
  /**
   * ID of the heatmap layer
   */
  heatmapLayerId: string;

  /**
   * ID of the data source
   */
  heatmapSourceId: string;
} {
  if (options.layerId && map.getLayer(options.layerId)) {
    throw new Error(
      `A layer already exists with the layer id: ${options.layerId}`,
    );
  }

  const sourceId = options.sourceId ?? generateRandomSourceName();
  const layerId = options.layerId ?? generateRandomLayerName();
  const minzoom = options.minzoom ?? 0;
  const maxzoom = options.maxzoom ?? 23;
  const zoomCompensation = options.zoomCompensation ?? true;

  const opacity = options.opacity ?? [
    { zoom: minzoom, value: 0 },
    { zoom: minzoom + 0.25, value: 1 },
    { zoom: maxzoom - 0.25, value: 1 },
    { zoom: maxzoom, value: 0 },
  ];

  // const colorRamp = "colorRamp" in options
  let colorRamp = Array.isArray(options.colorRamp)
    ? options.colorRamp
    : ColorRampCollection.TURBO.transparentStart();

  // making sure the color ramp has [0, 1] bounds
  const crBounds = colorRamp.getBounds();
  if (crBounds.min !== 0 || crBounds.max !== 1) {
    colorRamp = colorRamp.scale(0, 1);
  }

  // making sure the color ramp has is transparent in 0
  if (!colorRamp.hasTransparentStart()) {
    colorRamp = colorRamp.transparentStart();
  }

  const intensity = options.intensity ?? [
    { zoom: 0, value: 0.01 },
    { zoom: 4, value: 0.2 },
    { zoom: 16, value: 1 },
  ];

  const property = options.property ?? null;
  const propertyValueWeight = options.weight ?? 1;

  let heatmapWeight: DataDrivenPropertyValueSpecification<number> = 1; // = typeof propertyValueWeights === "number" ? propertyValueWeights : 1;

  if (property) {
    if (typeof propertyValueWeight === "number") {
      heatmapWeight = propertyValueWeight;

      // In case this numerical weight was provided by the user and not be the default value:
      if (typeof options.weight === "number") {
        console.warn(
          "The option `.property` is ignored when `.propertyValueWeights` is not of type `PropertyValueWeights`",
        );
      }
    } else if (Array.isArray(propertyValueWeight)) {
      heatmapWeight = rampedPropertyValueWeight(propertyValueWeight, property);
    } else {
      console.warn(
        "The option `.property` is ignored when `.propertyValueWeights` is not of type `PropertyValueWeights`",
      );
    }
  } else {
    if (typeof propertyValueWeight === "number") {
      heatmapWeight = propertyValueWeight;
    } else if (Array.isArray(propertyValueWeight)) {
      console.warn(
        "The options `.propertyValueWeights` can only be used when `.property` is provided.",
      );
    }
  }

  const defaultRadiusZoomRamping = [
    { zoom: 0, value: 50 * 0.025 },
    { zoom: 2, value: 50 * 0.05 },
    { zoom: 4, value: 50 * 0.1 },
    { zoom: 8, value: 50 * 0.25 },
    { zoom: 16, value: 50 },
  ];

  const radius =
    options.radius ?? (zoomCompensation ? defaultRadiusZoomRamping : 10);

  let radiusHeatmap: DataDrivenPropertyValueSpecification<number> = 1;

  if (typeof radius === "number") {
    radiusHeatmap = radius;
  }

  // Radius is provided as a zoom-ramping array
  else if (Array.isArray(radius) && "zoom" in radius[0]) {
    radiusHeatmap = rampedOptionsToLayerPaintSpec(radius as ZoomNumberValues);
  }

  // Radius is provided as data driven
  else if (property && Array.isArray(radius) && "propertyValue" in radius[0]) {
    radiusHeatmap = radiusDrivenByPropertyHeatmap(
      radius as unknown as PropertyValues,
      property,
      zoomCompensation,
    );
  } else if (
    !property &&
    Array.isArray(radius) &&
    "propertyValue" in radius[0]
  ) {
    radiusHeatmap = rampedOptionsToLayerPaintSpec(
      defaultRadiusZoomRamping as ZoomNumberValues,
    );
    console.warn(
      "The option `.radius` can only be property-driven if the option `.property` is provided.",
    );
  } else {
    radiusHeatmap = rampedOptionsToLayerPaintSpec(
      defaultRadiusZoomRamping as ZoomNumberValues,
    );
  }

  const returnedInfo = {
    heatmapLayerId: layerId,
    heatmapSourceId: sourceId,
  };

  // A new source is added if the map does not have this sourceId and the data is provided
  if (options.data && !map.getSource(sourceId)) {
    let data: string | FeatureCollection = options.data;

    // If is a UUID, we extend it to be the URL to a MapTiler Cloud hosted dataset
    if (typeof data === "string" && isUUID(data)) {
      data = `https://api.maptiler.com/data/${data}/features.json?key=${config.apiKey}`;
    }

    // Adding the source
    map.addSource(sourceId, {
      type: "geojson",
      data: data,
    });
  }

  map.addLayer({
    id: layerId,
    type: "heatmap",
    source: sourceId,
    minzoom,
    maxzoom,
    paint: {
      "heatmap-weight": heatmapWeight,

      "heatmap-intensity":
        typeof intensity === "number"
          ? intensity
          : (rampedOptionsToLayerPaintSpec(
              intensity,
            ) as PropertyValueSpecification<number>),

      "heatmap-color": heatmapIntensityFromColorRamp(colorRamp),

      "heatmap-radius": radiusHeatmap,

      "heatmap-opacity":
        typeof opacity === "number"
          ? opacity
          : (rampedOptionsToLayerPaintSpec(
              opacity,
            ) as PropertyValueSpecification<number>),
    },
  });

  return returnedInfo;
}
