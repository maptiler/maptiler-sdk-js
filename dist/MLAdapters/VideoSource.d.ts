import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class VideoSource extends maplibregl.VideoSource {
    onAdd(map: SDKMap | MapMLGL): void;
}
