import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';

declare type lngLatType = {
    lng: number;
    lat: number;
};
declare type lngLatArrayType = [number, number];
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
    /**
     * Only search for results in the specified area.
     */
    bbox?: bboxType;
    /**
     * Prefer results close to a specific location.
     */
    proximity?: lngLatType;
    /**
     * Prefer results in specific language. It’s possible to specify multiple values.
     */
    language?: string | Array<string>;
};
/**
 * Performs a forward geocoding query to MapTiler API
 * @param query
 * @param options
 * @returns
 */
declare function forward(query: any, options?: geocoderOptionsType): Promise<any>;
/**
 * Perform a reverse geocoding query to MapTiler API
 * @param lngLat
 * @param options
 * @returns
 */
declare function reverse(lngLat: lngLatType, options?: geocoderOptionsType): Promise<any>;
declare const geocoder: {
    forward: typeof forward;
    reverse: typeof reverse;
};

/**
 * Looks up geolocation details from IP address using MapTiler API
 * @returns
 */
declare function info(): Promise<any>;
declare const geolocation: {
    info: typeof info;
};

declare type coordinatesSearchOptionsType = {
    /**
     * Maximum number of results returned (default: 10)
     */
    limit?: number;
    /**
     *  Show detailed transformations for each CRS (default: false)
     */
    transformations?: boolean;
    /**
     * Show exports in WKT and Proj4 notations (default: false)
     */
    exports?: boolean;
};
/**
 * Search information about coordinate systems using MapTiler API
 * @param query
 * @param options
 * @returns
 */
declare function search(query: string, options?: coordinatesSearchOptionsType): Promise<any>;
declare type coordinatesTransformOptionsType = {
    /**
     * Source coordinate reference system (default: 4326)
     */
    sourceCrs?: number;
    /**
     * Target coordinate reference system (default: 4326)
     */
    targetCrs?: number;
    /**
     * List of codes of operations
     */
    operations?: number | Array<number>;
};
/**
 * Transforms coordinates from a source reference system to a target reference system using MapTiler API
 * @param coordinates
 * @param options
 * @returns
 */
declare function transform(coordinates: lngLatType | Array<lngLatType>, options?: coordinatesTransformOptionsType): Promise<any>;
declare const coordinates: {
    search: typeof search;
    transform: typeof transform;
};

/**
 * Get user data and returns it as GeoJSON using the MapTiler API
 * @param dataId
 * @returns
 */
declare function get(dataId: string): Promise<any>;
declare const data: {
    get: typeof get;
};

declare type centeredStaticMapOptionsType = {
    style?: string;
    hiDPI?: boolean;
    format?: 'png' | 'jpg' | 'webp';
    width?: number;
    height?: number;
    attribution?: 'bottomright' | 'bottomleft' | 'topleft' | 'topright' | false;
    marker?: staticMapMarkerType | Array<staticMapMarkerType>;
    markerIcon?: string;
    markerAnchor?: 'top' | 'left' | 'bottom' | 'right' | 'center' | 'topleft' | 'bottomleft' | 'topright' | 'bottomright';
    markerScale?: number;
    path?: Array<lngLatArrayType>;
    pathStrokeColor?: string;
    pathFillColor?: string;
    pathWidth?: number;
};
declare type boundedStaticMapOptionsType = {
    style?: string;
    hiDPI?: boolean;
    format?: 'png' | 'jpg' | 'webp';
    width?: number;
    height?: number;
    attribution?: 'bottomright' | 'bottomleft' | 'topleft' | 'topright' | false;
    marker?: staticMapMarkerType | Array<staticMapMarkerType>;
    markerIcon?: string;
    markerAnchor?: 'top' | 'left' | 'bottom' | 'right' | 'center' | 'topleft' | 'bottomleft' | 'topright' | 'bottomright';
    markerScale?: number;
    path?: Array<lngLatArrayType>;
    pathStrokeColor?: string;
    pathFillColor?: string;
    pathWidth?: number;
    padding?: number;
};
declare type automaticStaticMapOptionsType = boundedStaticMapOptionsType;
declare type staticMapMarkerType = {
    lng: number;
    lat: number;
    color?: string;
};
/**
 * Construct the URL for a static map centered on one point.
 * Note: this function does not fetch the binary content of the image since
 * the purpose of a static map is generally to have its URL as a `src` property of a <img/> element.
 * @param center
 * @param zoom
 * @param options
 * @returns
 */
declare function centered(center: lngLatType, zoom: number, options?: centeredStaticMapOptionsType): string;
/**
 * Construct the URL for a static map using a bounding box
 * Note: this function does not fetch the binary content of the image since
 * the purpose of a static map is generally to have its URL as a `src` property of a <img/> element.
 * @param boundingBox
 * @param options
 * @returns
 */
declare function bounded(boundingBox: bboxType, options?: boundedStaticMapOptionsType): string;
/**
 * Construct the URL for a static map automatically fitted around the provided path or markers.
 * Note: this function does not fetch the binary content of the image since
 * the purpose of a static map is generally to have its URL as a `src` property of a <img/> element.
 * @param options
 * @returns
 */
declare function automatic(options?: automaticStaticMapOptionsType): string;
declare const staticMaps: {
    centered: typeof centered;
    bounded: typeof bounded;
    automatic: typeof automatic;
};

/**
 * A ServiceError is an Error that includes the HTTP response details
 */
declare class ServiceError extends Error {
    res: Response;
    constructor(res: Response, customMessage?: string);
}

interface ConfigInterface {
    apiToken: string;
    verbose: boolean;
}
declare const config: ConfigInterface;

export { Map, MapOptions, ServiceError, automaticStaticMapOptionsType, bboxType, boundedStaticMapOptionsType, centeredStaticMapOptionsType, config, coordinates, coordinatesSearchOptionsType, data, geocoder, geocoderOptionsType, geolocation, lngLatType, staticMaps };
