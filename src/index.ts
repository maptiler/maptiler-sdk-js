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
  supported,
  setRTLTextPlugin,
  getRTLTextPluginStatus,
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
  MercatorCoordinate,
  Evented,
  AJAXError,
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
  // getPerformanceMetrics,
  // config,
  // Point,
} = maplibregl;

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

import { Map, GeolocationType } from "./Map";
import type { MapOptions } from "./Map";

// importing client functions to expose them as part of the SDK
import type {
  BBox,
  Position,
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
  ReferenceMapStyle,
  MapStyle,
  MapStyleVariant,
} from "@maptiler/client";

import type { MapStyleType } from "@maptiler/client";

import { Point } from "./Point";
import type { Matrix2 } from "./Point";

// Importing enums and configs
import { config, SdkConfig } from "./config";
import { Language, LanguageString, LanguageKey } from "./language";
import type { Unit } from "./unit";

// Exporting types
export type {
  MapOptions,
  GeocodingOptions,
  BBox,
  Position,
  CoordinatesSearchOptions,
  CenteredStaticMapOptions,
  BoundedStaticMapOptions,
  AutomaticStaticMapOptions,
  LanguageString,
  LanguageKey,
  LanguageGeocodingString,
  Unit,
  MapStyleType,
  Matrix2,
};

// Exporting classes, objects, functions, etc.
export {
  Map,
  GeolocationType,
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
