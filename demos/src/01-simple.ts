import { Map, MapStyle, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map")!;

const map = new Map({
  container,
  style: MapStyle.OUTDOOR.DARK,
  hash: true,
  geolocate: true,
  scaleControl: true,
  fullscreenControl: true,
  terrainControl: true,
  projectionControl: true,
});

window.__map = map;

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

// export type MapContextEvent = {
//   	type: "webglcontextlost" | "webglcontextrestored";
//   originalEvent: WebGLContextEvent;
//   };

const WEBGL_CONTEXT_EVENTS = [
  "webglcontextlost", 
  "webglcontextrestored",
]

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
  // ?
  "boxzoomcancel",
  "boxzoomend",
  "boxzoomstart",
];

const UI_EVENTS = [ // all have originalEvent
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

  "cooperativegestureprevented",
  "fullscreenchange", // doesn't seem to be fired ?
  "fullscreenerror", // doesn't seem to be fired ?
];

const DATA_EVENTS = [
  // Data events
  "metadata",
  "data",
  "dataloading",
  "sourcedata",
  "sourcedataloading",
  "dataabort",
  "sourcedataabort",
];

const ALL_MAP_EVENT_TYPES = [
  // ...BASE_MAP_EVENT_TYPES,
  // ...ERROR_EVENTS,
  ...RESIZE_EVENTS,
  // ...WEBGL_CONTEXT_EVENTS,
  // ...CAMERA_EVENTS,
  // ...UI_EVENTS,
  // ...DATA_EVENTS,
];

ALL_MAP_EVENT_TYPES.forEach((eventType) => {
  map.on(eventType, (e) => {
    console.log(eventType, e);
  });
});

const styleDropDown = document.getElementById("mapstyles-picker") as HTMLOptionElement;

styleDropDown.onchange = () => {
  map.setStyle(styleDropDown.value);
};

Object.keys(MapStyle).forEach((s) => {
  const styleOption = document.createElement("option");
  // @ts-expect-error we know that `id` is private.
  styleOption.value = MapStyle[s as keyof typeof MapStyle].DEFAULT.id;
  styleOption.innerHTML = s.replace("_", " ").toLowerCase();
  styleDropDown.appendChild(styleOption);
});
