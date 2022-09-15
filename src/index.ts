// Exporting Maplibre as is
export * from 'maplibre-gl'

// Custom extension is adding some methods to the original LngLat
import LngLat from './LngLat';
import Map from './Map';

import { config } from './config';


// Exporting custom LngLat, will supersede the one from Maplibre (because exported after)
export {
  Map,
  LngLat,
  config,
};