import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class CanvasSource extends maplibregl.CanvasSource {
    onAdd(map: SDKMap | MapMLGL): void;
}
