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
 * Map constructor
 */
declare class Map extends maplibre.Map {
    private attributionMustDisplay;
    private attibutionLogoUrl;
    private super_setStyle;
    constructor(options: MapOptions);
    setStyle(style: maplibre.StyleSpecification | string | null, options?: StyleSwapOptions & maplibre.StyleOptions): this;
    setPrimaryLanguage(language?: string): void;
    setSecondaryLanguage(language?: string): void;
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
    primaryLanguage: string | null;
    secondaryLanguage: string | null;
}
declare const config: ConfigInterface;

declare const languages: {
    AFAR: string;
    ABKHAZIAN: string;
    AVESTAN: string;
    AFRIKAANS: string;
    AKAN: string;
    AMHARIC: string;
    ARAGONESE: string;
    ARABIC: string;
    ASSAMESE: string;
    AVARIC: string;
    AYMARA: string;
    AZERBAIJANI: string;
    BASHKIR: string;
    BELARUSIAN: string;
    BULGARIAN: string;
    BIHARI: string;
    BISLAMA: string;
    BAMBARA: string;
    BENGALI: string;
    TIBETAN: string;
    BRETON: string;
    BOSNIAN: string;
    CATALAN: string;
    CHECHEN: string;
    CHAMORRO: string;
    CORSICAN: string;
    CREE: string;
    CZECH: string;
    CHURCH_SLAVIC: string;
    CHUVASH: string;
    WELSH: string;
    DANISH: string;
    GERMAN: string;
    MALDIVIAN: string;
    DZONGKHA: string;
    EWE: string;
    GREEK: string;
    ENGLISH: string;
    ESPERANTO: string;
    SPANISH: string;
    ESTONIAN: string;
    BASQUE: string;
    PERSIAN: string;
    FULAH: string;
    FINNISH: string;
    FIJIAN: string;
    FAROESE: string;
    FRENCH: string;
    WESTERN_FRISIAN: string;
    IRISH: string;
    GAELIC: string;
    GALICIAN: string;
    GUARANI: string;
    GUJARATI: string;
    MANX: string;
    HAUSA: string;
    HEBREW: string;
    HINDI: string;
    HIRI_MOTU: string;
    CROATIAN: string;
    HAITIAN: string;
    HUNGARIAN: string;
    ARMENIAN: string;
    HERERO: string;
    INTERLINGUA: string;
    INDONESIAN: string;
    INTERLINGUE: string;
    IGBO: string;
    "SICHUAN YI": string;
    INUPIAQ: string;
    IDO: string;
    ICELANDIC: string;
    ITALIAN: string;
    INUKTITUT: string;
    JAPANESE: string;
    JAVANESE: string;
    GEORGIAN: string;
    KONGO: string;
    KIKUYU: string;
    KUANYAMA: string;
    KAZAKH: string;
    KALAALLISUT: string;
    "CENTRAL KHMER": string;
    KANNADA: string;
    KOREAN: string;
    KANURI: string;
    KASHMIRI: string;
    KURDISH: string;
    KOMI: string;
    CORNISH: string;
    KIRGHIZ: string;
    LUXEMBOURGISH: string;
    GANDA: string;
    LIMBURGAN: string;
    LINGALA: string;
    LAO: string;
    LITHUANIAN: string;
    "LUBA-KATANGA": string;
    LATVIAN: string;
    MALAGASY: string;
    MARSHALLESE: string;
    MAORI: string;
    MACEDONIAN: string;
    MALAYALAM: string;
    MONGOLIAN: string;
    MARATHI: string;
    MALAY: string;
    MALTESE: string;
    BURMESE: string;
    NAURU: string;
    NORWEGIAN: string;
    "NORTH NDEBELE": string;
    NEPALI: string;
    NDONGA: string;
    DUTCH: string;
    SOUTH_NDEBELE: string;
    NAVAJO: string;
    CHICHEWA: string;
    OCCITAN: string;
    OJIBWA: string;
    OROMO: string;
    ORIYA: string;
    OSSETIC: string;
    PANJABI: string;
    PALI: string;
    POLISH: string;
    PUSHTO: string;
    PORTUGUESE: string;
    QUECHUA: string;
    ROMANSH: string;
    RUNDI: string;
    ROMANIAN: string;
    RUSSIAN: string;
    KINYARWANDA: string;
    SANSKRIT: string;
    SARDINIAN: string;
    SINDHI: string;
    "NORTHERN SAMI": string;
    SANGO: string;
    SINHALA: string;
    SLOVAK: string;
    SLOVENIAN: string;
    SAMOAN: string;
    SHONA: string;
    SOMALI: string;
    ALBANIAN: string;
    SERBIAN: string;
    SWATI: string;
    SOTHO_SOUTHERN: string;
    SUNDANESE: string;
    SWEDISH: string;
    SWAHILI: string;
    TAMIL: string;
    TELUGU: string;
    TAJIK: string;
    THAI: string;
    TIGRINYA: string;
    TURKMEN: string;
    TAGALOG: string;
    TSWANA: string;
    TONGA: string;
    TURKISH: string;
    TSONGA: string;
    TATAR: string;
    TWI: string;
    TAHITIAN: string;
    UIGHUR: string;
    UKRAINIAN: string;
    URDU: string;
    UZBEK: string;
    VENDA: string;
    VIETNAMESE: string;
    VOLAPUK: string;
    WALLOON: string;
    WOLOF: string;
    XHOSA: string;
    YIDDISH: string;
    YORUBA: string;
    ZHUANG: string;
    CHINESE: string;
    ZULU: string;
    LATIN: string;
    NON_LATIN: string;
};

export { Map, MapOptions, ServiceError, automaticStaticMapOptionsType, bboxType, boundedStaticMapOptionsType, centeredStaticMapOptionsType, config, coordinates, coordinatesSearchOptionsType, data, geocoder, geocoderOptionsType, geolocation, languages, lngLatType, staticMaps };
