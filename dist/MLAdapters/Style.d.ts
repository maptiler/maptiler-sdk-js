import { default as maplibregl, StyleOptions } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class Style extends maplibregl.Style {
    constructor(map: SDKMap, options?: StyleOptions);
}
