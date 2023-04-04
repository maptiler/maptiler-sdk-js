/**
 * This is an extension of MapLibre TerrainControl to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import { Map } from "./Map";

export class TerrainControl extends maplibregl.TerrainControl {
  onAdd(map: Map | MapMLGL) {
    return super.onAdd(map as MapMLGL);
  }
}
