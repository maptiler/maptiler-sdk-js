import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class TerrainControl extends maplibregl.TerrainControl {
    onAdd(map: SDKMap | MapMLGL): HTMLElement;
}
