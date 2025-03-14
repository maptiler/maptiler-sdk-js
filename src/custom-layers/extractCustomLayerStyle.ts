import { Map as MapSDK } from "../Map";
// import { CubemapLayerConstructorOptions } from "./CubemapLayer";
// import { RadialGradientLayerOptions } from "./RadialGradientLayer";
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

export type CustomLayerDefinitionType = CubemapLayerConstructorOptions | RadialGradientLayerOptions | null
;

export default function extractCustomLayerStyle(options: IExtractCustomLayerStyleOptions): CustomLayerDefinitionType {
  const { map, property } = options;

  const style = map.getStyle() as StyleSpecificationWithMetaData;

  if (!style.metadata?.maptiler) {
    console.warn(`No custom layer metadata found in the style for property ${property}. The property will use default values.`);
    return null;
  }

  // Because this data is from an external source
  // we ignore typescript and check anyway.
  if (style.metadata.maptiler[property]) {
    return style.metadata.maptiler[property];
  }

  return null;
}
