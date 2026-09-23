import { FeatureCollection } from 'geojson';
import { Map as SDKMap } from '../Map';
import { ColorRamp } from '../ColorRamp';
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
export declare function addPolyline(
/**
 * Map instance to add a polyline layer to
 */
map: SDKMap, 
/**
 * Options related to adding a polyline layer
 */
options: PolylineLayerOptions, 
/**
 * When the polyline data is loaded from a distant source, these options are propagated to the call of `fetch`
 */
fetchOptions?: RequestInit): Promise<{
    polylineLayerId: string;
    polylineOutlineLayerId: string;
    polylineSourceId: string;
}>;
/**
 * Add a polygon with styling options.
 */
export declare function addPolygon(map: SDKMap, options: PolygonLayerOptions): {
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
};
/**
 * Add a point layer from a GeoJSON source (or an existing sourceId) with many styling options
 */
export declare function addPoint(
/**
 * The Map instance to add a point layer to
 */
map: SDKMap, options: PointLayerOptions): {
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
};
/**
 * Add a polyline witgh optional outline from a GeoJSON object
 */
export declare function addHeatmap(
/**
 * Map instance to add a heatmap layer to
 */
map: SDKMap, options: HeatmapLayerOptions): {
    /**
     * ID of the heatmap layer
     */
    heatmapLayerId: string;
    /**
     * ID of the data source
     */
    heatmapSourceId: string;
};
