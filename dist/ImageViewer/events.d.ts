import { Map } from '../Map';
import { default as ImageViewer } from './ImageViewer';
import { LngLat } from 'maplibre-gl';
export declare class ImageViewerEvent {
    readonly type: string;
    readonly target: ImageViewer;
    readonly originalEvent: MouseEvent | TouchEvent | WheelEvent | WebGLContextEvent | null;
    [key: string]: any;
    imageX: number;
    imageY: number;
    isOutOfBounds: boolean;
    constructor(type: string, viewer: ImageViewer, originalEvent?: MouseEvent | TouchEvent | WheelEvent | WebGLContextEvent | null, data?: Record<string, any>);
}
declare const BASE_MAP_EVENT_TYPES: readonly ["idle", "render", "load", "remove", "idle"];
declare const ERROR_EVENTS: readonly ["error"];
declare const RESIZE_EVENTS: readonly ["resize"];
declare const WEBGL_CONTEXT_EVENTS: readonly ["webglcontextlost", "webglcontextrestored"];
declare const CAMERA_EVENTS: readonly ["moveend", "movestart", "move", "zoomend", "zoomstart", "zoom", "rotatestart", "rotateend", "rotate", "dragstart", "dragend", "drag", "boxzoomcancel", "boxzoomend", "boxzoomstart"];
declare const UI_EVENTS: readonly ["click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseout", "mouseover", "contextmenu", "touchstart", "touchend", "touchmove", "touchcancel"];
declare const COOPERATIVE_GESTURE_EVENTS: readonly ["cooperativegestureprevented"];
declare const DATA_EVENTS: readonly ["data", "dataloading", "sourcedata", "sourcedataloading", "dataabort", "sourcedataabort"];
export declare const IMAGE_VIEWER_EVENT_TYPES: ("error" | "load" | "idle" | "remove" | "render" | "resize" | "webglcontextlost" | "webglcontextrestored" | "dataloading" | "data" | "sourcedataloading" | "sourcedata" | "dataabort" | "sourcedataabort" | "boxzoomcancel" | "boxzoomstart" | "boxzoomend" | "touchcancel" | "touchmove" | "touchend" | "touchstart" | "click" | "contextmenu" | "dblclick" | "mousemove" | "mouseup" | "mousedown" | "mouseout" | "mouseover" | "movestart" | "move" | "moveend" | "zoomstart" | "zoom" | "zoomend" | "rotatestart" | "rotate" | "rotateend" | "dragstart" | "drag" | "dragend" | "cooperativegestureprevented")[];
type BaseMapEventKeys = (typeof BASE_MAP_EVENT_TYPES)[number];
type UiEventKeys = (typeof UI_EVENTS)[number];
type CameraEventKeys = (typeof CAMERA_EVENTS)[number];
type ErrorEventKeys = (typeof ERROR_EVENTS)[number];
type ResizeEventKeys = (typeof RESIZE_EVENTS)[number];
type WebglContextEventKeys = (typeof WEBGL_CONTEXT_EVENTS)[number];
type DataEventKeys = (typeof DATA_EVENTS)[number];
type CooperativeGestureEventKeys = (typeof COOPERATIVE_GESTURE_EVENTS)[number];
export type ImageViewerEventTypes = BaseMapEventKeys | UiEventKeys | CameraEventKeys | ErrorEventKeys | ResizeEventKeys | WebglContextEventKeys | DataEventKeys | CooperativeGestureEventKeys | "imageviewerready" | "imagevieweriniterror" | "beforeremove";
type LngLatToPixel = (lngLat: LngLat) => [number, number];
interface SetupGlobalMapEventForwarderOptions {
    map: Map;
    viewer: ImageViewer;
    lngLatToPx: LngLatToPixel;
}
/**
 * Sets up event forwarding from Map to ImageViewer with proper categorization
 * @param {SetupGlobalMapEventForwarderOptions} options - The options for setting up the event forwarder.
 * @param {Map} options.map - The map to forward events from.
 * @param {ImageViewer} options.viewer - The viewer to forward events to.
 * @param {LngLatToPixel} options.lngLatToPx - A function to convert LngLat to pixel coordinates.
 * @returns {void}
 */
export declare function setupGlobalMapEventForwarder({ map, viewer, lngLatToPx }: SetupGlobalMapEventForwarderOptions): void;
export {};
