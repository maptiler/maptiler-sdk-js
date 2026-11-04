// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, MapStyle, Marker, config } from "@maptiler/sdk";
import { addPerformanceStats, el, setupMapTilerApiKey } from "../../shared/demo-utils";
import { createGui } from "../../shared/gui";
import type { CollisionBehaviour, MapTilerMarkerOptions } from "@maptiler/sdk";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.STREETS.DEFAULT;

setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });
addPerformanceStats();

// bounds the markers are scattered within (around Prague)
const CENTER: [number, number] = [14.42, 50.08];
const LNG_SPREAD = 0.4;
const LAT_SPREAD = 0.4;
const MARKER_COUNT = 400;

/** Static per-marker traits; positions live separately so they can be reshuffled. */
type MarkerSpec = {
  priority: number;
};

function randomPosition(): [number, number] {
  return [CENTER[0] + (Math.random() - 0.5) * LNG_SPREAD, CENTER[1] + (Math.random() - 0.5) * LAT_SPREAD];
}

async function main() {
  const map = new Map({
    container: el("map"),
    style: MAP_STYLE,
    zoom: 10.5,
    center: CENTER,
  });

  await map.onLoadAsync();

  // every marker gets a unique priority (1..N) so hide/minimize winners are
  // unambiguous; the label shows it
  const specs: MarkerSpec[] = Array.from({ length: MARKER_COUNT }, (_, i) => ({
    priority: i + 1,
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

  const params = {
    behaviour: "always-show" as CollisionBehaviour,
    collisionRadius,
    randomize,
    debug,
  };
  // display-state tally, polled since states settle on animation frames
  const displayStates = { visible: 0, hidden: 0, minimized: 0 };

  const gui = createGui("Marker collisions");

  // map-wide default applied to every marker. Labels show the priority, higher wins: zoom out to force collisions
  gui
    .add(params, "behaviour", ["always-show", "hide-by-priority", "minimize-by-priority"])
    .name("behaviour (map default)")
    .onChange(() => map.setMarkerCollisionOptions({ behaviour: params.behaviour }));

  // rebuilds the set when the slider is released, as it's a constructor-only option
  gui
    .add(params, "collisionRadius", 0, 40, 1)
    .name("collision radius (px, 0 = box)")
    .onFinishChange(() => {
      collisionRadius = params.collisionRadius;
      buildMarkers();
    });

  gui.add(params, "randomize").name("randomize positions");

  gui
    .add(params, "debug")
    .name("debug bounding boxes")
    .onChange(() => {
      debug = params.debug;
      markers.forEach((marker) => {
        marker.setDebug(debug);
      });
    });

  const states = gui.addFolder("Display states");
  states.add(displayStates, "visible").disable().listen();
  states.add(displayStates, "hidden").disable().listen();
  states.add(displayStates, "minimized").disable().listen();

  // new positions, same specs and markers
  function randomize() {
    positions = specs.map(() => randomPosition());
    markers.forEach((marker, i) => marker.setLngLat(positions[i]));
  }

  setInterval(() => {
    displayStates.visible = displayStates.hidden = displayStates.minimized = 0;
    for (const marker of markers) displayStates[marker.getCollisionDisplayState()]++;
  }, 300);
}

void main();
