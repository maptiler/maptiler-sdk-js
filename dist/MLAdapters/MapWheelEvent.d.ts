import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class MapWheelEvent extends maplibregl.MapWheelEvent {
    constructor(type: string, map: SDKMap | MapMLGL, originalEvent: WheelEvent);
}
