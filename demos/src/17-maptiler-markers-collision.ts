import { Map, MapStyle, Marker, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";
import type { CollisionBehaviour, MapTilerMarkerOptions } from "../../src/Marker";

setupMapTilerApiKey({ config });
addPerformanceStats();

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Element \`#${id}\` not found`);
  return found as T;
}

// bounds the markers are scattered within (around Prague)
const CENTER: [number, number] = [14.42, 50.08];
const LNG_SPREAD = 0.4;
const LAT_SPREAD = 0.4;
const MARKER_COUNT = 400;

const COLORS = ["blue"] as const;

/** Static per-marker traits; positions live separately so they can be reshuffled. */
type MarkerSpec = {
  priority: number;
  color: (typeof COLORS)[number];
};

function randomPosition(): [number, number] {
  return [CENTER[0] + (Math.random() - 0.5) * LNG_SPREAD, CENTER[1] + (Math.random() - 0.5) * LAT_SPREAD];
}

async function main() {
  const map = new Map({
    container: el("map"),
    style: MapStyle.STREETS.DEFAULT,
    zoom: 10.5,
    center: CENTER,
  });

  await map.onLoadAsync();

  // every marker gets a unique priority (1..100) so hide/minimize winners and
  // cluster representatives are unambiguous; the label shows it
  const specs: MarkerSpec[] = Array.from({ length: MARKER_COUNT }, (_, i) => ({
    priority: i + 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  let positions = specs.map(() => randomPosition());
  let markers: Marker[] = [];

  // marker construction options rebuilt on demand — collisionRadius is a
  // constructor-only option, so changing it recreates the whole set
  let collisionRadius = 0;
  let debug = false;

  function buildMarkers() {
    map.removeMarkers();
    markers = specs.map((spec, i) => {
      const options: MapTilerMarkerOptions = {
        shape: "circle",
        size: "m",
        color: spec.color,
        content: String(spec.priority),
        title: `priority ${String(spec.priority)}`,
        priority: spec.priority,
        collisionRadius: collisionRadius > 0 ? collisionRadius : undefined,
        debug,
      };
      const marker = new Marker(options);
      marker.setLngLat(positions[i]);
      map.addMarker(marker);
      return marker;
    });
  }

  buildMarkers();

  // Behaviour — map-wide default applied to every marker
  const behaviourButtons = document.querySelectorAll<HTMLButtonElement>("[data-collision-behaviour]");

  function syncBehaviourButtons(active: string) {
    behaviourButtons.forEach((b) => b.classList.toggle("active", b.dataset.collisionBehaviour === active));
  }

  behaviourButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const behaviour = btn.dataset.collisionBehaviour as CollisionBehaviour;
      map.setMarkerCollisionOptions({ behaviour });
      syncBehaviourButtons(behaviour);
    });
  });

  syncBehaviourButtons("always-show");

  // Collision radius — rebuilds the set (constructor-only option)
  const radiusInput = el<HTMLInputElement>("collision-radius");
  const radiusVal = el("collision-radius-val");

  radiusInput.addEventListener("change", () => {
    collisionRadius = parseInt(radiusInput.value, 10);
    radiusVal.textContent = collisionRadius === 0 ? "box" : `${String(collisionRadius)}px`;
    buildMarkers();
  });
  radiusInput.addEventListener("input", () => {
    const value = parseInt(radiusInput.value, 10);
    radiusVal.textContent = value === 0 ? "box" : `${String(value)}px`;
  });

  // Randomize — new positions, same specs/markers
  el<HTMLButtonElement>("randomize").addEventListener("click", () => {
    positions = specs.map(() => randomPosition());
    markers.forEach((marker, i) => {
      marker.setLngLat(positions[i]);
    });
  });

  // Debug boxes
  const debugToggle = el<HTMLInputElement>("debug-toggle");
  debugToggle.addEventListener("change", () => {
    debug = debugToggle.checked;
    markers.forEach((marker) => {
      marker.setDebug(debug);
    });
  });

  // Display-state tally — polled, since states settle on animation frames
  const statusEl = el("status");

  setInterval(() => {
    const counts = { visible: 0, hidden: 0, minimized: 0 };
    for (const marker of markers) counts[marker.getCollisionDisplayState()]++;
    statusEl.textContent = `visible: ${String(counts.visible)}  |  hidden: ${String(counts.hidden)}  |  minimized: ${String(counts.minimized)}`;
  }, 300);
}

void main();
