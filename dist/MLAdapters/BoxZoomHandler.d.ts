import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class BoxZoomHandler extends maplibregl.BoxZoomHandler {
    constructor(map: SDKMap | MapMLGL, options: {
        clickTolerance: number;
    });
}
