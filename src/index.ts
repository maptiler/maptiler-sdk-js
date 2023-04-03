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

// We still want to export maplibregl.Map, but as a different name
const MapMLGL = maplibregl.Map;

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
  MapMLGL,
  // isSafari,
  // getPerformanceMetrics
};

// Exporting types of class instances from MapLibre:
export type NavigationControl = InstanceType<typeof NavigationControl>;
export type GeolocateControl = InstanceType<typeof GeolocateControl>;
export type AttributionControl = InstanceType<typeof AttributionControl>;
export type LogoControl = InstanceType<typeof LogoControl>;
export type ScaleControl = InstanceType<typeof ScaleControl>;
export type FullscreenControl = InstanceType<typeof FullscreenControl>;
export type TerrainControl = InstanceType<typeof TerrainControl>;
export type Popup = InstanceType<typeof Popup>;
export type Marker = InstanceType<typeof Marker>;
export type Style = InstanceType<typeof Style>;
export type LngLat = InstanceType<typeof LngLat>;
export type LngLatBounds = InstanceType<typeof LngLatBounds>;
export type MercatorCoordinate = InstanceType<typeof MercatorCoordinate>;
export type Evented = InstanceType<typeof Evented>;
export type AJAXError = InstanceType<typeof AJAXError>;
export type CanvasSource = InstanceType<typeof CanvasSource>;
export type GeoJSONSource = InstanceType<typeof GeoJSONSource>;
export type ImageSource = InstanceType<typeof ImageSource>;
export type RasterDEMTileSource = InstanceType<typeof RasterDEMTileSource>;
export type RasterTileSource = InstanceType<typeof RasterTileSource>;
export type VectorTileSource = InstanceType<typeof VectorTileSource>;
export type VideoSource = InstanceType<typeof VideoSource>;
export type MapMLGL = InstanceType<typeof MapMLGL>;

// SDK specific
import { Map, GeolocationType } from "./Map";
import type { MapOptions } from "./Map";

import { MaptilerGeolocateControl } from "./MaptilerGeolocateControl";
import { MaptilerLogoControl } from "./MaptilerLogoControl";
import { MaptilerTerrainControl } from "./MaptilerTerrainControl";

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
  MaptilerGeolocateControl,
  MaptilerLogoControl,
  MaptilerTerrainControl,
};
