/**
 * This is an extension of MapLibre BoxZoomHandler to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import { Map } from "../Map";

export class MapMouseEvent extends maplibregl.MapMouseEvent {
  constructor(type: string, map: Map | MapMLGL, originalEvent: MouseEvent, data: any = {}) {
    super(type, map as MapMLGL, originalEvent, data);
  }
}
