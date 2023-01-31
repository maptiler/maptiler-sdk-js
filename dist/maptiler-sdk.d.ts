import * as maplibre_gl from 'maplibre-gl';
import maplibre_gl__default, { MapOptions as MapOptions$1, StyleSpecification, ControlPosition, StyleOptions } from 'maplibre-gl';
export * from 'maplibre-gl';
import * as _mapbox_mapbox_gl_supported from '@mapbox/mapbox-gl-supported';
import { ReferenceMapStyle, MapStyleVariant, FetchFunction } from '@maptiler/client';
export { AutomaticStaticMapOptions, BBox, BoundedStaticMapOptions, CenteredStaticMapOptions, CoordinatesSearchOptions, GeocodingOptions, LanguageGeocoding, LanguageGeocodingString, MapStyle, MapStyleType, MapStyleVariant, Position, ReferenceMapStyle, ServiceError, coordinates, data, geocoding, geolocation, staticMaps } from '@maptiler/client';
import EventEmitter from 'events';

/**
 * Languages. Note that not all the languages of this list are available but the compatibility list may be expanded in the future.
 */
declare const Language: {
    /**
     * AUTO mode uses the language of the browser
     */
    readonly AUTO: "auto";
    /**
     * Default fallback languages that uses latin charaters
     */
    readonly LATIN: "latin";
    /**
     * Default fallback languages that uses non-latin charaters
     */
    readonly NON_LATIN: "nonlatin";
    /**
     * Labels are in their local language, when available
     */
    readonly LOCAL: "";
    readonly ALBANIAN: "sq";
    readonly AMHARIC: "am";
    readonly ARABIC: "ar";
    readonly ARMENIAN: "hy";
    readonly AZERBAIJANI: "az";
    readonly BASQUE: "eu";
    readonly BELORUSSIAN: "be";
    readonly BOSNIAN: "bs";
    readonly BRETON: "br";
    readonly BULGARIAN: "bg";
    readonly CATALAN: "ca";
    readonly CHINESE: "zh";
    readonly CORSICAN: "co";
    readonly CROATIAN: "hr";
    readonly CZECH: "cs";
    readonly DANISH: "da";
    readonly DUTCH: "nl";
    readonly ENGLISH: "en";
    readonly ESPERANTO: "eo";
    readonly ESTONIAN: "et";
    readonly FINNISH: "fi";
    readonly FRENCH: "fr";
    readonly FRISIAN: "fy";
    readonly GEORGIAN: "ka";
    readonly GERMAN: "de";
    readonly GREEK: "el";
    readonly HEBREW: "he";
    readonly HINDI: "hi";
    readonly HUNGARIAN: "hu";
    readonly ICELANDIC: "is";
    readonly INDONESIAN: "id";
    readonly IRISH: "ga";
    readonly ITALIAN: "it";
    readonly JAPANESE: "ja";
    readonly JAPANESE_HIRAGANA: "ja-Hira";
    readonly JAPANESE_KANA: "ja_kana";
    readonly JAPANESE_LATIN: "ja_rm";
    readonly JAPANESE_2018: "ja-Latn";
    readonly KANNADA: "kn";
    readonly KAZAKH: "kk";
    readonly KOREAN: "ko";
    readonly KOREAN_LATIN: "ko-Latn";
    readonly KURDISH: "ku";
    readonly ROMAN_LATIN: "la";
    readonly LATVIAN: "lv";
    readonly LITHUANIAN: "lt";
    readonly LUXEMBOURGISH: "lb";
    readonly MACEDONIAN: "mk";
    readonly MALAYALAM: "ml";
    readonly MALTESE: "mt";
    readonly NORWEGIAN: "no";
    readonly OCCITAN: "oc";
    readonly POLISH: "pl";
    readonly PORTUGUESE: "pt";
    readonly ROMANIAN: "ro";
    readonly ROMANSH: "rm";
    readonly RUSSIAN: "ru";
    readonly SCOTTISH_GAELIC: "gd";
    readonly SERBIAN_CYRILLIC: "sr";
    readonly SERBIAN_LATIN: "sr-Latn";
    readonly SLOVAK: "sk";
    readonly SLOVENE: "sl";
    readonly SPANISH: "es";
    readonly SWEDISH: "sv";
    readonly TAMIL: "ta";
    readonly TELUGU: "te";
    readonly THAI: "th";
    readonly TURKISH: "tr";
    readonly UKRAINIAN: "uk";
    readonly WELSH: "cy";
};
/**
 * Type representing the key of the Language object
 */
declare type LanguageKey = keyof typeof Language;
declare type Values<T> = T[keyof T];
/**
 * Built-in languages values as strings
 */
declare type LanguageString = Values<typeof Language>;

