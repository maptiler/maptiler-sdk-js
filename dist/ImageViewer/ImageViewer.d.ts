import { default as MaplibreGL } from 'maplibre-gl';
import { EaseToOptions, DoubleClickZoomHandler, DragPanHandler, TwoFingersTouchZoomRotateHandler, FlyToOptions, MapOptions, JumpToOptions, ScrollZoomHandler, BoxZoomHandler, KeyboardHandler, CooperativeGesturesHandler, LngLat, MapDataEvent, PointLike } from '..';
import { Map } from '../Map';
import { ImageViewerFitImageToBoundsControl } from '../controls/ImageViewerFitImageToBoundsControl';
import { lngLatToPxInternalSymbolKey, pxToLngLatInternalSymbolKey } from './symbols';
declare const Evented: typeof MaplibreGL.Evented;
export type AllowedConstructorOptions = "container" | "apiKey" | "maxZoom" | "minZoom" | "zoom" | "bearing";
export type ImageViewerFlyToOptions = Omit<FlyToOptions, "pitch"> & {
    center: [number, number];
};
export type ImageViewerJumpToOptions = Omit<JumpToOptions, "pitch"> & {
    center: [number, number];
};
export type ImageViewerEaseToOptions = Omit<EaseToOptions, "pitch"> & {
    center: [number, number];
};
export type ImageViewerConstructorOptions = Pick<MapOptions, AllowedConstructorOptions> & {
    /**
     * The UUID of the image.
     */
    imageUUID: string;
    /**
     * Whether to show debug information.
     */
    debug?: boolean;
    /**
     * The center of the image.
     */
    center?: [number, number];
    /**
     * Whether to show a control to fit the image to the viewport.
     */
    fitToBoundsControl?: boolean;
    /**
     * Whether to show a navigation control.
     */
    navigationControl?: boolean;
};
/**
 * The metadata of the image. This is the shape of the response from the API.
 * And used to convert px to lnglat and vice versa.
 */
