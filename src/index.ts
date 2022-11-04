/**
 * Maplibre export
 */
export * from "maplibre-gl";


import type { Bbox, LngLat } from "./generalTypes";

import { Map } from "./Map";
import type { MapOptions } from "./Map";

// Importing services
import { geocoder } from "./services/geocoder";
import type { GeocoderOptions } from "./services/geocoder";
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
import { languages } from "./languages";
import { units } from "./units";

// Exporting types
export type {
  LngLat,
  MapOptions,
  GeocoderOptions,
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
  geocoder,
  geolocation,
  coordinates,
  data,
  staticMaps,
  languages,
  units,
};
