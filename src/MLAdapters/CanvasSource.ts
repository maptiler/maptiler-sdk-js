/**
 * This is an extension of MapLibre CanvasSource to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import type { Map as SDKMap } from "../Map";

export class CanvasSource extends maplibregl.CanvasSource {
  onAdd(map: SDKMap | MapMLGL) {
    super.onAdd(map as MapMLGL);
  }
}
