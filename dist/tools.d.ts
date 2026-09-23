import { default as maplibregl, RequestParameters, ResourceType, RequestTransformFunction } from 'maplibre-gl';
import { Map as MapSDK } from './Map';
export declare function enableRTL(customPluginURL?: string): Promise<void>;
export declare function bindAll(fns: Array<string>, context: any): void;
/**
 * This function is meant to be used as transformRequest by any Map instance created.
 * It adds the session ID as well as the MapTiler Cloud key from the config to all the requests
 * performed on MapTiler Cloud servers.
 */
export declare function maptilerCloudTransformRequest(url: string, resourceType?: ResourceType): RequestParameters;
/**
 * This combines a user-defined tranformRequest function (optionnal)
 * with the MapTiler Cloud-specific one: maptilerCloudTransformRequest
 */
export declare function combineTransformRequest(userDefinedRTF?: RequestTransformFunction | null): RequestTransformFunction;
/**
 * Generate a random string. Handy to create random IDs
 */
export declare function generateRandomString(): string;
/**
 * Check if a given string is in a uuid format
 */
export declare function isUUID(s: string): boolean;
/**
 * Attempt a JSON parse of a string but does not throw if the string is not valid JSON, returns `null` instead.
 */
export declare function jsonParseNoThrow<T>(doc: string): T | null;
/**
 * Simple function to check if an object is a GeoJSON
 */
export declare function isValidGeoJSON<T>(obj: T & {
    type: string;
}): boolean;
/**
 * This function tests if WebGL2 is supported. Since it can be for a different reasons that WebGL2 is
 * not supported but we do not have an action to take based on the reason, this function return null
 * if there is no error (WebGL is supported), or returns a string with the error message if WebGL2 is
 * not supported.
 */
export declare function getWebGLSupportError(): string | null;
/**
 * Display an error message in the Map div if WebGL2 is not supported
 */
export declare function displayNoWebGlWarning(container: HTMLElement | string): void;
/**
 * Display a warning message in the Map div if the WebGL context was lost
 */
export declare function displayWebGLContextLostWarning(map: MapSDK): void;
/**
 * In a text-field style property (as an object, not a string) the languages that are specified as
 * ["get", "name:XX"] are replaced by the proved replacer (also an object).
 * This replacement happened regardless of how deep in the object the flag is.
 * Note that it does not replace the occurences of ["get", "name"] (local names)
 */
export declare function changeFirstLanguage(origExpr: maplibregl.ExpressionSpecification, replacer: maplibregl.ExpressionSpecification, localized: boolean): maplibregl.ExpressionSpecification;
/**
 * If `localized` is `true`, it checks for the pattern "{name:xx}" (with "xx" being a language iso string).
 * If `localized` is `false`, it check for {name}.
 * In a exact way or is a loose way (such as "foo {name:xx}" or "foo {name} bar")
 */
export declare function checkNamePattern(str: string, localized: boolean): {
    contains: boolean;
    exactMatch: boolean;
};
/**
 * Replaces the occurences of {name:xx} in a string by a provided object-expression to return a concat object expression
 */
export declare function replaceLanguage(origLang: string, newLang: maplibregl.ExpressionSpecification, localized: boolean): maplibregl.ExpressionSpecification;
export declare function addFormatElevationExpressionFromString(expression: maplibregl.ExpressionSpecification | string): maplibregl.ExpressionSpecification | string;
/**
 * Find languages used in string label definition.
 * The returned array contains languages such as "en", "fr" but
 * can also contain null that stand for the use of {name}
 */
export declare function findLanguageStr(str: string): Array<string | null>;
/**
 * Find languages used in object label definition.
 * The returned array contains languages such as "en", "fr" but
 * can also contain null that stand for the use of {name}
 */
export declare function findLanguageObj(origExpr: maplibregl.ExpressionSpecification): Array<string | null>;
export declare function computeLabelsLocalizationMetrics(layers: maplibregl.LayerSpecification[], map: MapSDK): {
    unlocalized: number;
    localized: Record<string, number>;
};
