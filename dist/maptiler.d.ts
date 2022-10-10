import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';

declare class LngLat extends maplibre.LngLat {
    constructor(lng: number, lat: number);
    setToNull(): void;
}

declare type MapOptions = Omit<maplibre.MapOptions, "style"> & {
    style?: string;
};
/**
 * Map constructor
 */
declare class Map extends maplibre.Map {
    constructor(options: MapOptions);
}

interface ConfigInterface {
    apiToken: string;
    verbose: boolean;
}
declare const config: ConfigInterface;

export { LngLat, Map, config };
