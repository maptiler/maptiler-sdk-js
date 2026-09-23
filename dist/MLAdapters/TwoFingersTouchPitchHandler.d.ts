import { default as maplibregl, Map as MapMLGL } from 'maplibre-gl';
import { Map as SDKMap } from '../Map';
export declare class TwoFingersTouchPitchHandler extends maplibregl.TwoFingersTouchPitchHandler {
    constructor(map: SDKMap | MapMLGL);
}
