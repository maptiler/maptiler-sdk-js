import maplibregl from "maplibre-gl";
import packagejson from "../package.json";
import { enableRTL } from "./tools";

// Types from MapLibre are not re-exported one by one
export type * from "maplibre-gl";

// Enabling the right-to-left text compatibility plugin early to avoid blinking
enableRTL();

/**
 * Get the version of MapTiler SDK
 */
export function getVersion(): string {
  return packagejson.version;
}

// Re-export classes and methods from MapLibre. Since it’s a CommonJS module,
// we can’t re-export them directly with `export { ... } from "maplibre-gl"`.
export const {
  // The following elements have MapTiler SDK equivalents to make
  // them fully compatible with the SDK Map class definition (see src/MLAdapters).
  // Still, for MapLibre compatibility reasons, we want to export them
  // with the suffic "MLGL".
  Map: MapMLGL,
  Marker: MarkerMLGL,
  Popup: PopupMLGL,
  Style: StyleMLGL,
  CanvasSource: CanvasSourceMLGL,
  GeoJSONSource: GeoJSONSourceMLGL,
  ImageSource: ImageSourceMLGL,
  RasterTileSource: RasterTileSourceMLGL,
  RasterDEMTileSource: RasterDEMTileSourceMLGL,
  VectorTileSource: VectorTileSourceMLGL,
  VideoSource: VideoSourceMLGL,
  NavigationControl: NavigationControlMLGL,
  GeolocateControl: GeolocateControlMLGL,
  AttributionControl: AttributionControlMLGL,
  LogoControl: LogoControlMLGL,
  ScaleControl: ScaleControlMLGL,
  FullscreenControl: FullscreenControlMLGL,
  TerrainControl: TerrainControlMLGL,
  BoxZoomHandler: BoxZoomHandlerMLGL,
  ScrollZoomHandler: ScrollZoomHandlerMLGL,
  CooperativeGesturesHandler: CooperativeGesturesHandlerMLGL,
  KeyboardHandler: KeyboardHandlerMLGL,
  TwoFingersTouchPitchHandler: TwoFingersTouchPitchHandlerMLGL,
  MapWheelEvent: MapWheelEventMLGL,
  MapTouchEvent: MapTouchEventMLGL,
  MapMouseEvent: MapMouseEventMLGL,
  config: configMLGL,
  getVersion: getMapLibreVersion,
  // The folowing items are exported from MapLibre as-is because they
  // are already compatible with MapTiler SDK.
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

// SDK specific
export {
  Map,
  GeolocationType,
  type MapOptions,
  type LoadWithTerrainEvent,
} from "./Map";
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

export { config, SdkConfig } from "./config";
export * from "./language";
export { type Unit } from "./unit";
export * from "./Minimap";
export * from "./converters";
export * from "./colorramp";
export * from "./helpers";
