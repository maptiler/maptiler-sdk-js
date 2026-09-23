import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class ScaleControl extends maplibregl.ScaleControl {
    onAdd(map: SDKMap | MapMLGL): HTMLElement;
}