declare type TransformStyleFunction = (previous: StyleSpecification, next: StyleSpecification) => StyleSpecification;
declare type StyleSwapOptions = {
    diff?: boolean;
    transformStyle?: TransformStyleFunction;
};
declare const GeolocationType: {
    POINT: "POINT";
    COUNTRY: "COUNTRY";
};
/**
 * Options to provide to the `Map` constructor
 */
declare type MapOptions = Omit<MapOptions$1, "style" | "maplibreLogo"> & {
    /**
     * Style of the map. Can be:
     * - a full style URL (possibly with API key)
     * - a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
     * - a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)
     */
    style?: ReferenceMapStyle | MapStyleVariant | StyleSpecification | string;
    /**
     * Shows the MapTiler logo if `true`. Note that the logo is always displayed on free plan.
     */
    maptilerLogo?: boolean;
    /**
     * Enables 3D terrain if `true`. (default: `false`)
     */
    terrain?: boolean;
    /**
     * Exaggeration factor of the terrain. (default: `1`, no exaggeration)
     */
    terrainExaggeration?: number;
    /**
     * Show the navigation control. (default: `true`, will hide if `false`)
     */
    navigationControl?: boolean | ControlPosition;
    /**
     * Show the terrain control. (default: `false`, will show if `true`)
     */
    terrainControl?: boolean | ControlPosition;
    /**
     * Show the geolocate control. (default: `true`, will hide if `false`)
     */
    geolocateControl?: boolean | ControlPosition;
    /**
     * Show the scale control. (default: `false`, will show if `true`)
     */
    scaleControl?: boolean | ControlPosition;
    /**
     * Show the full screen control. (default: `false`, will show if `true`)
     */
    fullscreenControl?: boolean | ControlPosition;
    /**
     * Method to position the map at a given geolocation. Only if:
     * - `hash` is `false`
     * - `center` is not provided
     *
     * If the value is `true` of `"POINT"` (given by `GeolocationType.POINT`) then the positionning uses the MapTiler Cloud
     * Geolocation to find the non-GPS location point.
     * The zoom level can be provided in the `Map` constructor with the `zoom` option or will be `13` if not provided.
     *
     * If the value is `"COUNTRY"` (given by `GeolocationType.COUNTRY`) then the map is centered around the bounding box of the country.
     * In this case, the `zoom` option will be ignored.
     *
     * If the value is `false`, no geolocation is performed and the map centering and zooming depends on other options or on
     * the built-in defaults.
     *
     * If this option is non-false and the options `center` is also provided, then `center` prevails.
     *
     * Default: `false`
     */
    geolocate?: typeof GeolocationType[keyof typeof GeolocationType] | boolean;
};
/**
 * The Map class can be instanciated to display a map in a `<div>`
 */
declare class Map extends maplibre_gl__default.Map {
    private languageShouldUpdate;
    private isStyleInitialized;
    private isTerrainEnabled;
    private terrainExaggeration;
    constructor(options: MapOptions);
    /**
     * Update the style of the map.
     * Can be:
     * - a full style URL (possibly with API key)
     * - a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
     * - a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)
     * @param style
     * @param options
     * @returns
     */
    setStyle(style: ReferenceMapStyle | MapStyleVariant | StyleSpecification | string, options?: StyleSwapOptions & StyleOptions): this;
    /**
     * Define the primary language of the map. Note that not all the languages shorthands provided are available.
     * This function is a short for `.setPrimaryLanguage()`
     * @param language
     */
    setLanguage(language?: LanguageString): any;
    /**
     * Define the primary language of the map. Note that not all the languages shorthands provided are available.
     * @param language
     */
    setPrimaryLanguage(language?: LanguageString): void;
    /**
     * Define the secondary language of the map.
     * Note that most styles do not allow a secondary language and this function only works if the style allows (no force adding)
     * @param language
     */
    setSecondaryLanguage(language?: LanguageString): void;
    /**
     * Get the exaggeration factor applied to the terrain
     * @returns
     */
    getTerrainExaggeration(): number;
    /**
     * Know if terrian is enabled or not
     * @returns
     */
    hasTerrain(): boolean;
    /**
     * Enables the 3D terrain visualization
     * @param exaggeration
     * @returns
     */
    enableTerrain(exaggeration?: number): void;
    /**
     * Disable the 3D terrain visualization
     */
    disableTerrain(): void;
    /**
     * Sets the 3D terrain exageration factor.
     * Note: this is only a shortcut to `.enableTerrain()`
     * @param exaggeration
     */
    setTerrainExaggeration(exaggeration: number): void;
    /**
     * Perform an action when the style is ready. It could be at the moment of calling this method
     * or later.
     * @param cb
     */
    private onStyleReady;
    fitToIpBounds(): Promise<void>;
    centerOnIpPoint(zoom: number | undefined): Promise<void>;
    getCameraHash(): string;
}

