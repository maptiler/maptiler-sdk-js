/**
 * This is an extension of MapLibre BoxZoomHandler to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { GestureOptions, Map as MapMLGL } from "maplibre-gl";
import { Map } from "../Map";

export class CooperativeGesturesHandler extends maplibregl.CooperativeGesturesHandler {
  constructor(map: Map | MapMLGL, options: GestureOptions) {
    super(map as MapMLGL, options);
  }
}
