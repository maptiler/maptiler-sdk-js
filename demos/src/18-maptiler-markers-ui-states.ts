import { Map, MapStyle, Marker, config } from "../../src/index";
import { setupMapTilerApiKey } from "./demo-utils";
import type { MapTilerMarkerOptions, MapTilerMarkerTransitions, MarkerTransitionProperty, MarkerTransitionSpec, MarkerTransitionEventData } from "../../src/Marker";

setupMapTilerApiKey({ config });

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id} not found`);
  return found as T;
}

const CENTER: [number, number] = [14.42, 50.08];
const SPACING = 0.0022;

/** Reads the transform actually committed to the DOM, bypassing the `props` store. */
function renderedTransform(marker: Marker): string {
  const wrapper = marker.getElement().querySelector<HTMLElement>(".marker-transform-wrapper") ?? marker.getElement();
  return getComputedStyle(wrapper).transform;
}

/** Static caption pinned under a marker's position — always visible, unlike a hover-only `title` tooltip. */
function addCaption(map: Map, lngLat: [number, number], text: string) {
  const el = document.createElement("div");
  el.textContent = text;
  el.style.font = "700 10px system-ui";
  el.style.letterSpacing = "0.03em";
  el.style.color = "rgba(0, 0, 0, 0.75)";
  el.style.background = "rgba(255, 255, 255, 0.85)";
  el.style.padding = "2px 6px";
  el.style.borderRadius = "4px";
  el.style.whiteSpace = "nowrap";
  el.style.pointerEvents = "none";

  const caption = new Marker({ element: el, anchor: "top", offset: [0, 34], htmlAttributes: { tabindex: "-1" } });
  caption.setLngLat(lngLat);
  map.addMarker(caption);
}

async function main() {
  const map = new Map({
    container: el("map"),
    style: MapStyle.STREETS.DEFAULT,
    zoom: 15,
    center: CENTER,
  });

  await map.onLoadAsync();

  const base: MapTilerMarkerOptions = { shape: "circle", size: "l", color: "blue" };
  const at = (i: number): [number, number] => [CENTER[0] + i * SPACING, CENTER[1]];

  const hoverMarker = new Marker({
    ...base,
    content: "H",
    title: "Hover",
    states: { hover: { scale: [1.35, 1.35], shadow: "strong" } },
  });
  hoverMarker.setLngLat(at(-2));
  map.addMarker(hoverMarker);
  addCaption(map, at(-2), "HOVER");

  const focusMarker = new Marker({
    ...base,
    content: "F",
    title: "Focus",
    states: { focus: { outline: true, outlineColor: "#22c55e" } },
  });
  focusMarker.setLngLat(at(-1));
  map.addMarker(focusMarker);
  addCaption(map, at(-1), "FOCUS (click / Tab)");

  const activeMarker = new Marker({
    ...base,
    content: "A",
    title: "Active",
    states: { active: { shape: "square", color: "red" } },
  });
  activeMarker.setLngLat(at(0));
  map.addMarker(activeMarker);
  addCaption(map, at(0), "ACTIVE (press + hold)");

  const dragMarker = new Marker({
    ...base,
    content: "D",
    title: "Dragging",
    draggable: true,
    states: { dragging: { scale: [1.5, 1.5], color: "red" } },
  });
  dragMarker.setLngLat(at(1));
  map.addMarker(dragMarker);
  addCaption(map, at(1), "DRAGGING");

  // priority order is hover < focus < active < dragging — each state below
  // sets a different outerColor so whichever is rendered reveals the winner
  const priorityMarker = new Marker({
    ...base,
    content: "P",
    title: "Priority",
    draggable: true,
    states: {
      hover: { outerColor: "#facc15" },
      focus: { outerColor: "#3b82f6" },
      active: { outerColor: "#f97316" },
      dragging: { outerColor: "#ef4444" },
    },
  });
  priorityMarker.setLngLat(at(2));
  map.addMarker(priorityMarker);
  addCaption(map, at(2), "PRIORITY (combine all 4)");

  // base scale [1,1]; hover overrides to [1.4,1.4]; setScale(...) simulates a
  // queued update that lands underneath, revealed only once hover releases
  const liveMarker = new Marker({
    ...base,
    content: "L",
    title: "Live scale",
    states: { hover: { scale: [1.4, 1.4] } },
  });
  liveMarker.setLngLat(at(3));
  map.addMarker(liveMarker);
  addCaption(map, at(3), "LIVE SCALE (see panel)");

  el<HTMLButtonElement>("set-scale-big").addEventListener("click", () => {
    liveMarker.setScale([1.15, 1.15]);
  });
  el<HTMLButtonElement>("set-scale-small").addEventListener("click", () => {
    liveMarker.setScale([0.85, 0.85]);
  });

  const propScaleEl = el("prop-scale");
  const domTransformEl = el("dom-transform");

  setInterval(() => {
    propScaleEl.textContent = JSON.stringify(liveMarker.getScale());
    domTransformEl.textContent = renderedTransform(liveMarker);
  }, 100);

  // Transitions: scale/colour/position ease over their configured
  // duration+easing+delay instead of snapping. Easing names are
  // case-insensitive ("bouncein" resolves the same as "BounceIn").
  const TRANSITIONS: MapTilerMarkerTransitions = {
    scale: [500, "bouncein"],
    outerColor: [600, "linear", 100],
    position: [700, "sinusoidalinout"],
  };

  const transitionMarker = new Marker({
    ...base,
    content: "T",
    title: "Transitions",
    transitions: { ...TRANSITIONS },
  });
  transitionMarker.setLngLat(at(4));
  map.addMarker(transitionMarker);
  addCaption(map, at(4), "TRANSITIONS (see panel)");

  const eventLogEl = el("transition-log");
  const logTransitionEvent = (type: string, props: Record<string, unknown>) => {
    const time = new Date().toLocaleTimeString(undefined, { hour12: false, minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 } as Intl.DateTimeFormatOptions);
    const line = document.createElement("div");
    line.textContent = `${time} · ${type} · ${JSON.stringify(props)}`;
    eventLogEl.prepend(line);
    while (eventLogEl.childNodes.length > 5) eventLogEl.lastChild?.remove();
  };
  transitionMarker.on("transitionstart", (e: MarkerTransitionEventData) => {
    logTransitionEvent("start", e.props);
  });
  transitionMarker.on("transitionend", (e: MarkerTransitionEventData) => {
    logTransitionEvent("end", e.props);
  });

  let scaledUp = false;
  el<HTMLButtonElement>("transition-scale").addEventListener("click", () => {
    scaledUp = !scaledUp;
    transitionMarker.setScale(scaledUp ? [1.6, 1.6] : [1, 1]);
  });

  let colorSwapped = false;
  el<HTMLButtonElement>("transition-color").addEventListener("click", () => {
    colorSwapped = !colorSwapped;
    transitionMarker.setOuterColor(colorSwapped ? "#ef4444" : undefined);
  });

  let nudged = false;
  el<HTMLButtonElement>("transition-position").addEventListener("click", () => {
    nudged = !nudged;
    transitionMarker.setLngLat(nudged ? at(4.6) : at(4));
  });

  const transitionsToggleEl = el<HTMLButtonElement>("transition-toggle");
  let transitionsEnabled = true;
  transitionsToggleEl.addEventListener("click", () => {
    transitionsEnabled = !transitionsEnabled;
    for (const [property, spec] of Object.entries(TRANSITIONS) as [MarkerTransitionProperty, MarkerTransitionSpec][]) {
      transitionMarker.setTransitionForProperty(property, transitionsEnabled ? spec : null);
    }
    transitionsToggleEl.textContent = transitionsEnabled ? "Disable transitions" : "Enable transitions";
  });

  el("transition-config").textContent = JSON.stringify(transitionMarker.getTransitions());
}

void main();
