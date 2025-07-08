import { Map as MapSDK } from "../Map";
import type { StyleSpecification } from "maplibre-gl";
import type { CubemapLayerConstructorOptions, RadialGradientLayerConstructorOptions } from "../custom-layers";

export type StyleSpecificationWithMetaData = StyleSpecification & {
  metadata?: {
    "maptiler:copyright": string;
    maptiler?: {
      halo: RadialGradientLayerConstructorOptions;
      space: CubemapLayerConstructorOptions;
    };
  };
};

export interface IExtractCustomLayerStyleOptions {
  map: MapSDK;
  property: "halo" | "space";
}

export default function extractCustomLayerStyle<T extends CubemapLayerConstructorOptions | RadialGradientLayerConstructorOptions | null>(
  options: IExtractCustomLayerStyleOptions,
): T | null {
  const { map, property } = options;

  const style = map.getStyle() as StyleSpecificationWithMetaData;

  if (!style) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[extractCustomLayerStyle]: `Map.getStyle()` is returning undefined, are you initiating before style is ready?");
    }
    return null;
  }

  if (!style.metadata?.maptiler) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[extractCustomLayerStyle]: Attempting to find styling for "${property}" in metadata. No MapTiler metadata found in the style.`);
    }
    return null;
  }

  // Because this data is from an external source
  // we ignore typescript and check anyway.
  if (style.metadata.maptiler[property]) {
    return style.metadata.maptiler[property] as T;
  }

  return null;
}
