import { ReferenceMapStyle, MapStyleVariant } from '@maptiler/client';
export declare function styleToStyle(style: string | ReferenceMapStyle | MapStyleVariant | maplibregl.StyleSpecification | null | undefined): {
    style: string | maplibregl.StyleSpecification;
    requiresUrlMonitoring: boolean;
    isFallback: boolean;
    isJSON?: boolean;
};
/**
 * makes sure a URL is absolute
 */
export declare function urlToAbsoluteUrl(url: string): string;
type StyleValidationReport = {
    isValidJSON: boolean;
    isValidStyle: boolean;
    styleObject: maplibregl.StyleSpecification | null;
};
export declare function convertStringToStyleSpecification(str: string): StyleValidationReport;
/**
 * Derives the MapTiler style id (e.g. `"streets-v4-dark"`) from a style input,
 * without expanding or fetching it.
 * Returns `undefined` for custom `StyleSpecification`s and URLs that don't
 * follow the MapTiler Cloud `/maps/<id>/style.json` shape.
 */
export declare function styleToStyleId(style: string | ReferenceMapStyle | MapStyleVariant | maplibregl.StyleSpecification | null | undefined): string | undefined;
export {};
