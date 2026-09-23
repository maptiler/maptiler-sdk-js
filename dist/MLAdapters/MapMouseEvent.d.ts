import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class MapMouseEvent extends maplibregl.MapMouseEvent {
    constructor(type: string, map: SDKMap | MapMLGL, originalEvent: MouseEvent, data?: Record<string, unknown>);
}
