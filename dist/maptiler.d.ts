import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';

declare class LngLat extends maplibre.LngLat {
    constructor(lng: number, lat: number);
    setToNull(): void;
}

declare type MapOptions = Omit<maplibre.MapOptions, "style"> & Omit<maplibre.MapOptions, "maplibreLogo"> & {
    style?: string;
    maptilerLogo?: boolean;
};
/**
 * Map constructor
 */
declare class Map extends maplibre.Map {
    private attributionMustDisplay;
    private attibutionLogoUrl;
    constructor(options: MapOptions);
}

interface ConfigInterface {
    apiToken: string;
    verbose: boolean;
}
declare const config: ConfigInterface;

export { LngLat, Map, config };
