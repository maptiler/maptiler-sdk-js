import { default as maplibregl, GestureOptions, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class CooperativeGesturesHandler extends maplibregl.CooperativeGesturesHandler {
    constructor(map: SDKMap | MapMLGL, options: GestureOptions);
}
