import "../../dist/maptiler-sdk.css";
import { Map as MapTiler, MapStyle, PointLayer, setWorkerUrl } from "../../src/index";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// MapLibre v6 loads its worker as a separate module, bundlers need its URL set explicitly
setWorkerUrl(workerUrl);

const map = new MapTiler({
  container: "map",
  apiKey: "DOESNT_MATTER",
  style: MapStyle.SATELLITE,
  center: [0, 0],
  zoom: 3,
  navigationControl: false,
  geolocateControl: false,
});

window.__map = map;
// the tests build their own layers
window.__pageObjects = { ...window.__pageObjects, PointLayer };
