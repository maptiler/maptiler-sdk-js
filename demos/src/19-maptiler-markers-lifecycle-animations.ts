import { Map, MapStyle, Marker, config } from "../../src/index";
import { setupMapTilerApiKey } from "./demo-utils";
import type { MapTilerMarkerOptions, MarkerLifecycleAnimationEventData } from "../../src/Marker";

setupMapTilerApiKey({ config });

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id} not found`);
  return found as T;
}

const CENTER: [number, number] = [14.42, 50.08];
const SPACING = 0.0026;

/** Static caption pinned under a marker's position — always visible, unlike a hover-only `title` tooltip. */
function addCaption(map: Map, lngLat: [number, number], text: string) {
  const captionEl = document.createElement("div");
  captionEl.textContent = text;
  captionEl.style.font = "700 10px system-ui";
  captionEl.style.letterSpacing = "0.03em";
  captionEl.style.color = "rgba(0, 0, 0, 0.75)";
  captionEl.style.background = "rgba(255, 255, 255, 0.85)";
  captionEl.style.padding = "2px 6px";
  captionEl.style.borderRadius = "4px";
  captionEl.style.whiteSpace = "nowrap";
  captionEl.style.pointerEvents = "none";

  const caption = new Marker({ element: captionEl, anchor: "top", offset: [0, 34], htmlAttributes: { tabindex: "-1" } });
  caption.setLngLat(lngLat);
  map.addMarker(caption);
}

const LIFECYCLE_EVENTS = ["enteranimationstart", "enteranimationend", "exitanimationstart", "exitanimationend", "idleanimationstart", "idleanimationiteration", "idleanimationend"] as const;

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

  // Shared event feed — every marker below logs into this.
  const eventLogEl = el("lifecycle-log");
  const logEvent = (label: string, type: string) => {
    const time = new Date().toLocaleTimeString(undefined, { hour12: false, minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 } as Intl.DateTimeFormatOptions);
    const line = document.createElement("div");
    line.textContent = `${time} · ${label} · ${type}`;
    eventLogEl.prepend(line);
    while (eventLogEl.childNodes.length > 8) eventLogEl.lastChild?.remove();
  };

  function wireLogging(marker: Marker, label: string) {
    for (const type of LIFECYCLE_EVENTS) {
      marker.on(type, (e: MarkerLifecycleAnimationEventData) => logEvent(label, e.type));
    }
  }

  /** Wires a button to add/remove `marker`, toggling its label. `exit` only plays through `marker.remove()` — never `map.removeMarker()`. */
  function setupToggle(buttonId: string, marker: Marker, initiallyOnMap: boolean) {
    const button = el<HTMLButtonElement>(buttonId);
    let onMap = initiallyOnMap;
    button.textContent = onMap ? "Remove" : "Add";

    button.addEventListener("click", () => {
      if (onMap) {
        marker.remove();
      } else {
        map.addMarker(marker);
      }
      onMap = !onMap;
      button.textContent = onMap ? "Remove" : "Add";
    });
  }

  // ENTER only — starts off the map so "Add" shows the fade-in. Removing
  // has no exit configured, so it snaps away instantly.
  const enterMarker = new Marker({
    ...base,
    content: "E",
    title: "Enter",
    animations: { enter: { preset: "fade", duration: 900, easing: "SinusoidalOut" } },
  });
  enterMarker.setLngLat(at(-3));
  wireLogging(enterMarker, "ENTER");
  addCaption(map, at(-3), "ENTER (click Add)");
  setupToggle("toggle-enter", enterMarker, false);

  // EXIT only — starts on the map so "Remove" shows the fade-out; the
  // marker stays visible/interactive until the fade finishes.
  const exitMarker = new Marker({
    ...base,
    content: "X",
    title: "Exit",
    animations: { exit: { preset: "fade", duration: 900, easing: "SinusoidalIn" } },
  });
  exitMarker.setLngLat(at(-1));
  map.addMarker(exitMarker);
  wireLogging(exitMarker, "EXIT");
  addCaption(map, at(-1), "EXIT (click Remove)");
  setupToggle("toggle-exit", exitMarker, true);

  // IDLE only — MVP stub: accepted and typed, but currently a no-op, so
  // add/remove both snap and the event log never fires for this marker.
  const idleMarker = new Marker({
    ...base,
    content: "I",
    title: "Idle",
    animations: { idle: { preset: "fade", duration: 1200, iterations: Infinity } },
  });
  idleMarker.setLngLat(at(1));
  map.addMarker(idleMarker);
  wireLogging(idleMarker, "IDLE");
  addCaption(map, at(1), "IDLE (no-op for now)");
  setupToggle("toggle-idle", idleMarker, true);

  // ALL THREE — enter fades in, idle is configured (no-op), exit fades out.
  const allMarker = new Marker({
    ...base,
    content: "A",
    title: "Enter + Idle + Exit",
    animations: {
      enter: { preset: "fade", duration: 700, easing: "SinusoidalOut" },
      idle: { preset: "fade", duration: 1200, iterations: Infinity },
      exit: { preset: "fade", duration: 700, easing: "SinusoidalIn" },
    },
  });
  allMarker.setLngLat(at(3));
  wireLogging(allMarker, "ALL");
  addCaption(map, at(3), "ENTER + IDLE + EXIT");
  setupToggle("toggle-all", allMarker, false);
}

void main();
