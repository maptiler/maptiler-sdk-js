/**
 * This is an extension of MapLibre BoxZoomHandler to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import type { Map as SDKMap } from "../Map";

export class TwoFingersTouchPitchHandler extends maplibregl.TwoFingersTouchPitchHandler {
  constructor(map: SDKMap | MapMLGL) {
    super(map as MapMLGL);
  }
}
