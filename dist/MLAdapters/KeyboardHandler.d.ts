import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class KeyboardHandler extends maplibregl.KeyboardHandler {
    constructor(map: SDKMap | MapMLGL);
}
