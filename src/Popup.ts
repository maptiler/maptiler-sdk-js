/**
 * This is an extension of MapLibre Popup to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import { Map } from "./Map";

export class Popup extends maplibregl.Popup {
  addTo(map: Map | MapMLGL): this {
    return super.addTo(map as MapMLGL);
  }
}
