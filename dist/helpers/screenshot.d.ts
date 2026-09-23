import { Map as MapSDK } from '../Map';
/**
 * Takes a screenshot (PNG file) of the curent map view.
 * Depending on the options, this function can automatically trigger a download of te file.
 */
export declare function takeScreenshot(map: MapSDK, options?: {
    /**
     * If `true`, this function will trigger a download in addition to returning a blob.
     * Default: `false`
     */
    download?: boolean;
    /**
     * Only if `options.download` is `true`. Indicates the filename under which
     * the file will be downloaded.
     * Default: `"maptiler_screenshot.png"`
     */
    filename?: string;
}): Promise<Blob>;