export type ImageMetadata = {
    id: string;
    description: string;
    attribution: string;
    width: number;
    height: number;
    minzoom: number;
    maxzoom: number;
    tileSize: number;
};
export default class ImageViewer extends Evented {
    /**
     * The UUID of the image.
     *
     * @internal
     */
    private imageUUID;
    /**
     * Whether to enable debug mode.
     *
     * @internal
     */
    private debug;
    /**
     * The metadata of the image.
     *
     */
    private imageMetadata?;
    /**
     * Why not extend the Map class?
     * Because ImageViewer technically operates in screen space and not in map space.
     * We wrap map and perform calculations in screen space.
     * We do not want to have to extend the Map class and give access to
     * methods and properties that operate in LngLat space.   *
     */
    private sdk;
    /**
     * The options for the ImageViewer.
     *
     * @internal
     */
    private options;
    /**
     * The size of the image.
     *
     * @internal
     */
    private imageSize?;
    /**
     * The padded size max.
     *
     * @internal
     */
    private paddedSizeMax?;
    /**
     * The version of the ImageViewer / SDK.
     */
    get version(): string;
    /**
     * The control to fit the image to the viewport.
     */
    fitToBoundsControlInstance: ImageViewerFitImageToBoundsControl;
    /**
     * The constructor for the ImageViewer.
     *
     * @param {Partial<ImageViewerConstructorOptions>} imageViewerConstructorOptions - The options for the ImageViewer.
     * @example
     * ```ts
     * import "@maptiler/sdk/dist/maptiler-sdk.css"; // import css
     * import { ImageViewer } from "@maptiler/sdk"; // import the sdk
     *
     * const imageViewer = new ImageViewer({
     *   container: document.getElementById("map"),
     *   imageUUID: "01986025-ceb9-7487-9ea6-7a8637dcc1a1",
     *   debug: true, // show tile boundaries, padding, collision boxes etc
     *   fitToBoundsControl: true, // show a control to fit the image to the viewport
     *   navigationControl: true, // show a navigation control
     *   center: [0, 0], // center in pixels
     *   zoom: 1, // zoom level
     *   bearing: 0, // bearing
     * });
     * ```
     */
    constructor(imageViewerConstructorOptions: Partial<ImageViewerConstructorOptions>);
    /**
     * Waits for the ImageViewer to be ready.
     *
     * @returns {Promise<void>}
     */
    onReadyAsync(): Promise<void>;
    shouldFitImageToViewport: boolean;
    /**
     * Initializes the ImageViewer
     *  - fetches the image metadata
     *  - adds the image source to the sdk instance
     *  - sets the center to the middle of the image (if center is not provided)
     *  - monkeypatches the maplibre-gl sdk transform method to allow for overpanning and underzooming.
     *  - sets up global event forwarding / intercepting from the map instance
     *  - sets the center to the middle of the image (if center is not provided)
     *
     * @internal
     * @returns {Promise<void>}
     */
    private init;
    /**
     * Fits the image to the viewport.
     *
     * @param {Object} options - The options for the fit image to viewport.
     * @param {boolean} options.ease - Whether to ease to the viewport bounds.
     */
    fitImageToViewport({ ease }?: {
        ease?: boolean;
    }): void;
    /**
     * Fetches the image metadata from the API.
     *
     * @internal
     * @returns {Promise<void>}
     */
    private fetchImageMetadata;
    /**
     * Adds the image source to the sdk instance.
     *
     * @internal
     * @returns {void}
     */
    private addImageSource;
    /**
     * Triggers a repaint of the ImageViewer. Same as map.triggerRepaint().
     *
     * @internal
     * @returns {void}
     */
    triggerRepaint(): void;
    /**
     * The scroll zoom handler.
     *
     * @internal
     * @returns {ScrollZoomHandler}
     */
    get scrollZoom(): ScrollZoomHandler;
    /**
     * The scroll zoom handler.
     *
     * @internal
     * @param {ScrollZoomHandler} value - The scroll zoom handler.
     */
    set scrollZoom(value: ScrollZoomHandler);
    /**
     * The box zoom handler.
     *
     * @internal
     * @returns {BoxZoomHandler}
     */
    get boxZoom(): BoxZoomHandler;
    /**
     * The box zoom handler.
     *
     * @internal
     * @param {BoxZoomHandler} value - The box zoom handler.
     */
    set boxZoom(value: BoxZoomHandler);
    /**
     * The drag pan handler.
     *
     * @internal
     * @returns {DragPanHandler}
     */
    get dragPan(): DragPanHandler;
    /**
     * The drag pan handler.
     *
     * @internal
     * @param {DragPanHandler} value - The drag pan handler.
     */
    set dragPan(value: DragPanHandler);
    /**
     * The keyboard handler.
     *
     * @internal
     * @returns {KeyboardHandler}
     */
    get keyboard(): KeyboardHandler;
    /**
     * The keyboard handler.
     *
     * @internal
     * @param {KeyboardHandler} value - The keyboard handler.
     */
    set keyboard(value: KeyboardHandler);
    /**
     * The double click zoom handler.
     *
     * @internal
     * @returns {DoubleClickZoomHandler}
     */
    get doubleClickZoom(): DoubleClickZoomHandler;
    /**
     * The double click zoom handler.
     *
     * @internal
     * @param {DoubleClickZoomHandler} value - The double click zoom handler.
     */
    set doubleClickZoom(value: DoubleClickZoomHandler);
    /**
     * The touch zoom rotate handler.
     *
     * @internal
     * @returns {TwoFingersTouchZoomRotateHandler}
     */
    get touchZoomRotate(): TwoFingersTouchZoomRotateHandler;
    /**
     * The touch zoom rotate handler.
     *
     * @internal
     * @param {TwoFingersTouchZoomRotateHandler} value - The touch zoom rotate handler.
     */
    set touchZoomRotate(value: TwoFingersTouchZoomRotateHandler);
    /**
     * The cooperative gestures handler.
     *
     * @internal
     * @returns {CooperativeGesturesHandler}
     */
    get cooperativeGestures(): CooperativeGesturesHandler;
    /**
     * The cooperative gestures handler.
     *
     * @internal
     * @param {CooperativeGesturesHandler} value - The cooperative gestures handler.
     */
    set cooperativeGestures(value: CooperativeGesturesHandler);
    /**
     * Converts a LngLat to a px coordinate, based on the image metadata.
     *
     * @internal
     * @param {LngLat} lngLat - The LngLat to convert.
     * @returns {[number, number]} The px coordinate.
     */
    private lngLatToPx;
    /**
     * Converts a px coordinate to a LngLat, based on the image metadata.
     *
     * @internal
     * @param {LngLat} lngLat - The LngLat to convert.
     * @returns {[number, number]} The px coordinate.
     */
    private pxToLngLat;
    /**
     * Get the internal SDK instance.
     *
     * @returns {Map} The internal SDK instance.
     * @internal
     */
    getSDKInternal(): Map;
    /**
     * Get the canvas of the internal SDK instance.
     *
     * @returns {HTMLCanvasElement} The canvas of the internal SDK instance.
     */
    getCanvas(): HTMLCanvasElement;
    /**
     * Fly to a given center.
     *
     * @param {ImageViewerFlyToOptions} options - The options for the fly to.
     * @param {MapDataEvent} eventData - The event data.
     * @returns {ImageViewer} The ImageViewer instance.
     */
    flyTo(options: ImageViewerFlyToOptions, eventData?: MapDataEvent): this;
    /**
     * Jump to a given center.
     *
     * @param {ImageViewerJumpToOptions} options - The options for the jump to.
     * @param {MapDataEvent} eventData - The event data.
     * @returns {ImageViewer} The ImageViewer instance.
     */
    jumpTo(options: ImageViewerJumpToOptions, eventData?: MapDataEvent): this;
    /**
     * Set the zoom level.
     *
     * @param {number} zoom - The zoom level.
     * @returns {ImageViewer} The ImageViewer instance.
     */
    setZoom(zoom: number): this;
    /**
     * Get the zoom level.
     *
     * @returns {number} The zoom level.
     */
    getZoom(): number;
    /**
     * Get the center of the ImageViewer in pixels.
     *
     * @internal
     * @returns {[number, number]} The center of the ImageViewer.
     */
    getCenter(): [number, number];
    /**
     * Set the center of the ImageViewer in pixels.
     *
     * @param {number} center - The center of the ImageViewer.
     * @returns {ImageViewer} The ImageViewer instance.
     */
    setCenter(center: [number, number]): this;
    /**
     * Set the bearing of the ImageViewer in degrees.
     *
     * @param {number} bearing - The bearing of the ImageViewer.
     * @returns {ImageViewer} The ImageViewer instance.
     */
    setBearing(bearing: number): this;
    /**
     * Get the bearing of the ImageViewer in degrees.
     *
     * @returns {number} The bearing of the ImageViewer.
     */
    getBearing(): number;
    /**
     * Pan by a given delta in pixels.
     *
     * @param {PointLike} delta - The delta to pan by.
     * @param {ImageViewerEaseToOptions} options - The options for the pan.
     * @param {any} eventData - The event data.
     * @returns {ImageViewer} The ImageViewer instance.
     */
    panBy(delta: PointLike, options?: ImageViewerEaseToOptions, eventData?: any): this;
    /**
     * Pan to a given center in pixels.
     *
     * @param {number} center - The center to pan to.
     * @param {ImageViewerEaseToOptions} options - The options for the pan.
     * @param {any} eventData - The event data.
     * @returns {ImageViewer} The ImageViewer instance.
     */
    panTo(center: [number, number], options?: ImageViewerEaseToOptions, eventData?: any): this;
    /**
     * Get the image metadata.
     *
     * @returns {ImageMetadata} The image metadata.
     */
    getImageMetadata(): ImageMetadata | undefined;
    /**
     * Get the visible bounds of the image in the viewport in imagePixels.
     * [topLeft, bottomRight]
     *
     * @returns {[[number, number], [number, number]]} The visible bounds of the image.
     */
    getImageBounds(): number[][];
    /**
     * Set the bounds of the image.
     *
     * @param {[[number, number], [number, number]]} bounds - The bounds of the image.
     * @returns {ImageViewer} The ImageViewer instance.
     */
    fitImageBounds([tl, br]: [[number, number], [number, number]]): this;
    /**
     * Destroys the ImageViewer, removes the map instance and all event listeners. Useful for cleanup.
     *
     * @returns {ImageViewer} The ImageViewer instance.
     */
    remove(): void;
    pointIsWithinImageBounds(px: [number, number]): boolean;
    [lngLatToPxInternalSymbolKey]: (lngLat: LngLat) => [number, number];
    [pxToLngLatInternalSymbolKey]: (px: [number, number]) => LngLat;
}
export {};
