import { Alignment, Subscription, MarkerOptions, PointLike, Popup } from '../index';
import { default as MapLibreGL } from 'maplibre-gl';
import { default as ImageViewer } from './ImageViewer';
declare const Evented: typeof MapLibreGL.Evented;
export type ImageViewerMarkerOptions = MarkerOptions & {};
export interface ImageViewerMarkerInterface {
    on(event: MarkerEventTypes, listener: (e: ImageViewerMarkerEvent) => void): Subscription;
    off(event: MarkerEventTypes, listener: (e: ImageViewerMarkerEvent) => void): void;
    fire(event: ImageViewerMarkerEvent): void;
    getPosition(): [number, number];
    getOffset(): PointLike;
    getPitchAlignment(): Alignment;
    getPopup(): Popup;
    getRotation(): number;
    getRotationAlignment(): Alignment;
    isDraggable(): boolean;
    remove(): void;
    removeClassName(className: string): void;
    setDraggable(draggable: boolean): void;
    setPosition(px: [number, number]): void;
    setOffset(offset: PointLike): void;
    setOpacity(opacity?: string, opacityWhenCovered?: string): void;
    setPitchAlignment(pitchAlignment: Alignment): void;
    setPopup(popup: Popup): void;
    setRotation(rotation: number): void;
    setRotationAlignment(rotationAlignment: Alignment): void;
    setSubpixelPositioning(subpixelPositioning: boolean): void;
    toggleClassName(className: string): void;
    togglePopup(): void;
}
export declare class ImageViewerMarker extends Evented {
    private viewer;
    private readonly marker;
    private readonly position;
    constructor({ ...markerOptions }: ImageViewerMarkerOptions);
    /**
     * Adds the ImageViewerMarker to an instance of ImageViewer.
     *
     * @param {ImageViewer} viewer - The instance of ImageViewer to add the ImageViewerMarker to.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    addTo(viewer: ImageViewer): this;
    /**
     * Adds a class name to the ImageViewerMarker.
     *
     * @param {string} className - The class name to add to the ImageViewerMarker.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    addClassName(className: string): this;
    /**
     * Gets the element of the ImageViewerMarker.
     *
     * @returns {HTMLElement} The element of the ImageViewerMarker.
     */
    getElement(): HTMLElement;
    /**
     * Gets the position of the ImageViewerMarker.
     *
     * @returns {PointLike} The position of the ImageViewerMarker.
     * @see  [PointLike](https://docs.maptiler.com/sdk-js/api/geography/#pointlike)
     *
     */
    getPosition(): [number, number];
    /**
     * Gets the offset of the ImageViewerMarker.
     *
     * @returns {PointLike} The offset of the ImageViewerMarker.
     * @see  [PointLike](https://docs.maptiler.com/sdk-js/api/geography/#pointlike)
     */
    getOffset(): MapLibreGL.Point;
    /**
     * Gets the pitch alignment of the ImageViewerMarker.
     *
     * @returns {Alignment} The pitch alignment of the ImageViewerMarker.
     * @see  [MapLibreGL.Alignment](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/Alignment/)
     */
    getPitchAlignment(): Alignment;
    /**
     * Gets the popup of the ImageViewerMarker.
     *
     * @returns {Popup} The popup of the ImageViewerMarker.
     * @see [Popup](https://docs.maptiler.com/sdk-js/api/markers/#popup)
     */
    getPopup(): MapLibreGL.Popup;
    /**
     * Gets the rotation of the ImageViewerMarker.
     *
     * @returns {number} The rotation of the ImageViewerMarker.
     */
    getRotation(): number;
    /**
     * Gets the rotation alignment of the ImageViewerMarker.
     *
     * @returns {Alignment} The rotation alignment of the ImageViewerMarker.
     * @see  [MapLibreGL.Alignment](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/Alignment/)
     */
    getRotationAlignment(): Alignment;
    /**
     * Checks if the ImageViewerMarker is draggable.
     *
     * @returns {boolean} True if the ImageViewerMarker is draggable, false otherwise.
     */
    isDraggable(): boolean;
    /**
     * Fires an event on the ImageViewerMarker.
     *
     * @param {MarkerEventTypes | Event} event - The event to fire.
     * @param {Record<string, any>} data - The data to fire the event with.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    fire(event: MarkerEventTypes | Event, data?: Record<string, any>): this;
    /**
     * Removes an event listener from the ImageViewerMarker.
     *
     * @param {MarkerEventTypes} event - The event to remove the listener from.
     * @param {ImageViewerMarkerEvent} listener - The listener to remove.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    off(event: MarkerEventTypes, listener: (e: ImageViewerMarkerEvent) => void): this;
    /**
     * Adds an event listener to the ImageViewerMarker.
     *
     * @param {MarkerEventTypes} event - The event to add the listener to.
     * @param {ImageViewerMarkerEvent} listener - The listener to add.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    on(event: MarkerEventTypes, listener: (e: ImageViewerMarkerEvent) => void): Subscription;
    /**
     * Checks if the ImageViewerMarker is within the image bounds.
     *
     * @returns {boolean} True if the ImageViewerMarker is within the image bounds, false otherwise.
     */
    isWithinImageBounds(): boolean;
    /**
     * Removes the ImageViewerMarker from the ImageViewer and cleans up the event listeners.
     *
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    remove(): this;
    /**
     * Removes a class name from the ImageViewerMarker dom element.
     *
     * @param {string} className - The class name to remove from the ImageViewerMarker.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    removeClassName(className: string): this;
    /**
     * Sets the draggable state of the ImageViewerMarker.
     *
     * @param {boolean} draggable - The draggable state of the ImageViewerMarker.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    setDraggable(draggable: boolean): this;
    /**
     * Sets the position of the ImageViewerMarker.
     *
     * @param {[number, number]} px - The position of the ImageViewerMarker in image pixels.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    setPosition(px: [number, number]): this;
    /**
     * Sets the offset of the ImageViewerMarker.
     *
     * @param {PointLike} offset - The offset of the ImageViewerMarker.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    setOffset(offset: PointLike): this;
    /**
     * Sets the opacity of the ImageViewerMarker.
     *
     * @param {string} opacity - The opacity of the ImageViewerMarker.
     * @param {string} opacityWhenCovered - The opacity of the ImageViewerMarker when covered.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    setOpacity(opacity?: string, opacityWhenCovered?: string): this;
    /**
     * Sets the pitch alignment of the ImageViewerMarker.
     *
     * @param {Alignment} pitchAlignment - The pitch alignment of the ImageViewerMarker.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     * @see  [MapLibreGL.Alignment](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/Alignment/)
     */
    setPitchAlignment(pitchAlignment: Alignment): this;
    /**
     * Sets the popup of the ImageViewerMarker.
     *
     * @param {Popup} popup - The popup of the ImageViewerMarker.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     * @see [Popup](https://docs.maptiler.com/sdk-js/api/markers/#popup)
     */
    setPopup(popup: Popup): this;
    /**
     * Sets the rotation of the ImageViewerMarker.
     *
     * @param {number} rotation - The rotation of the ImageViewerMarker.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    setRotation(rotation: number): this;
    /**
     * Sets the rotation alignment of the ImageViewerMarker.
     *
     * @param {Alignment} rotationAlignment - The rotation alignment of the ImageViewerMarker.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     * @see  [MapLibreGL.Alignment](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/Alignment/)
     */
    setRotationAlignment(rotationAlignment: Alignment): this;
    /**
     * Sets if subpixel positioning is enabled for the ImageViewerMarker.
     *
     * @param {boolean} subpixelPositioning - The subpixel positioning of the ImageViewerMarker.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    setSubpixelPositioning(subpixelPositioning: boolean): this;
    /**
     * Toggles a class name on the ImageViewerMarker dom element.
     *
     * @param {string} className - The class name to toggle on the ImageViewerMarker.
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    toggleClassName(className: string): this;
    /**
     * Toggles the popup of the ImageViewerMarker.
     *
     * @returns {ImageViewerMarker} The ImageViewerMarker instance.
     */
    togglePopup(): this;
}
declare const MARKER_EVENT_TYPES: readonly ["dragstart", "drag", "dragend"];
type MarkerEventTypes = (typeof MARKER_EVENT_TYPES)[number];
export declare class ImageViewerMarkerEvent {
    readonly type: string;
    readonly target: ImageViewerMarker;
    [key: string]: any;
    constructor(type: MarkerEventTypes, marker: ImageViewerMarker, data: Record<string, any>);
}
export {};
