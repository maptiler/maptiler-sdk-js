/**
 * This is an extension of MapLibre AttributionControl to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import type { Map as SDKMap } from "../Map";

export class AttributionControl extends maplibregl.AttributionControl {
  onAdd(map: SDKMap | MapMLGL) {
    return super.onAdd(map as MapMLGL);
  }
}
