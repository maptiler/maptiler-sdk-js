import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';

declare class LngLat extends maplibre.LngLat {
    constructor(lng: number, lat: number);
    setToNull(): void;
}

declare class Map extends maplibre.Map {
    constructor(options: maplibre.MapOptions);
}

interface ConfigInterface {
    accessToken: string;
}
declare const config: ConfigInterface;

export { LngLat, Map, config };