/**
 * A standalone point geometry with useful accessor, comparison, and
 * modification methods.
 *
 * @class Point
 * @param {Number} x the x-coordinate. this could be longitude or screen
 * pixels, or any other sort of unit.
 * @param {Number} y the y-coordinate. this could be latitude or screen
 * pixels, or any other sort of unit.
 * @example
 * var point = new Point(-77, 38);
 */
declare function Point(x: any, y: any): void;
declare namespace Point {
    var convert: (a: any) => any;
}

declare type Unit = "imperial" | "metric" | "nautical";

/**
 * Configuration class for the SDK
 */
declare class SdkConfig extends EventEmitter {
    /**
     * The primary language. By default, the language of the web browser is used.
     */
    primaryLanguage: LanguageString | null;
    /**
     * The secondary language, to overwrite the default language defined in the map style.
     * This settings is highly dependant on the style compatibility and may not work in most cases.
     */
    secondaryLanguage: LanguageString | null;
    /**
     * Unit to be used
     */
    private _unit;
    /**
     * MapTiler Cloud API key
     */
    private _apiKey;
    constructor();
    /**
     * Set the unit system
     */
    set unit(u: Unit);
    /**
     * Get the unit system
     */
    get unit(): Unit;
    /**
     * Set the MapTiler Cloud API key
     */
    set apiKey(k: string);
    /**
     * Get the MapTiler Cloud API key
     */
    get apiKey(): string;
    /**
     * Set a the custom fetch function to replace the default one
     */
    set fetch(f: FetchFunction);
    /**
     * Get the fetch fucntion
     */
    get fetch(): FetchFunction | null;
}
declare const config: SdkConfig;

declare const supported: _mapbox_mapbox_gl_supported.IsSupported;
declare const setRTLTextPlugin: (url: string, callback: (error?: Error) => void, deferred?: boolean) => void;
declare const getRTLTextPluginStatus: () => string;
declare const NavigationControl: typeof maplibre_gl.NavigationControl;
declare const GeolocateControl: typeof maplibre_gl.GeolocateControl;
declare const AttributionControl: typeof maplibre_gl.AttributionControl;
declare const LogoControl: typeof maplibre_gl.LogoControl;
declare const ScaleControl: typeof maplibre_gl.ScaleControl;
declare const FullscreenControl: typeof maplibre_gl.FullscreenControl;
declare const TerrainControl: typeof maplibre_gl.TerrainControl;
declare const Popup: typeof maplibre_gl.Popup;
declare const Marker: typeof maplibre_gl.Marker;
declare const Style: typeof maplibre_gl.Style;
declare const LngLat: typeof maplibre_gl.LngLat;
declare const LngLatBounds: typeof maplibre_gl.LngLatBounds;
declare const MercatorCoordinate: typeof maplibre_gl.MercatorCoordinate;
declare const Evented: typeof maplibre_gl.Evented;
declare const AJAXError: typeof maplibre_gl.AJAXError;
declare const CanvasSource: typeof maplibre_gl.CanvasSource;
declare const GeoJSONSource: typeof maplibre_gl.GeoJSONSource;
declare const ImageSource: typeof maplibre_gl.ImageSource;
declare const RasterDEMTileSource: typeof maplibre_gl.RasterDEMTileSource;
declare const RasterTileSource: typeof maplibre_gl.RasterTileSource;
declare const VectorTileSource: typeof maplibre_gl.VectorTileSource;
declare const VideoSource: typeof maplibre_gl.VideoSource;
declare const prewarm: () => void;
declare const clearPrewarmedResources: () => void;
declare const version: string;
declare const workerCount: number;
declare const maxParallelImageRequests: number;
declare const clearStorage: (callback?: (err?: Error) => void) => void;
declare const workerUrl: string;
declare const addProtocol: (customProtocol: string, loadFn: (requestParameters: maplibre_gl.RequestParameters, callback: maplibre_gl.ResponseCallback<any>) => maplibre_gl.Cancelable) => void;
declare const removeProtocol: (customProtocol: string) => void;

export { AJAXError, AttributionControl, CanvasSource, Evented, FullscreenControl, GeoJSONSource, GeolocateControl, GeolocationType, ImageSource, Language, LanguageKey, LanguageString, LngLat, LngLatBounds, LogoControl, Map, MapOptions, Marker, MercatorCoordinate, NavigationControl, Point, Popup, RasterDEMTileSource, RasterTileSource, ScaleControl, SdkConfig, Style, TerrainControl, Unit, VectorTileSource, VideoSource, addProtocol, clearPrewarmedResources, clearStorage, config, getRTLTextPluginStatus, maxParallelImageRequests, prewarm, removeProtocol, setRTLTextPlugin, supported, version, workerCount, workerUrl };
