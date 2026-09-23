import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class LogoControl extends maplibregl.LogoControl {
    onAdd(map: SDKMap | MapMLGL): HTMLElement;
}
