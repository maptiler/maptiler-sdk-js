import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';
import { FetchFunction } from '@maptiler/client';
export { AutomaticStaticMapOptions, Bbox, BoundedStaticMapOptions, CenteredStaticMapOptions, CoordinatesSearchOptions, GeocodingOptions, LngLat, LngLatArray, ServiceError, coordinates, data, geocoding, geolocation, staticMaps } from '@maptiler/client';

/**
 * Languages. Note that not all the languages of this list are available but the compatibility list may be expanded in the future.
 */
declare enum Language {
    LATIN = "latin",
    NON_LATIN = "nonlatin",
    LOCAL = "",
    AFAR = "aa",
    ABKHAZIAN = "ab",
    AVESTAN = "ae",
    AFRIKAANS = "af",
    AKAN = "ak",
    AMHARIC = "am",
    ARAGONESE = "an",
    ARABIC = "ar",
    ASSAMESE = "as",
    AVARIC = "av",
    AYMARA = "ay",
    AZERBAIJANI = "az",
    BASHKIR = "ba",
    BELARUSIAN = "be",
    BULGARIAN = "bg",
    BIHARI = "bh",
    BISLAMA = "bi",
    BAMBARA = "bm",
    BENGALI = "bn",
    TIBETAN = "bo",
    BRETON = "br",
    BOSNIAN = "bs",
    CATALAN = "ca",
    CHECHEN = "ce",
    CHAMORRO = "ch",
    CORSICAN = "co",
    CREE = "cr",
    CZECH = "cs",
    CHURCH_SLAVIC = "cu",
    CHUVASH = "cv",
    WELSH = "cy",
    DANISH = "da",
    GERMAN = "de",
    MALDIVIAN = "dv",
    DZONGKHA = "dz",
    EWE = "ee",
    GREEK = "el",
    ENGLISH = "en",
    ESPERANTO = "eo",
    SPANISH = "es",
    ESTONIAN = "et",
    BASQUE = "eu",
    PERSIAN = "fa",
    FULAH = "ff",
    FINNISH = "fi",
    FIJIAN = "fj",
    FAROESE = "fo",
    FRENCH = "fr",
    WESTERN_FRISIAN = "fy",
    IRISH = "ga",
    GAELIC = "gd",
    GALICIAN = "gl",
    GUARANI = "gn",
    GUJARATI = "gu",
    MANX = "gv",
    HAUSA = "ha",
    HEBREW = "he",
    HINDI = "hi",
    HIRI_MOTU = "ho",
    CROATIAN = "hr",
    HAITIAN = "ht",
    HUNGARIAN = "hu",
    ARMENIAN = "hy",
    HERERO = "hz",
    INTERLINGUA = "ia",
    INDONESIAN = "id",
    INTERLINGUE = "ie",
    IGBO = "ig",
    SICHUAN_YI = "ii",
    INUPIAQ = "ik",
    IDO = "io",
    ICELANDIC = "is",
    ITALIAN = "it",
    INUKTITUT = "iu",
    JAPANESE = "ja",
    JAVANESE = "jv",
    GEORGIAN = "ka",
    KONGO = "kg",
    KIKUYU = "ki",
    KUANYAMA = "kj",
    KAZAKH = "kk",
    KALAALLISUT = "kl",
    CENTRAL_KHMER = "km",
    KANNADA = "kn",
    KOREAN = "ko",
    KANURI = "kr",
    KASHMIRI = "ks",
    KURDISH = "ku",
    KOMI = "kv",
    CORNISH = "kw",
    KIRGHIZ = "ky",
    LUXEMBOURGISH = "lb",
    GANDA = "lg",
    LIMBURGAN = "li",
    LINGALA = "ln",
    LAO = "lo",
    LITHUANIAN = "lt",
    LUBA_KATANGA = "lu",
    LATVIAN = "lv",
    MALAGASY = "mg",
    MARSHALLESE = "mh",
    MAORI = "mi",
    MACEDONIAN = "mk",
    MALAYALAM = "ml",
    MONGOLIAN = "mn",
    MARATHI = "mr",
    MALAY = "ms",
    MALTESE = "mt",
    BURMESE = "my",
    NAURU = "na",
    NORWEGIAN = "no",
    NORTH_NDEBELE = "nd",
    NEPALI = "ne",
    NDONGA = "ng",
    DUTCH = "nl",
    SOUTH_NDEBELE = "nr",
    NAVAJO = "nv",
    CHICHEWA = "ny",
    OCCITAN = "oc",
    OJIBWA = "oj",
    OROMO = "om",
    ORIYA = "or",
    OSSETIC = "os",
    PANJABI = "pa",
    PALI = "pi",
    POLISH = "pl",
    PUSHTO = "ps",
    PORTUGUESE = "pt",
    QUECHUA = "qu",
    ROMANSH = "rm",
    RUNDI = "rn",
    ROMANIAN = "ro",
    RUSSIAN = "ru",
    KINYARWANDA = "rw",
    SANSKRIT = "sa",
    SARDINIAN = "sc",
    SINDHI = "sd",
    NORTHERN_SAMI = "se",
    SANGO = "sg",
    SINHALA = "si",
    SLOVAK = "sk",
    SLOVENIAN = "sl",
    SAMOAN = "sm",
    SHONA = "sn",
    SOMALI = "so",
    ALBANIAN = "sq",
    SERBIAN = "sr",
    SWATI = "ss",
    SOTHO_SOUTHERN = "st",
    SUNDANESE = "su",
    SWEDISH = "sv",
    SWAHILI = "sw",
    TAMIL = "ta",
    TELUGU = "te",
    TAJIK = "tg",
    THAI = "th",
    TIGRINYA = "ti",
    TURKMEN = "tk",
    TAGALOG = "tl",
    TSWANA = "tn",
    TONGA = "to",
    TURKISH = "tr",
    TSONGA = "ts",
    TATAR = "tt",
    TWI = "tw",
    TAHITIAN = "ty",
    UIGHUR = "ug",
    UKRAINIAN = "uk",
    URDU = "ur",
    UZBEK = "uz",
    VENDA = "ve",
    VIETNAMESE = "vi",
    VOLAPUK = "vo",
    WALLOON = "wa",
    WOLOF = "wo",
    XHOSA = "xh",
    YIDDISH = "yi",
    YORUBA = "yo",
    ZHUANG = "za",
    CHINESE = "zh",
    ZULU = "zu"
}

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
    setLanguage(language?: Language): void;
    /**
     * Define the primary language of the map. Note that not all the languages shorthands provided are available.
     * @param language
     */
    setPrimaryLanguage(language?: Language): void;
    /**
     * Define the secondary language of the map.
     * Note that most styles do not allow a secondary language and this function only works if the style allows (no force adding)
     * @param language
     */
    setSecondaryLanguage(language?: Language): void;
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
    primaryLanguage: Language | null;
    /**
     * The secondary language, to overwrite the default language defined in the map style.
     * This settings is highly dependant on the style compatibility and may not work in most cases.
     */
    secondaryLanguage: Language | null;
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
declare enum Style {
    STREETS = "streets-v2",
    HYBRID = "hybrid",
    SATELLITE = "satellite",
    OUTDOOR = "outdoor",
    BASIC = "basic-v2",
    DARK = "streets-v2-dark",
    LIGHT = "streets-v2-light"
}

export { Language, Map, MapOptions, SdkConfig, Style, Unit, config };
