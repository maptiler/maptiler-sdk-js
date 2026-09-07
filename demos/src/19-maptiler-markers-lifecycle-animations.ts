import { Map, MapStyle, Marker, config } from "../../src/index";
import { el, setupMapTilerApiKey } from "./demo-utils";
import type {
  EnterAnimationPreset,
  ExitAnimationPreset,
  IdleAnimationPreset,
  MapTilerMarkerAnimations,
  MapTilerMarkerSVGOptions,
  MarkerLifecycleAnimationEventData,
} from "../../src/Marker";

setupMapTilerApiKey({ config });

const CENTER: [number, number] = [14.42, 50.08];
const SPACING = 0.0026;
const GRID_COLUMNS = 10;

const LIFECYCLE_EVENTS = [
  "enteranimationstart",
  "enteranimationend",
  "exitanimationstart",
  "exitanimationend",
  "idleanimationstart",
  "idleanimationiteration",
  "idleanimationend",
] as const;

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { hour12: false, minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 };

const NONE = "none";
const CUSTOM = "custom";
const ENTER_PRESETS: EnterAnimationPreset[] = ["grow", "drop", "pop", "bounce", "fade"];
const IDLE_PRESETS: IdleAnimationPreset[] = ["pulsescale", "ring", "pulseopacity", "bounce"];
const EXIT_PRESETS: ExitAnimationPreset[] = ["shrink", "fade", "pop", "explode"];

// `custom` examples — combine public setters (setScale/setRotation) with direct
// element opacity, since the SDK has no public setOpacity() (only the built-in
// lifecycle presets can reach it, via an internal prop). Alpha is already eased.
function customEnter(alpha: number, marker: Marker) {
  marker.setScale([alpha, alpha]);
  marker.setRotation(360 * (1 - alpha));
  marker.getElement().style.opacity = String(alpha);
}

function customExit(alpha: number, marker: Marker) {
  marker.setScale([1 - alpha, 1 - alpha]);
  marker.setRotation(360 * alpha);
  marker.getElement().style.opacity = String(1 - alpha);
}

function customIdle(alpha: number, marker: Marker) {
  marker.setRotation(Math.sin(alpha * Math.PI * 2) * 15);
}

function populateSelect(selectId: string, options: string[]) {
  const select = el<HTMLSelectElement>(selectId);
  for (const value of [NONE, ...options, CUSTOM]) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
  return select;
}

async function main() {
  const map = new Map({
    container: el("map"),
    style: MapStyle.STREETS.DEFAULT,
    zoom: 15,
    center: CENTER,
  });

  await map.onLoadAsync();

  const base: MapTilerMarkerSVGOptions = { shape: "circle", size: "l", color: "blue", content: "M" };

  const enterSelect = populateSelect("enter-preset", ENTER_PRESETS);
  const idleSelect = populateSelect("idle-preset", IDLE_PRESETS);
  const exitSelect = populateSelect("exit-preset", EXIT_PRESETS);

  const magnitudeInput = el<HTMLInputElement>("magnitude");
  const magnitudeValueEl = el("magnitude-value");
  magnitudeInput.addEventListener("input", () => {
    magnitudeValueEl.textContent = Number(magnitudeInput.value).toFixed(1);
  });

  const eventLogEl = el("lifecycle-log");
  function logEvent(type: string) {
    const time = new Date().toLocaleTimeString(undefined, TIME_FORMAT_OPTIONS);
    const line = document.createElement("div");
    line.textContent = `${time} · ${type}`;
    eventLogEl.prepend(line);
    while (eventLogEl.childNodes.length > 8) eventLogEl.lastChild?.remove();
  }

  const markers: Marker[] = [];
  let nextSlot = 0;
  const countEl = el("marker-count");
  const updateCount = () => {
    countEl.textContent = String(markers.length);
  };

  function addOneMarker() {
    const magnitude = Number(magnitudeInput.value);
    const animations: MapTilerMarkerAnimations = {};

    if (enterSelect.value === CUSTOM) {
      animations.enter = { custom: customEnter, duration: 900 };
    } else if (enterSelect.value !== NONE) {
      animations.enter = { preset: enterSelect.value as EnterAnimationPreset, duration: 900, magnitude };
    }

    if (idleSelect.value === CUSTOM) {
      animations.idle = { custom: customIdle, duration: 1500, iterations: Infinity };
    } else if (idleSelect.value !== NONE) {
      animations.idle = { preset: idleSelect.value as IdleAnimationPreset, iterations: Infinity, magnitude };
    }

    if (exitSelect.value === CUSTOM) {
      animations.exit = { custom: customExit, duration: 900 };
    } else if (exitSelect.value !== NONE) {
      animations.exit = { preset: exitSelect.value as ExitAnimationPreset, duration: 900, magnitude };
    }

    const marker = new Marker({ ...base, animations });
    const col = nextSlot % GRID_COLUMNS;
    const row = Math.floor(nextSlot / GRID_COLUMNS);
    nextSlot++;
    marker.setLngLat([CENTER[0] + (col - (GRID_COLUMNS - 1) / 2) * SPACING, CENTER[1] + row * SPACING]);

    for (const type of LIFECYCLE_EVENTS) {
      marker.on(type, (e: MarkerLifecycleAnimationEventData) => {
        logEvent(`${e.type} (${e.preset})`);
      });
    }

    map.addMarker(marker);
    markers.push(marker);
    updateCount();
  }

  el<HTMLButtonElement>("add-marker").addEventListener("click", () => {
    addOneMarker();
  });

  el<HTMLButtonElement>("add-5-markers").addEventListener("click", () => {
    for (let i = 0; i < 10; i++) addOneMarker();
  });

  el<HTMLButtonElement>("remove-all-markers").addEventListener("click", () => {
    for (const marker of markers.splice(0)) marker.remove();
    nextSlot = 0;
    updateCount();
  });
}

void main();
