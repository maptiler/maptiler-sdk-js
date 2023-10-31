import {
  addPolyline,
  addPolygon,
  addPoint,
  addHeatmap,
} from "./vectorlayerhelpers";

export type {
  ZoomStringValues,
  ZoomNumberValues,
  PropertyValues,
  CommonShapeLayerOptions,
  PolylineLayerOptions,
  PolygonLayerOptions,
  PointLayerOptions,
  HeatmapLayerOptions,
} from "./vectorlayerhelpers";

/**
 * Helpers are a set of functions to facilitate the creation of sources and layers
 */
export const helpers = {
  addPolyline,
  addPolygon,
  addPoint,
  addHeatmap,
};
