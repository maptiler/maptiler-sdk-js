import { MapDataEvent, MapMouseEvent, MapWheelEvent } from "../";
import { Map } from "../Map";
import ImageViewer from "./ImageViewer";
import type { LngLat, MapContextEvent, MapLibreEvent, MapTouchEvent } from "maplibre-gl";

export class ImageViewerEvent {
  readonly type: string;
  readonly target: ImageViewer;
  readonly originalEvent: MouseEvent | TouchEvent | WheelEvent | WebGLContextEvent | null;
  readonly data?: Record<string, any>;

  constructor(type: string, viewer: ImageViewer, originalEvent?: MouseEvent | TouchEvent | WheelEvent | WebGLContextEvent | null, data?: Record<string, any>) {
    this.type = type;
    this.target = viewer;
    this.originalEvent = originalEvent ?? null;
    this.data = data;
  }
}

const BASE_MAP_EVENT_TYPES = [
  // pass nothing other than target (map / viewer) and type
  "idle",
  "render",
  "load",
  "remove",

  "content",
  "visibility",
  "idle",
];

const ERROR_EVENTS = [
  "error", // ErrorEvent
];

const RESIZE_EVENTS = [
  "resize", // { type, target} & { 0: ResizeObserverEntry }
];

const WEBGL_CONTEXT_EVENTS = [
  // { type, target, originalEvent }: { type: string, target: Map, originalEvent: WebGLContextEvent }
  "webglcontextlost",
  "webglcontextrestored",
];

const CAMERA_EVENTS = [
  // { type, target, originalEvent }: { type: string, target: Map, originalEvent: MouseEvent | TouchEvent | WheelEvent | undefined }
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
  // ?
  "boxzoomcancel",
  "boxzoomend",
  "boxzoomstart",
];

const UI_EVENTS = [
  // { type, target, originalEvent }: { type: string, target: Map, originalEvent: MouseEvent | TouchEvent | WheelEvent | undefined }
  "click",
  "dblclick",
  "mousedown",
  "mouseup",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "mouseout",
  "mouseover",
  "contextmenu",
  "wheel",
  "touchstart",
  "touchend",
  "touchmove",
  "touchcancel",
];

const COOPERATIVE_GESTURE_EVENTS = ["cooperativegestureprevented"];

const DATA_EVENTS = [
  // MapDataEvent
  "metadata",
  "data",
  "dataloading",
  "sourcedata",
  "sourcedataloading",
  "dataabort",
  "sourcedataabort",
];

export const ALL_MAP_EVENT_TYPES = [
  ...BASE_MAP_EVENT_TYPES,
  ...ERROR_EVENTS,
  ...RESIZE_EVENTS,
  ...WEBGL_CONTEXT_EVENTS,
  ...CAMERA_EVENTS,
  ...UI_EVENTS,
  ...DATA_EVENTS,
  ...COOPERATIVE_GESTURE_EVENTS,
];

// Properties to exclude when forwarding events
const FORBIDDEN_EVENT_VALUES = ["lngLat"];

type LngLatToPixel = (lngLat: LngLat) => [number, number];

interface SetupGlobalMapEventForwarderOptions {
  map: Map;
  viewer: ImageViewer;
  lngLatToPx: LngLatToPixel;
}

/**
 * Sets up event forwarding from Map to ImageViewer with proper categorization
 */
export function setupGlobalMapEventForwarder({ map, viewer, lngLatToPx }: SetupGlobalMapEventForwarderOptions): void {
  ALL_MAP_EVENT_TYPES.forEach((eventType) => {
    try {
      map.on(eventType, (e: any) => {
        // Handle UI Events (mouse/touch interactions with coordinate transformation)
        if ([...UI_EVENTS, ...CAMERA_EVENTS].includes(eventType)) {
          if (e instanceof MapMouseEvent) {
            const event = e as MapMouseEvent | MapTouchEvent;
            const px = lngLatToPx(event.lngLat);
            const data = Object.entries(e).reduce(
              (acc, [key, value]) => {
                if (FORBIDDEN_EVENT_VALUES.includes(key)) {
                  return acc;
                }
                return {
                  ...acc,
                  [key]: value,
                };
              },
              {
                imageX: px[0],
                imageY: px[1],
              },
            );
            viewer.fire(new ImageViewerEvent(eventType, viewer, event.originalEvent, data));
          } else {
            const event = e as MapWheelEvent;
            // UI event without coordinates (eg fullscreen, resize)
            viewer.fire(new ImageViewerEvent(eventType, viewer, event.originalEvent));
          }
          return;
        }

        if (ERROR_EVENTS.includes(eventType)) {
          const event = e as ErrorEvent;
          viewer.fire(new ImageViewerEvent(eventType, viewer, null, event));
          return;
        }

        if (RESIZE_EVENTS.includes(eventType)) {
          const event = e as ResizeObserverEntry;
          viewer.fire(new ImageViewerEvent(eventType, viewer, null, event));
          return;
        }

        if (WEBGL_CONTEXT_EVENTS.includes(eventType)) {
          const event = e as MapContextEvent;
          viewer.fire(new ImageViewerEvent(eventType, viewer, event.originalEvent, event));
          return;
        }

        // Data Events
        // only pass data
        if (DATA_EVENTS.includes(eventType)) {
          const event = e as MapDataEvent;
          viewer.fire(new ImageViewerEvent(eventType, viewer, null, event));
          return;
        }

        // Handle Cooperative Gesture Events
        if (COOPERATIVE_GESTURE_EVENTS.includes(eventType)) {
          const event = e as MapLibreEvent<WheelEvent | TouchEvent>;
          viewer.fire(new ImageViewerEvent(eventType, viewer, null, event));
          return;
        }

        // Handle Base Map Events (no additional data)
        if (BASE_MAP_EVENT_TYPES.includes(eventType)) {
          viewer.fire(new ImageViewerEvent(eventType, viewer));
          return;
        }
      });
    } catch (e) {
      console.error("Error forwarding event", eventType, e);
    }
  });
}
