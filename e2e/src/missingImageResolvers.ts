import "../../dist/maptiler-sdk.css";
import { Map as MapTiler, MapStyle, setWorkerUrl } from "../../src/index";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// MapLibre v6 loads its worker as a separate module, bundlers need its URL set explicitly
setWorkerUrl(workerUrl);

// A symbol layer whose icons are only drawn on demand:
// - "sdk-a" by a resolver added with addMissingStyleImageResolver (as the SDK's own layers do)
// - "user-b" by the resolver set with setMissingStyleImageResolver
// - "nobody-c" by neither, so MapLibre should fire styleimagemissing for it alone
// Everything the test needs to check is recorded on window.__missingImageResolvers.

const ICON_SIZE = 24;
const SOURCE_ID = "resolver-points";
const LAYER_ID = "resolver-icons";

const points: Record<string, [number, number]> = {
  "sdk-a": [-20, 0],
  "user-b": [0, 0],
  "nobody-c": [20, 0],
};

const colors: Record<string, [number, number, number]> = {
  "sdk-a": [255, 0, 255],
  "user-b": [0, 255, 255],
};

function square([r, g, b]: [number, number, number]) {
  const data = new Uint8Array(ICON_SIZE * ICON_SIZE * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  return { width: ICON_SIZE, height: ICON_SIZE, data };
}

const state = {
  points,
  colors,
  calls: { sdk: [] as string[], user: [] as string[] },
  missing: [] as string[],
  styleLoads: 0,
  idleStyleLoads: 0,
  reset() {
    state.calls.sdk.length = 0;
    state.calls.user.length = 0;
    state.missing.length = 0;
  },
  // a style URL rather than an object, so MapLibre builds a new style (and image manager) instead of diffing
  swapStyle() {
    map.setStyle(MapStyle.STREETS);
  },
};

window.__missingImageResolvers = state;

const map = new MapTiler({
  container: "map",
  apiKey: "DOESNT_MATTER",
  style: MapStyle.SATELLITE,
  zoom: 3,
  center: [0, 0],
});

window.__map = map;

map.addMissingStyleImageResolver((id) => {
  state.calls.sdk.push(id);
  if (id.startsWith("sdk-")) map.addImage(id, square(colors[id]));
});

map.setMissingStyleImageResolver((id) => {
  state.calls.user.push(id);
  if (id.startsWith("user-")) map.addImage(id, square(colors[id]));
});

map.on("styleimagemissing", (e) => {
  state.missing.push(e.id);
});

// added again after every style load, since a new style drops the layer and the images drawn for it
map.on("style.load", () => {
  state.styleLoads += 1;
  const styleLoad = state.styleLoads;

  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: Object.entries(points).map(([icon, coordinates]) => ({
        type: "Feature",
        properties: { icon },
        geometry: { type: "Point", coordinates },
      })),
    },
  });

  map.addLayer({
    id: LAYER_ID,
    type: "symbol",
    source: SOURCE_ID,
    layout: {
      "icon-image": ["get", "icon"],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  });

  void map.once("idle", () => {
    state.idleStyleLoads = styleLoad;
  });
});
