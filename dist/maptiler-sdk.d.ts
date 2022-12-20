import * as _mapbox_mapbox_gl_supported from '@mapbox/mapbox-gl-supported';
import * as ML from 'maplibre-gl';
import { StyleSpecification } from 'maplibre-gl';
export * from 'maplibre-gl';
import { FetchFunction } from '@maptiler/client';
export { ArrayBBox, ArrayLngLat, AutomaticStaticMapOptions, BBox, BoundedStaticMapOptions, CenteredStaticMapOptions, CoordinatesSearchOptions, GeocodingOptions, LanguageGeocoding, LanguageGeocodingString, ObjectBBox, ServiceError, coordinates, data, geocoding, geolocation, staticMaps } from '@maptiler/client';
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
declare type Values<T> = T[keyof T];
/**
 * Built-in languages values as strings
 */
declare type LanguageString = Values<typeof Language>;

/**
 * All the styles and variants maintained by MapTiler.
 */
declare type MapStyleType = {
    /**
     * Suitable for navigation, with high level of detail on urban areas.
     */
    STREETS: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
        /**
         * Suitable for navigation, with high level of detail on urban areas, in dark mode.
         */
        DARK: MapStyleVariant;
        /**
         * Suitable for navigation, with high level of detail on urban areas, in light mode.
         */
        LIGHT: MapStyleVariant;
        /**
         * Suitable for navigation, with high level of detail on urban areas, with a pastel color palette.
         */
        PASTEL: MapStyleVariant;
    };
    /**
     * Suitable for outdoor activities. With elevation isolines and hillshading.
     */
    OUTDOOR: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
    };
    /**
     * Suitabe for winter outdoor activities. With ski tracks, elevation isolines and hillshading.
     */
    WINTER: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
    };
    /**
     * High resolution imagery only, without any label.
     */
    SATELLITE: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
    };
    /**
     * High resolution imagery with labels, political borders and roads.
     */
    HYBRID: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
    };
    BASIC: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
        DARK: MapStyleVariant;
        LIGHT: MapStyleVariant;
    };
    BRIGHT: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
        DARK: MapStyleVariant;
        LIGHT: MapStyleVariant;
        PASTEL: MapStyleVariant;
    };
    OPENSTREETMAP: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
    };
    TOPO: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
        SHINY: MapStyleVariant;
        PASTEL: MapStyleVariant;
        TOPOGRAPHIQUE: MapStyleVariant;
    };
    VOYAGER: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
        DARK: MapStyleVariant;
        LIGHT: MapStyleVariant;
        VINTAGE: MapStyleVariant;
    };
    TONER: ReferenceMapStyle & {
        DEFAULT: MapStyleVariant;
        BACKGROUND: MapStyleVariant;
        LITE: MapStyleVariant;
        LINES: MapStyleVariant;
    };
};

/**
 * An instance of MapStyleVariant contains information about a style to use that belong to a reference style
 */
