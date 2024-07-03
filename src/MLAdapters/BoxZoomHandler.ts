/**
 * This is an extension of MapLibre BoxZoomHandler to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import type { Map as SDKMap } from "../Map";

export class BoxZoomHandler extends maplibregl.BoxZoomHandler {
  constructor(
    map: SDKMap | MapMLGL,
    options: {
      clickTolerance: number;
    },
  ) {
    super(map as MapMLGL, options);
  }
}
