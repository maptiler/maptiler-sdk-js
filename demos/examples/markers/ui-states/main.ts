// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, MapStyle, Marker, config } from "@maptiler/sdk";
import type { MapTilerMarkerSVGOptions } from "@maptiler/sdk";
import { addCaption, setupMapTilerApiKey } from "../../../shared/demo-utils";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.STREETS.DEFAULT;

setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

const CENTER: [number, number] = [14.42, 50.08];
const SPACING = 0.0022;

async function main() {
  const map = new Map({
    container: "map",
    style: MAP_STYLE,
    zoom: 15,
    center: CENTER,
  });

  await map.onLoadAsync();

  // Each marker changes its look in one UI state, overriding its options only while the state lasts
  const markers: { caption: string; options: MapTilerMarkerSVGOptions }[] = [
    { caption: "HOVER", options: { content: "H", states: { hover: { scale: [1.35, 1.35], shadow: "strong" } } } },
    { caption: "FOCUS (click or Tab)", options: { content: "F", states: { focus: { outline: true, outlineColor: "#22c55e" } } } },
    { caption: "ACTIVE (press and hold)", options: { content: "A", states: { active: { shape: "square", innerColor: "red" } } } },
    { caption: "DRAGGING", options: { content: "D", draggable: true, states: { dragging: { scale: [1.5, 1.5], innerColor: "red" } } } },
  ];

  markers.forEach(({ caption, options }, i) => {
    const lngLat: [number, number] = [CENTER[0] + (i - 1.5) * SPACING, CENTER[1]];
    map.addMarker(new Marker({ shape: "circle", size: "l", lngLat, ...options }));
    addCaption(map, lngLat, caption);
  });
}

void main();
