import maplibregl from "maplibre-gl";
import type { Map as MapMLGL } from "maplibre-gl";
import type { Map as SDKMap } from "../Map";

export * from "./types";

export class Marker extends maplibregl.Marker {
  addTo(map: SDKMap | MapMLGL): this {
    return super.addTo(map as MapMLGL);
  }
}
