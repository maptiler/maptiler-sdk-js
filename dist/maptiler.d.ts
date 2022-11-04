import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';

declare type LngLat = {
    lng: number;
    lat: number;
};
declare type LngLatArray = [number, number];
declare type Bbox = {
    southWest: LngLat;
    northEast: LngLat;
};

declare type TransformStyleFunction = (previous: maplibre.StyleSpecification, next: maplibre.StyleSpecification) => maplibre.StyleSpecification;
declare type StyleSwapOptions = {
    diff?: boolean;
    transformStyle?: TransformStyleFunction;
};
declare type MapOptions = Omit<maplibre.MapOptions, "style" | "maplibreLogo"> & {
    style?: string;
    maptilerLogo?: boolean;
};
/**
 * The Map
 */
declare class Map extends maplibre.Map {
    private languageShouldUpdate;
    constructor(options: MapOptions);
    /**
     *
     * @param style
     * @param options
     * @returns
     */
    setStyle(style: maplibre.StyleSpecification | string | null, options?: StyleSwapOptions & maplibre.StyleOptions): this;
    setlanguage(language?: string): void;
    setPrimaryLanguage(language?: string): void;
    setSecondaryLanguage(language?: string): void;
    getLanguages(): void;
}

declare type GeocoderOptions = {
    /**
     * Only search for results in the specified area.
     */
    bbox?: Bbox;
    /**
     * Prefer results close to a specific location.
     */
    proximity?: LngLat;
    /**
     * Prefer results in specific language. It’s possible to specify multiple values.
     */
    language?: string | Array<string>;
};
/**
 * Performs a forward geocoding query to MapTiler API.
 * Providing a human readable place name (of a city, country, street, etc.), the function returns
 * a list of candidate locations including longitude and latitude.
 * Learn more on the MapTiler API reference page: https://docs.maptiler.com/cloud/api/geocoding/#search-by-name-forward
 * @param query
 * @param options
 * @returns
 */
declare function forward(query: any, options?: GeocoderOptions): Promise<any>;
/**
 * Perform a reverse geocoding query to MapTiler API.
 * Providing a longitude and latitude, this function returns a set of human readable information abou this place (country, city, street, etc.)
 * Learn more on the MapTiler API reference page: https://docs.maptiler.com/cloud/api/geocoding/#search-by-coordinates-reverse
 * @param lngLat
 * @param options
 * @returns
 */
declare function reverse(lngLat: LngLat, options?: GeocoderOptions): Promise<any>;
/**
 * The **geocoder** namespace contains asynchronous functions to call the [MapTiler Geocoding API](https://docs.maptiler.com/cloud/api/geocoding/).
 * The **Geocoder API** provides ways to get geographic coordinates from a human-readable search query of a place (forward geocoding)
 * and to get the location details (country, city, street, etc.) from a geographic coordinate (reverse geocoding);
 */
declare const geocoder: {
    forward: typeof forward;
    reverse: typeof reverse;
};

/**
 * Looks up geolocation details from IP address using MapTiler API.
 * Learn more on the MapTiler API reference page: https://docs.maptiler.com/cloud/api/geolocation/#ip-geolocation
 * @returns
 */
declare function info(): Promise<any>;
/**
 * The **geolocation** namespace contains an asynchronous function to call the [MapTiler Geolocation API](https://docs.maptiler.com/cloud/api/geolocation/).
 * The **Geolocation API** provides a way to retrieve the IP address as well as geographic informations of a machine performing the query (most likely: a user)
 */
declare const geolocation: {
    info: typeof info;
};

