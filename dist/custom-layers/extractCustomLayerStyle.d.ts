import { Map as MapSDK } from '../Map';
import { StyleSpecification } from 'maplibre-gl';
import { CubemapLayerConstructorOptions, RadialGradientLayerConstructorOptions } from '../custom-layers';
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
export default function extractCustomLayerStyle<T extends CubemapLayerConstructorOptions | RadialGradientLayerConstructorOptions | null>(options: IExtractCustomLayerStyleOptions): T | null;
