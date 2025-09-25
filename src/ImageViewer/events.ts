import { Map } from "../Map";
import ImageViewer from "./ImageViewer";
import type { LngLat, MapEventType } from "maplibre-gl";

export class ImageViewerEvent {
  readonly type: string;
  readonly target: ImageViewer;
  readonly originalEvent: MouseEvent | TouchEvent | WheelEvent | WebGLContextEvent | null;

  [key: string]: any;

  imageX!: number;
  imageY!: number;
  isOutOfBounds!: boolean;

  constructor(type: string, viewer: ImageViewer, originalEvent?: MouseEvent | TouchEvent | WheelEvent | WebGLContextEvent | null, data: Record<string, any> = {}) {
    this.type = type;
    this.target = viewer;
    this.originalEvent = originalEvent ?? null;

    Object.assign(this, data);
  }
}

const BASE_MAP_EVENT_TYPES = [
  // pass nothing other than target (map / viewer) and type
  "idle",
  "render",
  "load",
  "remove",
  "idle",

  // these are fired on layers, not the map,
  // keeping them for reference
  // "content",
  // "visibility",
] as const;

const ERROR_EVENTS = [
  "error", // ErrorEvent
] as const;

const RESIZE_EVENTS = ["resize"] as const;

const WEBGL_CONTEXT_EVENTS = ["webglcontextlost", "webglcontextrestored"] as const;

const CAMERA_EVENTS = [
  "moveend",
  "movestart",
  "move",
  "zoomend",
  "zoomstart",
  "zoom",
  "rotatestart",
  "rotateend",
  "rotate",
  "dragstart",
  "dragend",
  "drag",
  "boxzoomcancel",
  "boxzoomend",
  "boxzoomstart",
] as const;

const UI_EVENTS = ["click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseout", "mouseover", "contextmenu", "touchstart", "touchend", "touchmove", "touchcancel"] as const;

const COOPERATIVE_GESTURE_EVENTS = ["cooperativegestureprevented"] as const;

const DATA_EVENTS = [
  "data",
  "dataloading",
  "sourcedata",
  "sourcedataloading",
  "dataabort",
  "sourcedataabort",
  // this is fired on layers, not the map
  // keeping it for reference
  // "metadata",
] as const;

export const IMAGE_VIEWER_EVENT_TYPES = [
  ...BASE_MAP_EVENT_TYPES,
  ...ERROR_EVENTS,
  ...RESIZE_EVENTS,
  ...WEBGL_CONTEXT_EVENTS,
  ...CAMERA_EVENTS,
  ...UI_EVENTS,
  ...DATA_EVENTS,
  ...COOPERATIVE_GESTURE_EVENTS,
];

type BaseMapEventKeys = (typeof BASE_MAP_EVENT_TYPES)[number];
type UiEventKeys = (typeof UI_EVENTS)[number];
type CameraEventKeys = (typeof CAMERA_EVENTS)[number];
type ErrorEventKeys = (typeof ERROR_EVENTS)[number];
type ResizeEventKeys = (typeof RESIZE_EVENTS)[number];
type WebglContextEventKeys = (typeof WEBGL_CONTEXT_EVENTS)[number];
type DataEventKeys = (typeof DATA_EVENTS)[number];
type CooperativeGestureEventKeys = (typeof COOPERATIVE_GESTURE_EVENTS)[number];

export type ImageViewerEventTypes =
  | BaseMapEventKeys
  | UiEventKeys
  | CameraEventKeys
  | ErrorEventKeys
  | ResizeEventKeys
  | WebglContextEventKeys
  | DataEventKeys
  | CooperativeGestureEventKeys
  | "imageviewerready"
  | "imagevieweriniterror"
  | "beforedestroy";

// Properties to exclude when forwarding events
const FORBIDDEN_EVENT_VALUES = ["lngLat", "_defaultPrevented"];

type LngLatToPixel = (lngLat: LngLat) => [number, number];

interface SetupGlobalMapEventForwarderOptions {
  map: Map;
  viewer: ImageViewer;
  lngLatToPx: LngLatToPixel;
}

type ImageViewerEventData<T extends keyof MapEventType> = {
  isOutOfBounds: boolean;
  imageX: number;
  imageY: number;
} & Partial<MapEventType[T]>;

