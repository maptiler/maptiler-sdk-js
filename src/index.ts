import packagejson from "../package.json";
import maplibregl from "maplibre-gl";

// Exporting types from MapLibre
export {
  type IControl,
  type CustomLayerInterface,
  type PaddingOptions,
  type LngLatLike,
  type PointLike,
  type LngLatBoundsLike,
  type Source,
  type MapTerrainEvent,
  type MapStyleImageMissingEvent,
  type MapStyleDataEvent,
  type MapSourceDataEvent,
  type MapLibreZoomEvent,
  type MapLibreEvent,
  type MapLayerTouchEvent,
  type MapLayerMouseEvent,
  type MapLayerEventType,
  type MapEventType,
  type MapDataEvent,
  type MapContextEvent,
} from "maplibre-gl";

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
  addProtocol,
  removeProtocol,
  Hash,
  Point,
  config,
  EdgeInsets,
  DragRotateHandler,
  DragPanHandler,
  TwoFingersTouchZoomRotateHandler,
  DoubleClickZoomHandler,
  TwoFingersTouchZoomHandler,
  TwoFingersTouchRotateHandler,
  getWorkerCount,
  setWorkerCount,
  getMaxParallelImageRequests,
  setMaxParallelImageRequests,
  getWorkerUrl,
  setWorkerUrl,
  addSourceType,
  importScriptInWorkers,
} = maplibregl;

/**
 * Get the version of MapTiler SDK
 */
function getVersion(): string {
  return packagejson.version;
}

/**
 * Get the version of MapLibre GL JS
 */
function getMapLibreVersion(): string {
  return maplibregl.getVersion();
}

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
const BoxZoomHandlerMLGL = maplibregl.BoxZoomHandler;
const ScrollZoomHandlerMLGL = maplibregl.ScrollZoomHandler;
const CooperativeGesturesHandlerMLGL = maplibregl.CooperativeGesturesHandler;
const KeyboardHandlerMLGL = maplibregl.KeyboardHandler;
const TwoFingersTouchPitchHandlerMLGL = maplibregl.TwoFingersTouchPitchHandler;
const MapWheelEventMLGL = maplibregl.MapWheelEvent;
const MapTouchEventMLGL = maplibregl.MapTouchEvent;
const MapMouseEventMLGL = maplibregl.MapMouseEvent;

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
  Hash,
  Point,
  config as configMLGL,
  EdgeInsets,
  DragRotateHandler,
  DragPanHandler,
  TwoFingersTouchZoomRotateHandler,
  DoubleClickZoomHandler,
  TwoFingersTouchZoomHandler,
  TwoFingersTouchRotateHandler,
  getWorkerCount,
  setWorkerCount,
  getMaxParallelImageRequests,
  setMaxParallelImageRequests,
  getWorkerUrl,
  setWorkerUrl,
  addSourceType,
  importScriptInWorkers,
  addProtocol,
  removeProtocol,
  MapMLGL,
  BoxZoomHandlerMLGL,
  ScrollZoomHandlerMLGL,
  CooperativeGesturesHandlerMLGL,
  KeyboardHandlerMLGL,
  TwoFingersTouchPitchHandlerMLGL,
  MapWheelEventMLGL,
  MapTouchEventMLGL,
  MapMouseEventMLGL,
  getVersion,
  getMapLibreVersion,
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
export type BoxZoomHandlerMLGL = InstanceType<typeof BoxZoomHandlerMLGL>;
export type ScrollZoomHandlerMLGL = InstanceType<typeof ScrollZoomHandlerMLGL>;
export type CooperativeGesturesHandlerMLGL = InstanceType<
  typeof CooperativeGesturesHandlerMLGL
>;
export type KeyboardHandlerMLGL = InstanceType<typeof KeyboardHandlerMLGL>;
export type TwoFingersTouchPitchHandlerMLGL = InstanceType<
  typeof TwoFingersTouchPitchHandlerMLGL
>;
export type MapWheelEventMLGL = InstanceType<typeof MapWheelEventMLGL>;
export type MapTouchEventMLGL = InstanceType<typeof MapTouchEventMLGL>;
export type MapMouseEventMLGL = InstanceType<typeof MapMouseEventMLGL>;
// SDK specific
export {
  Map,
  GeolocationType,
  type MapOptions,
  type LoadWithTerrainEvent,
} from "./Map";
export { Marker } from "./MLAdapters/Marker";
export { Popup } from "./MLAdapters/Popup";
export { Style } from "./MLAdapters/Style";
export { CanvasSource } from "./MLAdapters/CanvasSource";
export { GeoJSONSource } from "./MLAdapters/GeoJSONSource";
export { ImageSource } from "./MLAdapters/ImageSource";
export { RasterTileSource } from "./MLAdapters/RasterTileSource";
export { RasterDEMTileSource } from "./MLAdapters/RasterDEMTileSource";
export { VectorTileSource } from "./MLAdapters/VectorTileSource";
export { VideoSource } from "./MLAdapters/VideoSource";
export { NavigationControl } from "./MLAdapters/NavigationControl";
export { GeolocateControl } from "./MLAdapters/GeolocateControl";
export { AttributionControl } from "./MLAdapters/AttributionControl";
export { LogoControl } from "./MLAdapters/LogoControl";
export { ScaleControl } from "./MLAdapters/ScaleControl";
export { FullscreenControl } from "./MLAdapters/FullscreenControl";
export { TerrainControl } from "./MLAdapters/TerrainControl";
export { BoxZoomHandler } from "./MLAdapters/BoxZoomHandler";
export { ScrollZoomHandler } from "./MLAdapters/ScrollZoomHandler";
export { CooperativeGesturesHandler } from "./MLAdapters/CooperativeGesturesHandler";
export { KeyboardHandler } from "./MLAdapters/KeyboardHandler";
export { TwoFingersTouchPitchHandler } from "./MLAdapters/TwoFingersTouchPitchHandler";
export { MapWheelEvent } from "./MLAdapters/MapWheelEvent";
export { MapTouchEvent } from "./MLAdapters/MapTouchEvent";
export { MapMouseEvent } from "./MLAdapters/MapMouseEvent";
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

// export * from "./Point";
export { config, SdkConfig } from "./config";
export * from "./language";
export { type Unit } from "./unit";
export * from "./Minimap";
export * from "./converters";
export * from "./colorramp";
export * from "./helpers";
