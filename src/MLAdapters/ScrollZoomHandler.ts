/**
 * This is an extension of MapLibre BoxZoomHandler to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import type { Map as SDKMap } from "../Map";

export class ScrollZoomHandler extends maplibregl.ScrollZoomHandler {
  constructor(map: SDKMap | MapMLGL, triggerRenderFrame: () => void) {
    super(map as MapMLGL, triggerRenderFrame);
  }
}
