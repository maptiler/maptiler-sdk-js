import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class ScrollZoomHandler extends maplibregl.ScrollZoomHandler {
    constructor(map: SDKMap | MapMLGL, triggerRenderFrame: () => void);
}
