/**
 * Maplibre export
 */
export * from "maplibre-gl";

import type { Bbox, LngLat } from "./generalTypes";

import { Map } from "./Map";
import type { MapOptions } from "./Map";

// Importing services
import { geocoding } from "./services/geocoding";
import type { GeocodingOptions } from "./services/geocoding";
import { geolocation } from "./services/geolocation";
import { coordinates } from "./services/coordinates";
import type { CoordinatesSearchOptions } from "./services/coordinates";
import { data } from "./services/data";
import { staticMaps } from "./services/staticMaps";
import type {
  CenteredStaticMapOptions,
  AutomaticStaticMapOptions,
  BoundedStaticMapOptions,
} from "./services/staticMaps";

import { ServiceError } from "./services/ServiceError";

import { config } from "./config";
import { Language } from "./language";
import { Unit } from "./unit";
import { Style } from "./style"

// Exporting types
export type {
  LngLat,
  MapOptions,
  GeocodingOptions,
  Bbox,
  CoordinatesSearchOptions,
  CenteredStaticMapOptions,
  BoundedStaticMapOptions,
  AutomaticStaticMapOptions,
};

// Exporting classes, objects, functions, etc.
export {
  Map,
  config,
  ServiceError,
  geocoding,
  geolocation,
  coordinates,
  data,
  staticMaps,
  Language,
  Unit,
  Style,
};
