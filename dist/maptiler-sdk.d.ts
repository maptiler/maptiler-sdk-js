import * as maplibre_gl from 'maplibre-gl';
import maplibre_gl__default, { MapOptions as MapOptions$1, StyleSpecification, ControlPosition, StyleOptions, LogoOptions as LogoOptions$1 } from 'maplibre-gl';
export * from 'maplibre-gl';
import * as _mapbox_mapbox_gl_supported from '@mapbox/mapbox-gl-supported';
import { FetchFunction, ReferenceMapStyle, MapStyleVariant } from '@maptiler/client';
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
     * Setting on whether of not the SDK runs with a session logic.
     * A "session" is started at the initialization of the SDK and finished when the browser
     * page is being refreshed.
     * When `session` is enabled (default: true), the extra URL param `mtsid` is added to queries
     * on the MapTiler Cloud API. This allows MapTiler to enable "session based billing".
     */
    session: boolean;
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
     * Define the language of the map. This can be done directly with a language ISO code (eg. "en")
     * or with a built-in shorthand (eg. Language.ENGLISH).
     * Note that this is equivalent to setting the `config.primaryLanguage` and will overwrite it.
     */
    language?: LanguageString;
    /**
     * Define the MapTiler Cloud API key to be used. This is strictly equivalent to setting
     * `config.apiKey` and will overwrite it.
     */
    apiKey?: string;
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
    private primaryLanguage;
    private secondaryLanguage;
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
     * Define the secondary language of the map. Note that this is not supported by all the map styles
     * Note that most styles do not allow a secondary language and this function only works if the style allows (no force adding)
     * @param language
     */
    setSecondaryLanguage(language?: LanguageString): void;
    /**
     * Get the primary language
     * @returns
     */
    getPrimaryLanguage(): LanguageString;
    /**
     * Get the secondary language
     * @returns
     */
    getSecondaryLanguage(): LanguageString;
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
    /**
     * Get the SDK config object.
     * This is convenient to dispatch the SDK configuration to externally built layers
     * that do not directly have access to the SDK configuration but do have access to a Map instance.
     * @returns
     */
    getSdkConfig(): SdkConfig;
    /**
     * Get the MapTiler session ID. Convenient to dispatch to externaly built component
     * that do not directly have access to the SDK configuration but do have access to a Map instance.
     * @returns
     */
    getMaptilerSessionId(): string;
}

declare const GeolocateControl$1: typeof maplibre_gl.GeolocateControl;
/**
 * The MaptilerGeolocateControl is an extension of the original GeolocateControl
 * with a few changes. In this version, the active mode persists as long as the
 * location is still centered. This means it's robust to rotation, pitch and zoom.
 *
 */
declare class MaptilerGeolocateControl extends GeolocateControl$1 {
    private lastUpdatedCenter;
    /**
     * Update the camera location to center on the current position
     *
     * @param {Position} position the Geolocation API Position
     * @private
     */
    _updateCamera(position: GeolocationPosition): void;
    _setupUI(supported: boolean): void;
    _updateCircleRadius(): void;
    _onZoom(): void;
}

declare type LogoOptions = LogoOptions$1 & {
    logoURL?: string;
    linkURL?: string;
};
/**
 * This LogoControl extends the MapLibre LogoControl but instead can use any image URL and
 * any link URL. By default this is using MapTiler logo and URL.
 */
declare class MaptilerLogoControl extends maplibre_gl__default.LogoControl {
    private logoURL;
    private linkURL;
    constructor(options?: LogoOptions);
    onAdd(map: Map): HTMLElement;
}

/**
 * A `MaptilerTerrainControl` control adds a button to turn terrain on and off
 * by triggering the terrain logic that is already deployed in the Map object.
 */
declare class MaptilerTerrainControl implements maplibregl.IControl {
    _map: Map;
    _container: HTMLElement;
    _terrainButton: HTMLButtonElement;
    constructor();
    onAdd(map: Map): HTMLElement;
    onRemove(): void;
    _toggleTerrain(): void;
    _updateTerrainIcon(): void;
}

