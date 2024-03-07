/**
 * This is an extension of MapLibre BoxZoomHandler to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import { Map } from "./Map";

export class KeyboardHandler extends maplibregl.KeyboardHandler {
  constructor(map: Map | MapMLGL) {
    super(map as MapMLGL);
  }
}
