import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class Popup extends maplibregl.Popup {
    addTo(map: SDKMap | MapMLGL): this;
}
