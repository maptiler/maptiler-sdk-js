import "./polyfills";

// Types from MapLibre are not re-exported one by one
export type * from "maplibre-gl";

/**
 * Get the version of MapTiler SDK, this is declared in the vite config
 * to avoid importing the entire package.json
 */
export function getVersion(): string {
  return __MT_SDK_VERSION__;
}

export {
  // Deprecated by MapLibre, still re-exported for anyone who needs a custom RTL text plugin
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  setRTLTextPlugin,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  getRTLTextPluginStatus,
  LngLat,
  LngLatBounds,
  MercatorCoordinate,
  Evented,
  AJAXError,
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
} from "maplibre-gl";

// Exported from MapLibre but as a different name
// in case dev wants to use the non-overloaded versions
export {
  getVersion as getMapLibreVersion,
  Map as MapMLGL,
  Marker as MarkerMLGL,
  Popup as PopupMLGL,
  Style as StyleMLGL,
  CanvasSource as CanvasSourceMLGL,
  GeoJSONSource as GeoJSONSourceMLGL,
  ImageSource as ImageSourceMLGL,
  RasterTileSource as RasterTileSourceMLGL,
  RasterDEMTileSource as RasterDEMTileSourceMLGL,
  VectorTileSource as VectorTileSourceMLGL,
  VideoSource as VideoSourceMLGL,
  NavigationControl as NavigationControMLGL,
  GeolocateControl as GeolocateControlMLGL,
  AttributionControl as AttributionControlMLGL,
  LogoControl as LogoControlMLGL,
  ScaleControl as ScaleControlMLGL,
  FullscreenControl as FullscreenControlMLGL,
  TerrainControl as TerrainControMLGL,
  BoxZoomHandler as BoxZoomHandlerMLGL,
  ScrollZoomHandler as ScrollZoomHandlerMLGL,
  CooperativeGesturesHandler as CooperativeGesturesHandlerMLGL,
  KeyboardHandler as KeyboardHandlerMLGL,
  TwoFingersTouchPitchHandler as TwoFingersTouchPitchHandlerMLGL,
  MapWheelEvent as MapWheelEventMLGL,
  MapTouchEvent as MapTouchEventMLGL,
  MapMouseEvent as MapMouseEventMLGL,
  config as configMLGL,
} from "maplibre-gl";

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
export { prewarm } from "./utils/defaultWorkerUrl";
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
