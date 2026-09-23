import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class VectorTileSource extends maplibregl.VectorTileSource {
    onAdd(map: SDKMap | MapMLGL): void;
}
