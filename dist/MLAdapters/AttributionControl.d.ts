import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class AttributionControl extends maplibregl.AttributionControl {
    onAdd(map: SDKMap | MapMLGL): HTMLElement;
}
