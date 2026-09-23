import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class RasterTileSource extends maplibregl.RasterTileSource {
    onAdd(map: SDKMap | MapMLGL): void;
}
