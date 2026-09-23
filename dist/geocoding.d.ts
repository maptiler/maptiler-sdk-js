import * as client from "@maptiler/client";
export type ExtraGeocodingOptions = {
    /**
     * Specifies whether the geocoding request runs with a session logic.
     * A "session" is started at the initialization of the SDK and finished when the browser
     * page is being closed or refreshed.
     * When this option is enabled, extra URL param `mtsid` is added to queries
     * to the MapTiler Cloud API. This allows MapTiler to enable "session based billing".
     *
     * Default: value of this option in global config (which is `true` by default).
     */
    session?: boolean;
};
export type LanguageGeocodingOptions = client.LanguageGeocodingOptions;
export type BaseGeocodingOptions = client.BaseGeocodingOptions & ExtraGeocodingOptions;
export type CommonForwardAndReverseGeocodingOptions = client.CommonForwardAndReverseGeocodingOptions & ExtraGeocodingOptions;
export type GeocodingOptions = client.GeocodingOptions & ExtraGeocodingOptions;
export type ReverseGeocodingOptions = client.ReverseGeocodingOptions & ExtraGeocodingOptions;
export type ByIdGeocodingOptions = client.ByIdGeocodingOptions & ExtraGeocodingOptions;
export declare const geocoding: {
    forward: (query: string, options?: GeocodingOptions) => Promise<client.GeocodingSearchResult>;
    reverse: (position: client.Position, options?: ReverseGeocodingOptions) => Promise<client.GeocodingSearchResult>;
    byId: (id: string, options?: ByIdGeocodingOptions) => Promise<client.GeocodingSearchResult>;
    batch: (queries: string[], options?: GeocodingOptions) => Promise<client.GeocodingSearchResult[]>;
};
