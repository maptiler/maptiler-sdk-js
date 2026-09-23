import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class RasterDEMTileSource extends maplibregl.RasterDEMTileSource {
    onAdd(map: SDKMap | MapMLGL): void;
}
