import { LogoControlOptions as LogoControlOptionsML } from 'maplibre-gl';
import { LogoControl } from '../MLAdapters/LogoControl';
import { Map as SDKMap } from '../Map';
type LogoControlOptions = LogoControlOptionsML & {
    logoURL?: string;
    linkURL?: string;
};
/**
 * This LogoControl extends the MapLibre LogoControl but instead can use any image URL and
 * any link URL. By default this is using MapTiler logo and URL.
 */
export declare class MaptilerLogoControl extends LogoControl {
    _compact: boolean;
    private logoURL;
    private linkURL;
    constructor(options?: LogoControlOptions);
    onAdd(map: SDKMap): HTMLElement;
}
export {};