declare type CoordinatesSearchOptions = {
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
 * Search information about coordinate systems using MapTiler API.
 * Learn more on the MapTiler API reference page: https://docs.maptiler.com/cloud/api/coordinates/#search-coordinate-systems
 * @param query Can be any kind of CRS by name or code
 * @param options
 * @returns
 */
declare function search(query: string, options?: CoordinatesSearchOptions): Promise<any>;
declare type CoordinatesTransformOptions = {
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
 * Transforms coordinates from a source reference system to a target reference system using MapTiler API.
 * Learn more on the MapTiler API reference page: https://docs.maptiler.com/cloud/api/coordinates/#transform-coordinates
 * @param coordinates
 * @param options
 * @returns
 */
declare function transform(coordinates: LngLat | Array<LngLat>, options?: CoordinatesTransformOptions): Promise<any>;
/**
 * The **coordinate** namespace contains asynchronous functions to call the [MapTiler Coordinate API](https://docs.maptiler.com/cloud/api/coordinates/).
 * The goal of the **Coordinate API* is query information about spatial coordinate reference system (CRS) as well as to transform coordinates from one CRS to another.
 */
declare const coordinates: {
    search: typeof search;
    transform: typeof transform;
};

/**
 * Get user data and returns it as GeoJSON using the MapTiler API.
 * Learn more on the MapTiler API reference page: https://docs.maptiler.com/cloud/api/data/#geojson
 * @param dataId
 * @returns
 */
declare function get(dataId: string): Promise<any>;
/**
 * The **data** namespace contains an asynchronous function to call the [MapTiler Data API](https://docs.maptiler.com/cloud/api/data/).
 * The **Data API** provides a way to retrieve user data in GeoJSON format.
 */
declare const data: {
    get: typeof get;
};

declare type StaticMapBaseOptions = {
    /**
     * Style of the map (not full style URL). Example: "winter", "streets-v2".
     * Default: `"streets-v2"`
     */
    style?: string;
    /**
     * Double the size of the static map image to support hiDPI/Retina monitors.
     * Default: `false`
     */
    hiDPI?: boolean;
    /**
     * Image format.
     * Default: `"png"`
     */
    format?: "png" | "jpg" | "webp";
    /**
     * Width of the output image. Maximum value: `2048`.
     * Default: `1024`
     */
    width?: number;
    /**
     * Height of the output image. Maximum value: `2048`.
     * Default: `1024`
     */
    height?: number;
    /**
     * Placement of the attribution. Can also be set to `false` to not show attribution.
     * Default: `"bottomright"`
     */
    attribution?: "bottomright" | "bottomleft" | "topleft" | "topright" | false;
    /**
     * A marker or list of markers to show on the map
     * Default: none provided
     */
    marker?: StaticMapMarker | Array<StaticMapMarker>;
    /**
     * URL of the marker image. Applies only if one or multiple markers positions are provided.
     * Default: none provided
     */
    markerIcon?: string;
    /**
     * Position of the marker regarding its coordinates. Applies only:
     * - with a custom icon provided with `markerIcon`
     * - if one or multiple markers positions are provided.
     * Default: `"bottom"`
     */
    markerAnchor?: "top" | "left" | "bottom" | "right" | "center" | "topleft" | "bottomleft" | "topright" | "bottomright";
    /**
     * Draw a path or polygon on top of the map. If the path is too long it will be simplified, yet remaining accurate.
     * Default: none provided
     */
    path?: Array<LngLatArray>;
    /**
     * Color of the path line. The color must be CSS compatible.
     * Examples:
     * - long form hex without transparency `"#FF0000"` (red)
     * - short form hex without transparency `"#F00"` (red)
     * - long form hex with transparency `"#FF000008"` (red, half opacity)
     * - short form hex with transparency `"#F008"` (red, half opacity)
     * - CSS color shorthands: `"red"`, `"chartreuse"`, etc.
     * - decimal RGB values without transparency: `"rgb(128, 100, 255)"`
     * - decimal RGB values with transparency: `"rgb(128, 100, 255, 0.5)"`
     * Default: `"blue"`
     */
    pathStrokeColor?: string;
    /**
     * Color of the filling, also works if the polygon is not closed. The color must be CSS compatible.
     * Examples:
     * - long form hex without transparency `"#FF0000"` (red)
     * - short form hex without transparency `"#F00"` (red)
     * - long form hex with transparency `"#FF000008"` (red, half opacity)
     * - short form hex with transparency `"#F008"` (red, half opacity)
     * - CSS color shorthands: `"red"`, `"chartreuse"`, etc.
     * - decimal RGB values without transparency: `"rgb(128, 100, 255)"`
     * - decimal RGB values with transparency: `"rgb(128, 100, 255, 0.5)"`
     * Default: none (transparent filling)
     */
    pathFillColor?: string;
    /**
     * Width of the path line in pixel. It can be floating point precision (ex: `0.5`)
     * Default: `1` if `hiDPI` is `false` and `2` if `hiDPI` is `true`.
     */
    pathWidth?: number;
};
declare type CenteredStaticMapOptions = StaticMapBaseOptions;
declare type BoundedStaticMapOptions = StaticMapBaseOptions & {
    /**
     * Extra space added around the regio of interest, in percentage.
     * Default: `0.1` (for 10%)
     */
    padding?: number;
};
declare type AutomaticStaticMapOptions = BoundedStaticMapOptions;
declare type StaticMapMarker = {
    /**
     *
     */
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
declare function centered(center: LngLat, zoom: number, options?: CenteredStaticMapOptions): string;
/**
 * Construct the URL for a static map using a bounding box
 * Note: this function does not fetch the binary content of the image since
 * the purpose of a static map is generally to have its URL as a `src` property of a <img/> element.
 * @param boundingBox
 * @param options
 * @returns
 */
declare function bounded(boundingBox: Bbox, options?: BoundedStaticMapOptions): string;
/**
 * Construct the URL for a static map automatically fitted around the provided path or markers.
 * Note: this function does not fetch the binary content of the image since
 * the purpose of a static map is generally to have its URL as a `src` property of a <img/> element.
 * @param options
 * @returns
 */
declare function automatic(options?: AutomaticStaticMapOptions): string;
/**
 * The **staticMaps** namespace contains an synchronous function build image URL of static map, as specified by the [MapTiler Static Map API](https://docs.maptiler.com/cloud/api/static-maps/).
 * The URL of static maps can then be used within a `<img />` markup element, as the `src` property value.
 */
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

interface Config {
    apiToken: string;
    verbose: boolean;
    primaryLanguage: string | null;
    secondaryLanguage: string | null;
}
declare const config: Config;

declare enum languages {
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

declare enum units {
    METRIC = 0,
    IMPERIAL = 1
}

export { AutomaticStaticMapOptions, Bbox, BoundedStaticMapOptions, CenteredStaticMapOptions, CoordinatesSearchOptions, GeocoderOptions, LngLat, Map, MapOptions, ServiceError, config, coordinates, data, geocoder, geolocation, languages, staticMaps, units };
