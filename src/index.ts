// Exporting Maplibre as is
export * from "maplibre-gl";

import type { bboxType, lngLatType } from "./generalTypes";

import Map from "./Map";
import type { MapOptions } from "./Map";

// Importing services
import geocoder from "./services/geocoder";
import type { geocoderOptionsType } from "./services/geocoder";
import geolocation from "./services/geolocation";
import coordinates from "./services/coordinates";
import type { coordinatesSearchOptionsType } from "./services/coordinates";
import data from "./services/data";
import staticMaps from "./services/staticMaps";
import type {
  centeredStaticMapOptionsType,
  automaticStaticMapOptionsType,
  boundedStaticMapOptionsType,
} from "./services/staticMaps";

import ServiceError from "./services/ServiceError";

import { config } from "./config";
import languages from "./languages";
import units from "./units";

// Exporting types
export type {
  lngLatType,
  MapOptions,
  geocoderOptionsType,
  bboxType,
  coordinatesSearchOptionsType,
  centeredStaticMapOptionsType,
  boundedStaticMapOptionsType,
  automaticStaticMapOptionsType,
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
