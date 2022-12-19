/**
 * Maplibre export first, then extensions can overload the exports.
 */
export * from "maplibre-gl";

/**
 * To perform explicit named export so that they are included in the UMD bundle
 */
import * as ML from "maplibre-gl";

const supported = ML.default.supported;
const setRTLTextPlugin = ML.default.setRTLTextPlugin;
const getRTLTextPluginStatus = ML.default.getRTLTextPluginStatus;
// const Map = ML.default.Map; // replaced by MapTiler's Map class
const NavigationControl = ML.default.NavigationControl;
const GeolocateControl = ML.default.GeolocateControl;
const AttributionControl = ML.default.AttributionControl;
const LogoControl = ML.default.LogoControl;
const ScaleControl = ML.default.ScaleControl;
const FullscreenControl = ML.default.FullscreenControl;
const TerrainControl = ML.default.TerrainControl;
const Popup = ML.default.Popup;
const Marker = ML.default.Marker;
const Style = ML.default.Style;
const LngLat = ML.default.LngLat;
const LngLatBounds = ML.default.LngLatBounds;
// const Point = ML.default.Point; // replaced by actual ES module in ./Point.ts
const MercatorCoordinate = ML.default.MercatorCoordinate;
const Evented = ML.default.Evented;
const AJAXError = ML.default.AJAXError;
// const config = ML.default.config; // replaced by MapTiler's config
const CanvasSource = ML.default.CanvasSource;
const GeoJSONSource = ML.default.GeoJSONSource;
const ImageSource = ML.default.ImageSource;
const RasterDEMTileSource = ML.default.RasterDEMTileSource;
const RasterTileSource = ML.default.RasterTileSource;
const VectorTileSource = ML.default.VectorTileSource;
const VideoSource = ML.default.VideoSource;
const prewarm = ML.default.prewarm;
const clearPrewarmedResources = ML.default.clearPrewarmedResources;
const version = ML.default.version;
const workerCount = ML.default.workerCount;
const maxParallelImageRequests = ML.default.maxParallelImageRequests;
const clearStorage = ML.default.clearStorage;
const workerUrl = ML.default.workerUrl;
const addProtocol = ML.default.addProtocol;
const removeProtocol = ML.default.removeProtocol;
// const isSafari = ML.default.isSafari;
// const getPerformanceMetrics = ML.default.getPerformanceMetrics;

export {
  supported,
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  // Map,
  NavigationControl,
  GeolocateControl,
  AttributionControl,
  LogoControl,
  ScaleControl,
  FullscreenControl,
  TerrainControl,
  Popup,
  Marker,
  Style,
  LngLat,
  LngLatBounds,
  // Point,
  MercatorCoordinate,
  Evented,
  AJAXError,
  // config,
  CanvasSource,
  GeoJSONSource,
  ImageSource,
  RasterDEMTileSource,
  RasterTileSource,
  VectorTileSource,
  VideoSource,
  prewarm,
  clearPrewarmedResources,
  version,
  workerCount,
  maxParallelImageRequests,
  clearStorage,
  workerUrl,
  addProtocol,
  removeProtocol,
  // isSafari,
  // getPerformanceMetrics
};

import { Map } from "./Map";
import type { MapOptions } from "./Map";

// importing client functions to expose them as part of the SDK
import type {
  Bbox,
  // LngLat,
  LngLatArray,
  GeocodingOptions,
  CoordinatesSearchOptions,
  CenteredStaticMapOptions,
  AutomaticStaticMapOptions,
  BoundedStaticMapOptions,
} from "@maptiler/client";

import {
  geocoding,
  geolocation,
  coordinates,
  data,
  staticMaps,
  ServiceError,
  LanguageGeocoding,
  LanguageGeocodingString,
} from "@maptiler/client";

import { Point } from "./Point";

// Importing enums and configs
import { config, SdkConfig } from "./config";
import { Language, LanguageString } from "./language";
import type { Unit } from "./unit";
import {
  MapStyle,
  ReferenceMapStyle,
  MapStyleVariant,
} from "./mapstyle/mapstyle";

import type { MapStyleType } from "./mapstyle/mapstyle";

// Exporting types
export type {
  // LngLat,
  LngLatArray,
  MapOptions,
  GeocodingOptions,
  Bbox,
  CoordinatesSearchOptions,
  CenteredStaticMapOptions,
  BoundedStaticMapOptions,
  AutomaticStaticMapOptions,
  LanguageString,
  LanguageGeocodingString,
  Unit,
  MapStyleType,
};

// Exporting classes, objects, functions, etc.
export {
  Map,
  SdkConfig,
  config,
  ServiceError,
  geocoding,
  geolocation,
  coordinates,
  data,
  staticMaps,
  MapStyle,
  Language,
  LanguageGeocoding,
  Point,
  ReferenceMapStyle,
  MapStyleVariant,
};
