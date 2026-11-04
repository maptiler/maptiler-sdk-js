// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, config, MapStyle } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "../../../shared/demo-utils";
import { createGui } from "../../../shared/gui";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAP_STYLE = MapStyle.OUTDOOR.DARK;

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map-container")!;
const map = new Map({
  container,
  style: MAP_STYLE,
  hash: true,
  geolocate: true,
  maxPitch: 85,
  terrain: true,
  pitch: 80,
  bearing: 32.8,
  center: [7.8097, 46.0739],
  zoom: 11.45,
  terrainControl: true,
  projectionControl: true,
});

const sky = {
  "sky-color": "#0C2E4B",
  "horizon-color": "#09112F",
  "fog-color": "#09112F",
  "fog-ground-blend": 0.0,
  "horizon-fog-blend": 0.1,
  "sky-horizon-blend": 1.0,
  "atmosphere-blend": 0.5,
};

const gui = createGui("Sky");
gui.addColor(sky, "sky-color");
gui.addColor(sky, "horizon-color");
gui.addColor(sky, "fog-color");
gui.add(sky, "fog-ground-blend", 0, 1, 0.01);
gui.add(sky, "horizon-fog-blend", 0, 1, 0.01);
gui.add(sky, "sky-horizon-blend", 0, 1, 0.01);
gui.add(sky, "atmosphere-blend", 0, 1, 0.01);
gui.onChange(({ property, value }: { property: string; value: string | number }) => {
  map.setSky({ [property]: value });
});

map.on("ready", () => {
  map.setSky(sky);
});
