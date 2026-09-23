import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class GeoJSONSource extends maplibregl.GeoJSONSource {
    onAdd(map: SDKMap | MapMLGL): void;
}
