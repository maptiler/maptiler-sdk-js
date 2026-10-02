import "./polyfills";
import * as maplibregl from "maplibre-gl";

// Types from MapLibre are not re-exported one by one
export type * from "maplibre-gl";

/**
 * Get the version of MapTiler SDK, this is declared in the vite config
 * to avoid importing the entire package.json
 */
export function getVersion(): string {
  return __MT_SDK_VERSION__;
}

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

// The SDK `Map` extends the MapLibre `Map`, so the MapLibre classes accept it as is
export {
  Marker,
  Popup,
  Style,
  CanvasSource,
  GeoJSONSource,
  ImageSource,
  RasterTileSource,
  RasterDEMTileSource,
  VectorTileSource,
  VideoSource,
  NavigationControl,
  GeolocateControl,
  AttributionControl,
  LogoControl,
  ScaleControl,
  FullscreenControl,
  TerrainControl,
  BoxZoomHandler,
  ScrollZoomHandler,
  CooperativeGesturesHandler,
  KeyboardHandler,
  TwoFingersTouchPitchHandler,
  MapWheelEvent,
  MapTouchEvent,
  MapMouseEvent,
} from "maplibre-gl";

// SDK specific
export { Map, GeolocationType, type AttributionControlOptions, type MapOptions, type LoadWithTerrainEvent, type MaptilerMapEventType, type MapEventTypeSDK } from "./Map";
export type {
  CameraPosition,
  TilePreloadOptions,
  WithTilePreload,
  PreloadTilesForBoundsOptions,
  PreloadTilesForCameraPositionsOptions,
  PreloadTilesOptions,
  TilePreloadErrorCallback,
  TilePreloadProgressCallback,
} from "./tile-preloading";

export {
  type BaseGeocodingOptions,
  type ByIdGeocodingOptions,
  type CommonForwardAndReverseGeocodingOptions,
  type GeocodingOptions,
  type LanguageGeocodingOptions,
  type ReverseGeocodingOptions,
  geocoding,
} from "./geocoding";

export * from "./controls";
export {
  type AutomaticStaticMapOptions,
  type BoundedStaticMapOptions,
  type BufferToPixelDataFunction,
  type CenteredStaticMapOptions,
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
  type GeocodingSearchResult,
  type GeolocationInfoOptions,
  type GeolocationResult,
  type GetDataOptions,
  MapStyle,
  type MapStylePreset,
  type MapStyleType,
  MapStyleVariant,
  type PixelData,
  ReferenceMapStyle,
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

export * from "./MaptilerAnimation";
export * from "./custom-layers/AnimatedRouteLayer";
