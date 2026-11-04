// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, MapStyle, Marker, config } from "@maptiler/sdk";
import { el, setupMapTilerApiKey } from "../../shared/demo-utils";
import { createGui } from "../../shared/gui";
import { createLogPanelUI } from "../../shared/log-panel";
import type {
  EnterAnimationPreset,
  ExitAnimationPreset,
  IdleAnimationPreset,
  MapTilerMarkerAnimations,
  MapTilerMarkerSVGOptions,
  MarkerLifecycleAnimationEventData,
} from "@maptiler/sdk";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.STREETS.DEFAULT;

setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });
createLogPanelUI({ title: "Lifecycle events" });

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

async function main() {
  const map = new Map({
    container: el("map"),
    style: MAP_STYLE,
    zoom: 15,
    center: CENTER,
  });

  await map.onLoadAsync();

  const base: MapTilerMarkerSVGOptions = { shape: "circle", size: "l", content: "M" };

  // Picking a preset (or "custom") only affects markers added after the change, as each marker
  // is built from the values at the moment it's added. Magnitude is ignored by "custom" and "none".
  const params = {
    enter: NONE as string,
    idle: NONE as string,
    exit: NONE as string,
    magnitude: 1,
    addOne: () => {
      addMarkers(1);
    },
    addTen: () => {
      addMarkers(10);
    },
    removeAll: () => {
      removeAllMarkers(false);
    },
    removeAllImmediate: () => {
      removeAllMarkers(true);
    },
    count: 0,
  };

  const gui = createGui("Lifecycle animations");
  gui.add(params, "enter", [NONE, ...ENTER_PRESETS, CUSTOM]);
  gui.add(params, "idle", [NONE, ...IDLE_PRESETS, CUSTOM]);
  gui.add(params, "exit", [NONE, ...EXIT_PRESETS, CUSTOM]);
  gui.add(params, "magnitude", 0, 2, 0.1);
  gui.add(params, "addOne").name("add one");
  gui.add(params, "addTen").name("add 10");
  // plays each marker's exit animation before removing it
  gui.add(params, "removeAll").name("remove all");
  // removes the markers straight away, skipping the exit animation
  gui.add(params, "removeAllImmediate").name("remove all (immediate)");
  gui.add(params, "count").name("markers").disable().listen();

  const markers: Marker[] = [];
  let nextSlot = 0;

  function addOneMarker() {
    const { magnitude } = params;
    const animations: MapTilerMarkerAnimations = {};

    if (params.enter === CUSTOM) {
      animations.enter = { custom: customEnter, duration: 900 };
    } else if (params.enter !== NONE) {
      animations.enter = { preset: params.enter as EnterAnimationPreset, duration: 900, magnitude };
    }

    if (params.idle === CUSTOM) {
      animations.idle = { custom: customIdle, duration: 1500, iterations: Infinity };
    } else if (params.idle !== NONE) {
      animations.idle = { preset: params.idle as IdleAnimationPreset, iterations: Infinity, magnitude };
    }

    if (params.exit === CUSTOM) {
      animations.exit = { custom: customExit, duration: 900 };
    } else if (params.exit !== NONE) {
      animations.exit = { preset: params.exit as ExitAnimationPreset, duration: 900, magnitude };
    }

    const marker = new Marker({ ...base, animations });
    const col = nextSlot % GRID_COLUMNS;
    const row = Math.floor(nextSlot / GRID_COLUMNS);
    nextSlot++;
    marker.setLngLat([CENTER[0] + (col - (GRID_COLUMNS - 1) / 2) * SPACING, CENTER[1] + row * SPACING]);

    for (const type of LIFECYCLE_EVENTS) {
      marker.on(type, (e: MarkerLifecycleAnimationEventData) => {
        console.log(`${e.type} (${e.preset})`);
      });
    }

    map.addMarker(marker);
    markers.push(marker);
  }

  function addMarkers(count: number) {
    for (let i = 0; i < count; i++) addOneMarker();
    params.count = markers.length;
  }

  function removeAllMarkers(immediate: boolean) {
    const ids = markers.splice(0).map((marker) => marker.id);
    map.removeMarkers(ids, { immediate });
    nextSlot = 0;
    params.count = 0;
  }
}

void main();
