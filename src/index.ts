// Exporting Maplibre as is
export * from 'maplibre-gl'

import type { bboxType, lngLatType } from './generalTypes';

import Map from './Map';
import type { MapOptions } from './Map'

// Importing services
import geocoder from './services/geocoder'
import type { geocoderOptionsType } from './services/geocoder'
import geolocation from './services/geolocation'
import coordinates from './services/coordinates'
import type { coordinatesSearchOptionsType } from './services/coordinates'
import data from './services/data'

import ServiceError from './services/ServiceError';

import { config } from './config';

// Exporting types
export type {
  lngLatType,
  MapOptions,
  geocoderOptionsType,
  bboxType,
  coordinatesSearchOptionsType,
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
};
