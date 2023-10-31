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
import { Map, GeolocationType } from "./Map";
import type { MapOptions, LoadWithTerrainEvent } from "./Map";

import { Marker } from "./Marker";
import { Popup } from "./Popup";
import { Style } from "./Style";
import { CanvasSource } from "./CanvasSource";
import { GeoJSONSource } from "./GeoJSONSource";
import { ImageSource } from "./ImageSource";
import { RasterTileSource } from "./RasterTileSource";
import { RasterDEMTileSource } from "./RasterDEMTileSource";
import { VectorTileSource } from "./VectorTileSource";
import { VideoSource } from "./VideoSource";
import { NavigationControl } from "./NavigationControl";
import { GeolocateControl } from "./GeolocateControl";
import { AttributionControl } from "./AttributionControl";
import { LogoControl } from "./LogoControl";
import { ScaleControl } from "./ScaleControl";
import { FullscreenControl } from "./FullscreenControl";
import { TerrainControl } from "./TerrainControl";

// Import of modified versions of the controls
import { MaptilerGeolocateControl } from "./MaptilerGeolocateControl";
import { MaptilerLogoControl } from "./MaptilerLogoControl";
import { MaptilerTerrainControl } from "./MaptilerTerrainControl";
import { MaptilerNavigationControl } from "./MaptilerNavigationControl";

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
import type { MinimapOptionsInput } from "./Minimap";

// Exporting types
export type {
  MapOptions,
  MinimapOptionsInput,
  LoadWithTerrainEvent,
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

// Export convert functions 'str2xml', 'xml2str', 'gpx', and 'kml'
export * from "./converters";

// Export the color ramp logic and all the built-in color ramps
export * from "./colorramp";

// Exporting classes, objects, functions, etc.
export {
  Map,
  Marker,
  Popup,
  Style,
  CanvasSource,
  GeoJSONSource,
  ImageSource,
  RasterTileSource,
  RasterDEMTileSource,
  VideoSource,
  NavigationControl,
  GeolocateControl,
  AttributionControl,
  LogoControl,
  ScaleControl,
  FullscreenControl,
  TerrainControl,
  VectorTileSource,
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
  MaptilerNavigationControl,
};

export * from "./helpers";