/**
 * Sets up event forwarding from Map to ImageViewer with proper categorization
 * @param {SetupGlobalMapEventForwarderOptions} options - The options for setting up the event forwarder.
 * @param {Map} options.map - The map to forward events from.
 * @param {ImageViewer} options.viewer - The viewer to forward events to.
 * @param {LngLatToPixel} options.lngLatToPx - A function to convert LngLat to pixel coordinates.
 * @returns {void}
 */
export function setupGlobalMapEventForwarder({ map, viewer, lngLatToPx }: SetupGlobalMapEventForwarderOptions): void {
  IMAGE_VIEWER_EVENT_TYPES.forEach((eventType: Exclude<ImageViewerEventTypes, "imageviewerready" | "imagevieweriniterror">) => {
    try {
      map.on(eventType, (e: MapEventType[Exclude<ImageViewerEventTypes, "imageviewerready" | "imagevieweriniterror" | "beforedestroy">]) => {
        // Handle UI Events (mouse/touch interactions with coordinate transformation)
        const uiEventName = eventType as UiEventKeys;
        if (UI_EVENTS.includes(uiEventName)) {
          const event = e as MapEventType[UiEventKeys];
          const px = event.lngLat && lngLatToPx(event.lngLat);
          const imageMetadata = viewer.getImageMetadata();

          const isOutOfBounds = imageMetadata ? px[0] < 0 || px[0] > imageMetadata.width || px[1] < 0 || px[1] > imageMetadata.height : true;

          const data: ImageViewerEventData<UiEventKeys> = {
            isOutOfBounds,
            imageX: px[0],
            imageY: px[1],
            ...Object.fromEntries(Object.entries(e).filter(([key]) => !FORBIDDEN_EVENT_VALUES.includes(key))),
          };

          viewer.fire(new ImageViewerEvent(eventType, viewer, event.originalEvent, data));

          return;
        }

        // CAMERA_EVENTS
        const cameraEventName = eventType as CameraEventKeys;
        if (CAMERA_EVENTS.includes(cameraEventName)) {
          const event = e as MapEventType[CameraEventKeys];
          viewer.fire(new ImageViewerEvent(eventType, viewer, event.originalEvent, event));
          return;
        }

        // ERROR_EVENTS
        const errorEventName = eventType as ErrorEventKeys;
        if (ERROR_EVENTS.includes(errorEventName)) {
          const event = e as MapEventType[ErrorEventKeys];
          viewer.fire(new ImageViewerEvent(eventType, viewer, null, event));
          return;
        }

        // RESIZE_EVENTS
        const resizeEventName = eventType as ResizeEventKeys;
        if (RESIZE_EVENTS.includes(resizeEventName)) {
          const event = e as MapEventType[ResizeEventKeys];
          viewer.fire(new ImageViewerEvent(eventType, viewer, null, event));
          return;
        }

        // WEBGL_CONTEXT_EVENTS
        const webglContextEventName = eventType as WebglContextEventKeys;
        if (WEBGL_CONTEXT_EVENTS.includes(webglContextEventName)) {
          const event = e as MapEventType[WebglContextEventKeys];
          viewer.fire(new ImageViewerEvent(eventType, viewer, event.originalEvent, event));
          return;
        }

        // Data Events
        // only pass data
        const dataEventName = eventType as DataEventKeys;
        if (DATA_EVENTS.includes(dataEventName)) {
          const event = e as MapEventType[DataEventKeys];
          viewer.fire(new ImageViewerEvent(eventType, viewer, null, event));
          return;
        }

        // Handle Cooperative Gesture Events
        const cooperativeGestureEventName = eventType as CooperativeGestureEventKeys;
        if (COOPERATIVE_GESTURE_EVENTS.includes(cooperativeGestureEventName)) {
          const event = e as MapEventType[CooperativeGestureEventKeys];
          viewer.fire(new ImageViewerEvent(eventType, viewer, null, event));
          return;
        }

        // Handle Base Map Events (no additional data)
        const baseMapEventName = eventType as BaseMapEventKeys;
        if (BASE_MAP_EVENT_TYPES.includes(baseMapEventName)) {
          viewer.fire(new ImageViewerEvent(eventType, viewer));
          return;
        }
      });
    } catch (e) {
      console.error(`Error forwarding event to ImageViewer, event of type "${eventType}" is not supported`, e);
    }
  });
}
