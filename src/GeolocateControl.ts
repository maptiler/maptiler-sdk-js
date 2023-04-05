/**
 * This is an extension of MapLibre GeolocateControl to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import { Map } from "./Map";

export class GeolocateControl extends maplibregl.GeolocateControl {
  onAdd(map: Map | MapMLGL) {
    return super.onAdd(map as MapMLGL);
  }
}
