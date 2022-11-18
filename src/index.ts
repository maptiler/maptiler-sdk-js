/**
 * Maplibre export first, then extensions can overload the exports.
 */
export * from "maplibre-gl";

import { Map } from "./Map";
import type { MapOptions } from "./Map";

// importing client functions to expose them as part of the SDK
import type {
  Bbox,
  LngLat,
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
  Language as LanguageGeocoding,
  LanguageString as LanguageStringGeocoding,
} from "@maptiler/client";

// Importing enums and configs
import { config, SdkConfig } from "./config";
import { Language, LanguageString } from "./language";
import { Unit } from "./unit";
import { Style, StyleString } from "./style";

// Exporting types
export type {
  LngLat,
  LngLatArray,
  MapOptions,
  GeocodingOptions,
  Bbox,
  CoordinatesSearchOptions,
  CenteredStaticMapOptions,
  BoundedStaticMapOptions,
  AutomaticStaticMapOptions,
  LanguageString,
  LanguageStringGeocoding,
  StyleString,
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
  Unit,
  Style,
  Language,
  LanguageGeocoding,
};
