/**
 * This is an extension of MapLibre Popup to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import type { Map as SDKMap } from "../Map";

export class Popup extends maplibregl.Popup {
  addTo(map: SDKMap | MapMLGL): this {
    return super.addTo(map as MapMLGL);
  }
}
