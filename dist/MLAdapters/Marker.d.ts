import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class Marker extends maplibregl.Marker {
    addTo(map: SDKMap | MapMLGL): this;
}
