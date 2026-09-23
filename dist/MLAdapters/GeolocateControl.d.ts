import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class GeolocateControl extends maplibregl.GeolocateControl {
    onAdd(map: SDKMap | MapMLGL): HTMLElement;
}
