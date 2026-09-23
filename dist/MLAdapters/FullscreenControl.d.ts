import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class FullscreenControl extends maplibregl.FullscreenControl {
    onAdd(map: SDKMap | MapMLGL): HTMLElement;
}