declare class MapStyleVariant {
    /**
     * Human-friendly name
     */
    private name;
    /**
     * Variant name the variant is addressed to from its reference style: `MapStyle.REFERNCE_STYLE_NAME.VARIANT_TYPE`
     */
    private variantType;
    /**
     * MapTiler Cloud id
     */
    private id;
    /**
     * Reference map style, used to retrieve sibling variants
     */
    private referenceStyle;
    /**
     * Human-friendly description
     */
    private description;
    /**
     * URL to an image describing the style variant
     */
    private imageURL;
    constructor(
    /**
     * Human-friendly name
     */
    name: string, 
    /**
     * Variant name the variant is addressed to from its reference style: `MapStyle.REFERNCE_STYLE_NAME.VARIANT_TYPE`
     */
    variantType: string, 
    /**
     * MapTiler Cloud id
     */
    id: string, 
    /**
     * Reference map style, used to retrieve sibling variants
     */
    referenceStyle: ReferenceMapStyle, 
    /**
     * Human-friendly description
     */
    description: string, 
    /**
     * URL to an image describing the style variant
     */
    imageURL: string);
    /**
     * Get the human-friendly name
     * @returns
     */
    getName(): string;
    getFullName(): string;
    /**
     * Get the variant type (eg. "DEFAULT", "DARK", "PASTEL", etc.)
     * @returns
     */
    getType(): string;
    /**
     * Get the style as usable by MapLibre, a string (URL) or a plain style description (StyleSpecification)
     * @returns
     */
    getUsableStyle(): string | StyleSpecification;
    /**
     * Get the MapTiler Cloud id
     * @returns
     */
    getId(): string;
    /**
     * Get the human-friendly description
     */
    getDescription(): string;
    /**
     * Get the reference style this variant belongs to
     * @returns
     */
    getReferenceStyle(): ReferenceMapStyle;
    /**
     * Check if a variant of a given type exists for _this_ variants
     * (eg. if this is a "DARK", then we can check if there is a "LIGHT" variant of it)
     * @param variantType
     * @returns
     */
    hasVariant(variantType: string): boolean;
    /**
     * Retrieve the variant of a given type. If not found, will return the "DEFAULT" variant.
     * (eg. _this_ "DARK" variant does not have any "PASTEL" variant, then the "DEFAULT" is returned)
     * @param variantType
     * @returns
     */
    getVariant(variantType: string): MapStyleVariant;
    /**
     * Get all the variants for _this_ variants, except _this_ current one
     * @returns
     */
    getVariants(): Array<MapStyleVariant>;
    /**
     * Get the image URL that represent _this_ variant
     * @returns
     */
    getImageURL(): string;
}
/**
 * An instance of reference style contains a list of StyleVariants ordered by relevance
 */
declare class ReferenceMapStyle {
    /**
     * Human-friendly name of this reference style
     */
    private name;
    /**
     * ID of this reference style
     */
    private id;
    /**
     * Variants that belong to this reference style, key being the reference type
     */
    private variants;
    /**
     * Variants that belong to this reference style, ordered by relevance
     */
    private orderedVariants;
    constructor(
    /**
     * Human-friendly name of this reference style
     */
    name: string, 
    /**
     * ID of this reference style
     */
    id: string);
    /**
     * Get the human-friendly name of this reference style
     * @returns
     */
    getName(): string;
    /**
     * Get the id of _this_ reference style
     * @returns
     */
    getId(): string;
    /**
     * Add a variant to _this_ reference style
     * @param v
     */
    addVariant(v: MapStyleVariant): void;
    /**
     * Check if a given variant type exists for this reference style
     * @param variantType
     * @returns
     */
    hasVariant(variantType: string): boolean;
    /**
     * Get a given variant. If the given type of variant does not exist for this reference style,
     * then the most relevant default variant is returned instead
     * @param variantType
     * @returns
     */
    getVariant(variantType: string): MapStyleVariant;
    /**
     * Get the list of variants for this reference style
     * @returns
     */
    getVariants(): Array<MapStyleVariant>;
    /**
     * Get the defualt variant for this reference style
     * @returns
     */
    getDefaultVariant(): MapStyleVariant;
}
/**
 * Contains all the reference map style created by MapTiler team as well as all the variants.
 * For example, `MapStyle.STREETS` and the variants:
 * - `MapStyle.STREETS.DARK`
 * - `MapStyle.STREETS.LIGHT`
 * - `MapStyle.STREETS.PASTEL`
 *
 */
declare const MapStyle: MapStyleType;

declare type TransformStyleFunction = (previous: ML.StyleSpecification, next: ML.StyleSpecification) => ML.StyleSpecification;
declare type StyleSwapOptions = {
    diff?: boolean;
    transformStyle?: TransformStyleFunction;
};
/**
 * Options to provide to the `Map` constructor
 */
