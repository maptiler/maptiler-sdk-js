import { Map as MapSDK } from "../Map";
import { StyleSpecification } from "maplibre-gl";
import type { CubemapLayerConstructorOptions, RadialGradientLayerOptions } from "custom-layers";

export type StyleSpecificationWithMetaData = StyleSpecification & {
  metadata?: {
    "maptiler:copyright": string;
    maptiler?: {
      halo: RadialGradientLayerOptions;
      space: CubemapLayerConstructorOptions;
    };
  };
};

export interface IExtractCustomLayerStyleOptions {
  map: MapSDK;
  property: "halo" | "space";
}

export default function extractCustomLayerStyle<T extends CubemapLayerConstructorOptions | RadialGradientLayerOptions | null>(options: IExtractCustomLayerStyleOptions): T | null {
  const { map, property } = options;

  const style = map.getStyle() as StyleSpecificationWithMetaData;

  if (!style.metadata?.maptiler) {
    console.warn(`No custom layer metadata found in the style for property ${property}. The property will use default values.`);
    return null;
  }

  // Because this data is from an external source
  // we ignore typescript and check anyway.
  if (style.metadata.maptiler[property]) {
    return style.metadata.maptiler[property] as T;
  }

  return null;
}
