/**
 * This is an extension of MapLibre BoxZoomHandler to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import { Map } from "./Map";

export class BoxZoomHandler extends maplibregl.BoxZoomHandler {
  constructor(
    map: Map | MapMLGL,
    options: {
      clickTolerance: number;
    },
  ) {
    super(map as MapMLGL, options);
  }
}
