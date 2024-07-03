/**
 * This is an extension of MapLibre BoxZoomHandler to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import type { Map as SDKMap } from "../Map";

export class MapMouseEvent extends maplibregl.MapMouseEvent {
  constructor(type: string, map: SDKMap | MapMLGL, originalEvent: MouseEvent, data: any = {}) {
    super(type, map as MapMLGL, originalEvent, data);
  }
}
