import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';

declare type lngLatType = {
    lng: number;
    lat: number;
};
declare type bboxType = {
    southWest: lngLatType;
    northEast: lngLatType;
};

declare type MapOptions = Omit<maplibre.MapOptions, "style" | "maplibreLogo"> & {
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

declare type geocoderOptionsType = {
    bbox?: bboxType;
    proximity?: lngLatType;
    language?: string | Array<string>;
};
declare function forward(query: any, options?: geocoderOptionsType): Promise<void>;
declare function reverse(): Promise<void>;
declare const geocoder: {
    forward: typeof forward;
    reverse: typeof reverse;
};

declare class ServiceError extends Error {
    private res;
    constructor(res: Response);
}

interface ConfigInterface {
    apiToken: string;
    verbose: boolean;
}
declare const config: ConfigInterface;

export { Map, MapOptions, ServiceError, bboxType, config, geocoder, geocoderOptionsType, lngLatType };
