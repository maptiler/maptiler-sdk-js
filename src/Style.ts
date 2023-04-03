/**
 * This is an extension of MapLibre Style to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL, StyleOptions } from "maplibre-gl";
import { Map } from "./Map";

export class Style extends maplibregl.Style {
  constructor(map: Map, options: StyleOptions = {}) {
    super(map as MapMLGL, options);
  }
}
