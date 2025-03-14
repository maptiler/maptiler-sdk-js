/**
 * This is an extension of MapLibre ScaleControl to make it fully type compatible with the SDK
 * @deprecated Use MaptilerScaleControl instead
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import type { Map as SDKMap } from "../Map";

/**
 * @deprecated Please use MaptilerScaleControl from '@maptiler/sdk' instead.
 */
export class ScaleControl extends maplibregl.ScaleControl {
  onAdd(map: SDKMap | MapMLGL) {
    return super.onAdd(map as MapMLGL);
  }
}
