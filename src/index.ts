// Exporting Maplibre as is
export * from 'maplibre-gl'

import type { bboxType, lngLatType } from './generalTypes';

import Map from './Map';
import type { MapOptions } from './Map'

import geocoder from './services/geocoder'
import type { geocoderOptionsType } from './services/geocoder'

import ServiceError from './services/ServiceError';

import { config } from './config';

// Exporting types
export type {
  lngLatType,
  MapOptions,
  geocoderOptionsType,
  bboxType
};

// Exporting classes, objects, functions, etc.
export {
  Map,
  config,
  geocoder,
  ServiceError,
};