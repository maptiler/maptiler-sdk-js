import "../../dist/maptiler-sdk.css";
import { ColorRamp, HeatmapLayer, Map as MapTiler, MapStyle, PointLayer, setWorkerUrl } from "../../src/index";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// MapLibre v6 loads its worker as a separate module, bundlers need its URL set explicitly
setWorkerUrl(workerUrl);

// A real map for the data layer e2e tests: how the SDK map places data layers and their sublayers
// through addLayer / moveLayer, and how a HeatmapLayer's opacity renders across zooms.
// The style and its raster tiles are mocked by the tests.

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
window.__pageObjects = { ...window.__pageObjects, ColorRamp, HeatmapLayer, PointLayer };
