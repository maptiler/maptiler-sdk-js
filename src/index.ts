/**
 * Maplibre export first, then extensions can overload the exports.
 */
export * from "maplibre-gl";
/**
 * To perform explicit named export so that they are included in the UMD bundle
 */
// import * as ML from "maplibre-gl";
import maplibregl from "maplibre-gl";
const {
  // supported,
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  LngLat,
  LngLatBounds,
  MercatorCoordinate,
  Evented,
  AJAXError,
  prewarm,
  clearPrewarmedResources,
  version,
  workerCount,
  maxParallelImageRequests,
  workerUrl,
  addProtocol,
  removeProtocol,
} = maplibregl;
// We still want to export maplibregl.Map, but as a different name
const MapMLGL = maplibregl.Map;
const MarkerMLGL = maplibregl.Marker;
const PopupMLGL = maplibregl.Popup;
const StyleMLGL = maplibregl.Style;
const CanvasSourceMLGL = maplibregl.CanvasSource;
const GeoJSONSourceMLGL = maplibregl.GeoJSONSource;
const ImageSourceMLGL = maplibregl.ImageSource;
const RasterTileSourceMLGL = maplibregl.RasterTileSource;
const RasterDEMTileSourceMLGL = maplibregl.RasterDEMTileSource;
const VectorTileSourceMLGL = maplibregl.VectorTileSource;
const VideoSourceMLGL = maplibregl.VideoSource;
const NavigationControlMLGL = maplibregl.NavigationControl;
const GeolocateControlMLGL = maplibregl.GeolocateControl;
const AttributionControlMLGL = maplibregl.AttributionControl;
const LogoControlMLGL = maplibregl.LogoControl;
const ScaleControlMLGL = maplibregl.ScaleControl;
const FullscreenControlMLGL = maplibregl.FullscreenControl;
const TerrainControlMLGL = maplibregl.TerrainControl;
export {
  // supported,
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  PopupMLGL,
  MarkerMLGL,
  StyleMLGL,
  LngLat,
  LngLatBounds,
  MercatorCoordinate,
  Evented,
  AJAXError,
  CanvasSourceMLGL,
  GeoJSONSourceMLGL,
  ImageSourceMLGL,
  RasterDEMTileSourceMLGL,
  RasterTileSourceMLGL,
  VectorTileSourceMLGL,
  VideoSourceMLGL,
  prewarm,
  clearPrewarmedResources,
  version,
  workerCount,
  maxParallelImageRequests,
  workerUrl,
  addProtocol,
  removeProtocol,
  MapMLGL,
};
// Exporting types of class instances from MapLibre:
export type NavigationControlMLGL = InstanceType<typeof NavigationControlMLGL>;
export type GeolocateControlMLGL = InstanceType<typeof GeolocateControlMLGL>;
export type AttributionControlMLGL = InstanceType<
  typeof AttributionControlMLGL
>;
export type LogoControlMLGL = InstanceType<typeof LogoControlMLGL>;
export type ScaleControlMLGL = InstanceType<typeof ScaleControlMLGL>;
export type FullscreenControlMLGL = InstanceType<typeof FullscreenControlMLGL>;
export type TerrainControlMLGL = InstanceType<typeof TerrainControlMLGL>;
export type MarkerMLGL = InstanceType<typeof MarkerMLGL>;
export type PopupMLGL = InstanceType<typeof PopupMLGL>;
export type StyleMLGL = InstanceType<typeof StyleMLGL>;
export type LngLat = InstanceType<typeof LngLat>;
export type LngLatBounds = InstanceType<typeof LngLatBounds>;
export type MercatorCoordinate = InstanceType<typeof MercatorCoordinate>;
export type Evented = InstanceType<typeof Evented>;
export type AJAXError = InstanceType<typeof AJAXError>;
export type CanvasSourceMLGL = InstanceType<typeof CanvasSourceMLGL>;
export type GeoJSONSourceMLGL = InstanceType<typeof GeoJSONSourceMLGL>;
export type ImageSourceMLGL = InstanceType<typeof ImageSourceMLGL>;
export type RasterDEMTileSourceMLGL = InstanceType<
  typeof RasterDEMTileSourceMLGL
>;
export type RasterTileSourceMLGL = InstanceType<typeof RasterTileSourceMLGL>;
export type VectorTileSourceMLGL = InstanceType<typeof VectorTileSourceMLGL>;
export type VideoSourceMLGL = InstanceType<typeof VideoSourceMLGL>;
export type MapMLGL = InstanceType<typeof MapMLGL>;
// SDK specific
export {
  Map,
  GeolocationType,
  type MapOptions,
  type LoadWithTerrainEvent,
} from "./Map";
export { Marker } from "./Marker";
export { Popup } from "./Popup";
export { Style } from "./Style";
export { CanvasSource } from "./CanvasSource";
export { GeoJSONSource } from "./GeoJSONSource";
export { ImageSource } from "./ImageSource";
export { RasterTileSource } from "./RasterTileSource";
export { RasterDEMTileSource } from "./RasterDEMTileSource";
export { VectorTileSource } from "./VectorTileSource";
export { VideoSource } from "./VideoSource";
export { NavigationControl } from "./NavigationControl";
export { GeolocateControl } from "./GeolocateControl";
export { AttributionControl } from "./AttributionControl";
export { LogoControl } from "./LogoControl";
export { ScaleControl } from "./ScaleControl";
export { FullscreenControl } from "./FullscreenControl";
export { TerrainControl } from "./TerrainControl";
// Export of modified versions of the controls
export * from "./MaptilerGeolocateControl";
export * from "./MaptilerLogoControl";
export * from "./MaptilerTerrainControl";
export * from "./MaptilerNavigationControl";
export {
  type AutomaticStaticMapOptions,
  type BoundedStaticMapOptions,
  type BufferToPixelDataFunction,
  type ByIdGeocodingOptions,
  type CenteredStaticMapOptions,
  type CommonForwardAndReverseGeocodingOptions,
  type CoordinateExport,
  type CoordinateGrid,
  type CoordinateId,
  type CoordinateSearch,
  type CoordinateSearchResult,
  type CoordinateTransformResult,
  type CoordinateTransformation,
  type Coordinates,
  type CoordinatesSearchOptions,
  type CoordinatesTransformOptions,
  type DefaultTransformation,
  type ElevationAtOptions,
  type ElevationBatchOptions,
  type FeatureHierarchy,
  type FetchFunction,
  type GeocodingFeature,
  type GeocodingOptions,
  type GeocodingSearchResult,
  type GeolocationInfoOptions,
  type GeolocationResult,
  type GetDataOptions,
  LanguageGeocoding,
  type LanguageGeocodingOptions,
  type LanguageGeocodingString,
  MapStyle,
  type MapStylePreset,
  type MapStyleType,
  MapStyleVariant,
  type PixelData,
  ReferenceMapStyle,
  type ReverseGeocodingOptions,
  ServiceError,
  type StaticMapBaseOptions,
  type StaticMapMarker,
  type TileJSON,
  type XYZ,
  bufferToPixelDataBrowser,
  circumferenceAtLatitude,
  coordinates,
  data,
  elevation,
  expandMapStyle,
  geocoding,
  geolocation,
  getAutoLanguageGeocoding,
  getBufferToPixelDataParser,
  getTileCache,
  mapStylePresetList,
  math,
  misc,
  staticMaps,
  styleToStyle,
} from "@maptiler/client";

export * from "./Point";
export { config, SdkConfig } from "./config";
export * from "./language";
export { type Unit } from "./unit";
export * from "./Minimap";
export * from "./converters";
export * from "./colorramp";
export * from "./helpers";
