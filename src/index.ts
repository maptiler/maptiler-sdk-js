import maplibregl from "maplibre-gl";

// Types from MapLibre are not re-exported one by one
export type * from "maplibre-gl";

/**
 * Get the version of MapTiler SDK, this is declared in the vite config
 * to avoid importing the entire package.json
 */
export function getVersion(): string {
  return __MT_SDK_VERSION__;
}

const purpleCSS = "color: #3A1888; background: white; padding: 5px 0; font-weight: bold;";
const yellowCSS = "color: #FBC935; background: white; padding: 5px 0 5px 5px; font-weight: bold;";
const redCSS = "color: #F1175D; background: white; padding: 5px 0; font-weight: bold;";
const blackCSS = "color: #333; background: white; padding: 5px 0; font-weight: bold;";

console.info(`%c❖%c❖%c❖ %cMapTiler SDK JS v${getVersion()} %c❖%c❖%c❖`, yellowCSS, purpleCSS, redCSS, blackCSS, redCSS, purpleCSS, yellowCSS);

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
const NavigationControMLGL = maplibregl.NavigationControl;
const GeolocateControlMLGL = maplibregl.GeolocateControl;
const AttributionControlMLGL = maplibregl.AttributionControl;
const LogoControlMLGL = maplibregl.LogoControl;
const ScaleControlMLGL = maplibregl.ScaleControl;
const FullscreenControlMLGL = maplibregl.FullscreenControl;
const TerrainControMLGL = maplibregl.TerrainControl;
const BoxZoomHandlerMLGL = maplibregl.BoxZoomHandler;
const ScrollZoomHandlerMLGL = maplibregl.ScrollZoomHandler;
const CooperativeGesturesHandlerMLGL = maplibregl.CooperativeGesturesHandler;
const KeyboardHandlerMLGL = maplibregl.KeyboardHandler;
const TwoFingersTouchPitchHandlerMLGL = maplibregl.TwoFingersTouchPitchHandler;
const MapWheelEventMLGL = maplibregl.MapWheelEvent;
const MapTouchEventMLGL = maplibregl.MapTouchEvent;
const MapMouseEventMLGL = maplibregl.MapMouseEvent;
const configMLGL = maplibregl.config;
const getMapLibreVersion = maplibregl.getVersion;

const {
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  LngLat,
  LngLatBounds,
  MercatorCoordinate,
  Evented,
  AJAXError,
  prewarm,
  clearPrewarmedResources,
  Hash,
  Point,
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
} = maplibregl;

export {
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  LngLat,
  LngLatBounds,
  MercatorCoordinate,
  Evented,
  AJAXError,
  prewarm,
  clearPrewarmedResources,
  Hash,
  Point,
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
  // Below: Exported from MapLibre but as a different name
  // in case dev wants to use the non-overloaded versions
  getMapLibreVersion,
  MapMLGL,
  MarkerMLGL,
  PopupMLGL,
  StyleMLGL,
  CanvasSourceMLGL,
  GeoJSONSourceMLGL,
  ImageSourceMLGL,
  RasterTileSourceMLGL,
  RasterDEMTileSourceMLGL,
  VectorTileSourceMLGL,
  VideoSourceMLGL,
  NavigationControMLGL,
  GeolocateControlMLGL,
  AttributionControlMLGL,
  LogoControlMLGL,
  ScaleControlMLGL,
  FullscreenControlMLGL,
  TerrainControMLGL,
  BoxZoomHandlerMLGL,
  ScrollZoomHandlerMLGL,
  CooperativeGesturesHandlerMLGL,
  KeyboardHandlerMLGL,
  TwoFingersTouchPitchHandlerMLGL,
  MapWheelEventMLGL,
  MapTouchEventMLGL,
  MapMouseEventMLGL,
  configMLGL,
};

// Attaching the types to the
export type LngLat = InstanceType<typeof LngLat>;
export type LngLatBounds = InstanceType<typeof LngLatBounds>;
export type MercatorCoordinate = InstanceType<typeof MercatorCoordinate>;
export type Evented = InstanceType<typeof Evented>;
export type AJAXError = InstanceType<typeof AJAXError>;
export type Hash = InstanceType<typeof Hash>;
export type Point = InstanceType<typeof Point>;
export type EdgeInsets = InstanceType<typeof EdgeInsets>;
export type DragRotateHandler = InstanceType<typeof DragRotateHandler>;
export type DragPanHandler = InstanceType<typeof DragPanHandler>;
export type TwoFingersTouchZoomRotateHandler = InstanceType<typeof TwoFingersTouchZoomRotateHandler>;
export type DoubleClickZoomHandler = InstanceType<typeof DoubleClickZoomHandler>;
export type TwoFingersTouchZoomHandler = InstanceType<typeof TwoFingersTouchZoomHandler>;
export type TwoFingersTouchRotateHandler = InstanceType<typeof TwoFingersTouchRotateHandler>;

// The following items are only MapLibre adapted to MapTiler SDK Map class
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

// types changed to internal since MapLibre 5.7.0
export * from "./ml-types";

// SDK specific
export { Map, GeolocationType, type MapOptions, type LoadWithTerrainEvent } from "./Map";
export * from "./controls";
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
  type LanguageGeocodingOptions,
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
  getBufferToPixelDataParser,
  getTileCache,
  mapStylePresetList,
  math,
  misc,
  staticMaps,
  styleToStyle,
  type LanguageInfo,
  areSameLanguages,
  toLanguageInfo,
  isLanguageInfo,
  getAutoLanguage,
  getLanguageInfoFromFlag,
  getLanguageInfoFromCode,
  getLanguageInfoFromKey,
  canParsePixelData,
} from "@maptiler/client";
export * from "./ImageViewer";
export { getWebGLSupportError, displayWebGLContextLostWarning } from "./tools";
export { config, SdkConfig } from "./config";
export * from "./language";
export type { Unit } from "./types";
export * from "./converters";
export * as helpers from "./helpers";
export type * from "./helpers";
export * from "./custom-layers/index";
export { ColorRamp, ColorRampCollection } from "./ColorRamp";
export type { RgbaColor, ColorStop, ArrayColor, ArrayColorRampStop, ArrayColorRamp, ColorRampOptions } from "./ColorRamp";
export * from "./utils";
