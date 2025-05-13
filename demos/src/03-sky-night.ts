import { Map, config, MapStyle } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });
const container = document.getElementById("map-container")!;
const map = new Map({
  container,
  style: MapStyle.OUTDOOR.DARK,
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

document.getElementById("sky-color")?.addEventListener("input", (e) => {
  map.setSky({
    "sky-color": (e.target as HTMLInputElement).value,
  });
});

document.getElementById("fog-ground-blend")?.addEventListener("input", (e) => {
  map.setSky({
    "fog-ground-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});

document.getElementById("horizon-color")?.addEventListener("input", (e) => {
  map.setSky({
    "horizon-color": (e.target as HTMLInputElement).value,
  });
});

document.getElementById("horizon-fog-blend")?.addEventListener("input", (e) => {
  map.setSky({
    "horizon-fog-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});
document.getElementById("fog-color")?.addEventListener("input", (e) => {
  map.setSky({
    "fog-color": (e.target as HTMLInputElement).value,
  });
});

document.getElementById("sky-horizon-blend")?.addEventListener("input", (e) => {
  map.setSky({
    "sky-horizon-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});
document.getElementById("fog-ground-blend")?.addEventListener("input", (e) => {
  map.setSky({
    "fog-ground-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});

document.getElementById("atmosphere-blend")?.addEventListener("input", (e) => {
  map.setSky({
    "atmosphere-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});

document.getElementById("horizon-fog-blend")?.addEventListener("input", (e) => {
  map.setSky({
    "horizon-fog-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});

document.getElementById("sky-horizon-blend")?.addEventListener("input", (e) => {
  map.setSky({
    "sky-horizon-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});

map.on("ready", () => {
  map.setSky({
    "sky-color": "#0C2E4B",
    "horizon-color": "#09112F",
    "fog-color": "#09112F",
    "fog-ground-blend": 0.0,
    "horizon-fog-blend": 0.1,
    "sky-horizon-blend": 1.0,
    "atmosphere-blend": 0.5,
  });
});

document.getElementById("atmosphere-blend")?.addEventListener("input", (e) => {
  map.setSky({
    "atmosphere-blend": parseFloat((e.target as HTMLInputElement).value),
  });
});

map.on("ready", () => {
  map.setSky({
    "sky-color": "#0C2E4B",
    "horizon-color": "#09112F",
    "fog-color": "#09112F",
    "fog-ground-blend": 0.0,
    "horizon-fog-blend": 0.1,
    "sky-horizon-blend": 1.0,
    "atmosphere-blend": 0.5,
  });
});
