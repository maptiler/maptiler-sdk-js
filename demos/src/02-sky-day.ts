import "@maptiler/sdk/style.css";
import { Map, MapStyle, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map-container") as HTMLElement;

const map = new Map({
  container,
  style: MapStyle.OUTDOOR,
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

document.getElementById("sky-color")?.addEventListener("input", (e: Event) => {
  if (!e.target) return;
  map.setSky({
    "sky-color": (e.target as HTMLInputElement).value,
  });
});

document.getElementById("horizon-color")?.addEventListener("input", (e: Event) => {
  if (!e.target) return;
  map.setSky({
    "horizon-color": (e.target as HTMLInputElement).value,
  });
});

document.getElementById("fog-color")?.addEventListener("input", (e: Event) => {
  if (!e.target) return;
  map.setSky({
    "fog-color": (e.target as HTMLInputElement).value,
  });
});

document.getElementById("fog-ground-blend")?.addEventListener("input", (e: Event) => {
  if (!e.target) return;
  map.setSky({
    "fog-ground-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});

document.getElementById("horizon-fog-blend")?.addEventListener("input", (e: Event) => {
  if (!e.target) return;
  map.setSky({
    "horizon-fog-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});

document.getElementById("sky-horizon-blend")?.addEventListener("input", (e: Event) => {
  if (!e.target) return;
  map.setSky({
    "sky-horizon-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});

document.getElementById("atmosphere-blend")?.addEventListener("input", (e: Event) => {
  if (!e.target) return;
  map.setSky({
    "atmosphere-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});

map.on("ready", () => {
  map.setSky({
    "sky-color": "#027bdb",
    "horizon-color": "#ffffff",
    "fog-color": "#ffffff",
    "fog-ground-blend": 0.1,
    "horizon-fog-blend": 0.5,
    "sky-horizon-blend": 0.75,
    "atmosphere-blend": 0.5,
  });
});
