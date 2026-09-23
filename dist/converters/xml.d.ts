export interface Link {
    href: string | null;
}
export interface XMLProperties {
    links?: Link[];
}
export interface PlacemarkProperties {
    name?: string;
    address?: string;
    styleUrl?: string;
    description?: string;
    styleHash?: string;
    styleMapHash?: Record<string, string | null>;
    timespan?: {
        begin: string;
        end: string;
    };
    timestamp?: string;
    stroke?: string;
    "stroke-opacity"?: number;
    "stroke-width"?: number;
    fill?: string;
    "fill-opacity"?: number;
    visibility?: string;
    icon?: string;
    coordTimes?: (string | null)[] | (string | null)[][];
}
/**
 * create a function that converts a string to XML
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 */
export declare function str2xml(str: string): Document;
/**
 * Check one of the top level child node is of a given type ("gpx", "kml").
 * The check is not case sensitive.
 * @param doc
 * @param nodeName
 * @returns
 */
export declare function hasChildNodeWithName(doc: Document, nodeName: string): boolean;
/**
 * create a function that converts a XML to a string
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer
 */
export declare function xml2str(node: Node): string;
/**
 * Given a XML document using the GPX spec, return GeoJSON
 */
export declare function gpx(doc: string | Document): GeoJSON.FeatureCollection;
/**
 * Given a XML document using the KML spec, return GeoJSON
 */
export declare function kml(doc: string | Document, xml2string?: (node: Node) => string): GeoJSON.FeatureCollection;
export declare function gpxOrKml(doc: string | Document): GeoJSON.FeatureCollection | null;