/**
 * This is TypeScript rewrite of the Point class to use instead of the version imported in MapLibre.
 * It also uses a class instead of prototypes.
 */
/**
 * Row major 2x2 matrix
 */
declare type Matrix2 = [number, number, number, number];
/**
 * a point
 * @param x
 * @param y
 */
declare class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
    private _matMult;
    private _add;
    private _sub;
    private _mult;
    private _div;
    private _multByPoint;
    private _divByPoint;
    private _unit;
    private _perp;
    private _rotate;
    private _rotateAround;
    private _round;
    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone(): Point;
    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add(p: Point): Point;
    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub(p: Point): Point;
    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint(p: Point): Point;
    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint(p: Point): Point;
    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Number} k factor
     * @return {Point} output point
     */
    mult(k: number): Point;
    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    div(k: number): Point;
    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate(a: number): Point;
    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround(a: number, p: Point): Point;
    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {Array<Number>} m transformation matrix
     * @return {Point} output point
     */
    matMult(m: Matrix2): Point;
    /**
     * Calculate this point but as a unit vector from 0, 0, meaning
     * that the distance from the resulting point to the 0, 0
     * coordinate will be equal to 1 and the angle from the resulting
     * point to the 0, 0 coordinate will be the same as before.
     * @return {Point} unit vector point
     */
    unit(): Point;
    /**
     * Compute a perpendicular point, where the new y coordinate
     * is the old x coordinate and the new x coordinate is the old y
     * coordinate multiplied by -1
     * @return {Point} perpendicular point
     */
    perp(): Point;
    /**
     * Return a version of this point with the x & y coordinates
     * rounded to integers.
     * @return {Point} rounded point
     */
    round(): Point;
    /**
     * Return the magnitude of this point: this is the Euclidean
     * distance from the 0, 0 coordinate to this point's x and y
     * coordinates.
     * @return {Number} magnitude
     */
    mag(): number;
    /**
     * Judge whether this point is equal to another point, returning
     * true or false.
     * @param {Point} other the other point
     * @return {boolean} whether the points are equal
     */
    equals(other: any): boolean;
    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {Number} distance
     */
    dist(p: any): number;
    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {Number} distance
     */
    distSqr(p: any): number;
    /**
     * Get the angle from the 0, 0 coordinate to this point, in radians
     * coordinates.
     * @return {Number} angle
     */
    angle(): number;
    /**
     * Get the angle from this point to another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleTo(b: Point): number;
    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleWith(b: Point): number;
    angleWithSep(x: number, y: number): number;
    /**
     * Construct a point from an array if necessary, otherwise if the input
     * is already a Point, or an unknown type, return it unchanged
     * @param {Array<number> | Point} a any kind of input value
     * @return {Point} constructed point, or passed-through value.
     * @example
     * // this
     * var point = Point.convert([0, 1]);
     * // is equivalent to
     * var point = new Point(0, 1);
     */
    static convert(a: Point | Array<number>): Point;
}

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

export { AJAXError, AttributionControl, CanvasSource, Evented, FullscreenControl, GeoJSONSource, GeolocateControl, GeolocationType, ImageSource, Language, LanguageKey, LanguageString, LngLat, LngLatBounds, LogoControl, Map, MapOptions, MaptilerGeolocateControl, MaptilerLogoControl, MaptilerTerrainControl, Marker, Matrix2, MercatorCoordinate, NavigationControl, Point, Popup, RasterDEMTileSource, RasterTileSource, ScaleControl, SdkConfig, Style, TerrainControl, Unit, VectorTileSource, VideoSource, addProtocol, clearPrewarmedResources, clearStorage, config, getRTLTextPluginStatus, maxParallelImageRequests, prewarm, removeProtocol, setRTLTextPlugin, supported, version, workerCount, workerUrl };
