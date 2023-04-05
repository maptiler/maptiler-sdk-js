/**
 * This is an extension of MapLibre Marker to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import { Map } from "./Map";

export class Marker extends maplibregl.Marker {
  addTo(map: Map | MapMLGL): this {
    return super.addTo(map as MapMLGL);
  }
}
