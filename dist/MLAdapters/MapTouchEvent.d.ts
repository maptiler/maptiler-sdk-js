import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class MapTouchEvent extends maplibregl.MapTouchEvent {
    constructor(type: string, map: SDKMap | MapMLGL, originalEvent: TouchEvent);
}
