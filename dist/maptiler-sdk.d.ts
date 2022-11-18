import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';
import { FetchFunction } from '@maptiler/client';
export { AutomaticStaticMapOptions, Bbox, BoundedStaticMapOptions, CenteredStaticMapOptions, CoordinatesSearchOptions, GeocodingOptions, LngLat, LngLatArray, ServiceError, coordinates, data, geocoding, geolocation, staticMaps } from '@maptiler/client';

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
    readonly ROMANIA: "ro";
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
declare type Values$1<T> = T[keyof T];
/**
 * Built-in languages values as strings
 */
declare type LanguageString = Values$1<typeof Language>;

declare type TransformStyleFunction = (previous: maplibre.StyleSpecification, next: maplibre.StyleSpecification) => maplibre.StyleSpecification;
declare type StyleSwapOptions = {
    diff?: boolean;
    transformStyle?: TransformStyleFunction;
};
/**
 * Options to provide to the `Map` constructor
 */
declare type MapOptions = Omit<maplibre.MapOptions, "style" | "maplibreLogo"> & {
    /**
     * Style of the map. Can be:
     * - a full style URL (possibly with API key)
     * - a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
     * - a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)
     */
    style?: string;
    /**
     * Shows the MapTiler logo if `true`. Note that the logo is always displayed on free plan.
     */
    maptilerLogo?: boolean;
    /**
     * Enables 3D terrain if `true`. (default: `false`)
     */
    enableTerrain?: boolean;
    /**
     * Exaggeration factor of the terrain. (default: `1`, no exaggeration)
     */
    terrainExaggeration?: number;
};
/**
 * The Map class can be instanciated to display a map in a `<div>`
 */
declare class Map extends maplibre.Map {
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
    setStyle(style: maplibre.StyleSpecification | string | null, options?: StyleSwapOptions & maplibre.StyleOptions): this;
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
 * Configuration class for the SDK
 */
declare class SdkConfig {
    /**
     * If `true`, some more debuf text will show. Default: `false`
     */
    verbose: boolean;
    /**
     * The primary language, to overwrite the default language defined in the map style.
     */
    primaryLanguage: LanguageString | null;
    /**
     * The secondary language, to overwrite the default language defined in the map style.
     * This settings is highly dependant on the style compatibility and may not work in most cases.
     */
    secondaryLanguage: LanguageString | null;
    /**
     * MapTiler Cloud API key
     */
    private _apiKey;
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

declare enum Unit {
    METRIC = 0,
    IMPERIAL = 1
}

/**
 * Built-in styles
 */
declare const Style: {
    readonly STREETS: "streets-v2";
    readonly HYBRID: "hybrid";
    readonly SATELLITE: "satellite";
    readonly OUTDOOR: "outdoor";
    readonly BASIC: "basic-v2";
    readonly DARK: "streets-v2-dark";
    readonly LIGHT: "streets-v2-light";
};
declare type Values<T> = T[keyof T];
/**
 * Built-in style values as strings
 */
declare type StyleString = Values<typeof Style>;

export { Language, LanguageString, Map, MapOptions, SdkConfig, Style, StyleString, Unit, config };