declare type MapOptions = Omit<ML.MapOptions, "style" | "maplibreLogo"> & {
    /**
     * Style of the map. Can be:
     * - a full style URL (possibly with API key)
     * - a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
     * - a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)
     */
    style?: ReferenceMapStyle | MapStyleVariant | string;
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
    navigationControl?: boolean | ML.ControlPosition;
    /**
     * Show the terrain control. (default: `true`, will hide if `false`)
     */
    terrainControl?: boolean | ML.ControlPosition;
    /**
     * Show the scale control. (default: `false`, will show if `true`)
     */
    scaleControl?: boolean | ML.ControlPosition;
    /**
     * Show the full screen control. (default: `false`, will show if `true`)
     */
    fullscreenControl?: boolean | ML.ControlPosition;
};
/**
 * The Map class can be instanciated to display a map in a `<div>`
 */
declare class Map extends ML.Map {
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
    setStyle(style: ML.StyleSpecification | string | null, options?: StyleSwapOptions & ML.StyleOptions): this;
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
    setPrimaryLanguage(language?: LanguageString): any;
    /**
     * Define the secondary language of the map.
     * Note that most styles do not allow a secondary language and this function only works if the style allows (no force adding)
     * @param language
     */
    setSecondaryLanguage(language?: LanguageString): any;
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
     * If `true`, some more debuf text will show. Default: `false`
     */
    verbose: boolean;
    /**
     * The primary languag. By default, the language of the web browser is used.
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
declare const NavigationControl: typeof ML.NavigationControl;
declare const GeolocateControl: typeof ML.GeolocateControl;
declare const AttributionControl: typeof ML.AttributionControl;
declare const LogoControl: typeof ML.LogoControl;
declare const ScaleControl: typeof ML.ScaleControl;
declare const FullscreenControl: typeof ML.FullscreenControl;
declare const TerrainControl: typeof ML.TerrainControl;
declare const Popup: typeof ML.Popup;
declare const Marker: typeof ML.Marker;
declare const Style: typeof ML.Style;
declare const LngLat: typeof ML.LngLat;
declare const LngLatBounds: typeof ML.LngLatBounds;
declare const MercatorCoordinate: typeof ML.MercatorCoordinate;
declare const Evented: typeof ML.Evented;
declare const AJAXError: typeof ML.AJAXError;
declare const CanvasSource: typeof ML.CanvasSource;
declare const GeoJSONSource: typeof ML.GeoJSONSource;
declare const ImageSource: typeof ML.ImageSource;
declare const RasterDEMTileSource: typeof ML.RasterDEMTileSource;
declare const RasterTileSource: typeof ML.RasterTileSource;
declare const VectorTileSource: typeof ML.VectorTileSource;
declare const VideoSource: typeof ML.VideoSource;
declare const prewarm: () => void;
declare const clearPrewarmedResources: () => void;
declare const version: string;
declare const workerCount: number;
declare const maxParallelImageRequests: number;
declare const clearStorage: (callback?: (err?: Error) => void) => void;
declare const workerUrl: string;
declare const addProtocol: (customProtocol: string, loadFn: (requestParameters: ML.RequestParameters, callback: ML.ResponseCallback<any>) => ML.Cancelable) => void;
declare const removeProtocol: (customProtocol: string) => void;

export { AJAXError, AttributionControl, CanvasSource, Evented, FullscreenControl, GeoJSONSource, GeolocateControl, ImageSource, Language, LanguageString, LngLat, LngLatBounds, LogoControl, Map, MapOptions, MapStyle, MapStyleType, MapStyleVariant, Marker, MercatorCoordinate, NavigationControl, Point, Popup, RasterDEMTileSource, RasterTileSource, ReferenceMapStyle, ScaleControl, SdkConfig, Style, TerrainControl, Unit, VectorTileSource, VideoSource, addProtocol, clearPrewarmedResources, clearStorage, config, getRTLTextPluginStatus, maxParallelImageRequests, prewarm, removeProtocol, setRTLTextPlugin, supported, version, workerCount, workerUrl };
