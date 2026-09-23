import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class NavigationControl extends maplibregl.NavigationControl {
    onAdd(map: SDKMap | MapMLGL): HTMLElement;
}
