import "../../dist/maptiler-sdk.css";
import { config, Map as MapTiler, setWorkerUrl } from "../../src/index";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// MapLibre v6 loads its worker as a separate module, bundlers need its URL set explicitly
setWorkerUrl(workerUrl);

// the metrics request is not mocked
config.telemetry = false;

// Errors emitted by the map, e.g. when an expression set by the language change is invalid
const errors: string[] = [];

const map = new MapTiler({
  container: "map",
  apiKey: "DOESNT_MATTER",
  // Served from mocks/maptiler-style-language-expressions.json
  style: "https://api.maptiler.com/maps/language-expressions/style.json",
  zoom: 2,
  center: [0, 0],
  terrain: false,
});

map.on("error", (e) => {
  errors.push(e.error.message);
});

window.__map = map;
window.__pageObjects = {
  ...window.__pageObjects,
  errors,
};
