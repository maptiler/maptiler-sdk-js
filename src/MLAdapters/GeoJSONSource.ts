/**
 * This is an extension of MapLibre GeoJSONSource to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import type { Map as SDKMap } from "../Map";

export class GeoJSONSource extends maplibregl.GeoJSONSource {
  onAdd(map: SDKMap | MapMLGL) {
    super.onAdd(map as MapMLGL);
  }
}
