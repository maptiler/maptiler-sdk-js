// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";

import { Map, MapStyle, config } from "@maptiler/sdk";
import { setupMapTilerApiKey } from "../../../shared/demo-utils";
import { createGui } from "../../../shared/gui";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.STREETS.DEFAULT;

setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

const LOCAL_CACHE_NAME = "maptiler_sdk";

const destinations: { label: string; center: [number, number]; zoom: number }[] = [
  { label: "🗽 New York", center: [-74.006, 40.7128], zoom: 14 },
  { label: "🗼 Paris", center: [2.3522, 48.8566], zoom: 14 },
  { label: "🗾 Tokyo", center: [139.6917, 35.6895], zoom: 14 },
  { label: "🌴 Rio", center: [-43.1729, -22.9068], zoom: 14 },
  { label: "🦘 Sydney", center: [151.2093, -33.8688], zoom: 14 },
];

async function clearTileCache() {
  if (typeof caches === "undefined") return;
  const cache = await caches.open(LOCAL_CACHE_NAME);
  const keys = await cache.keys();
  await Promise.all(keys.map((key) => cache.delete(key)));
}

const map = new Map({
  container: document.getElementById("map")!,
  style: MAP_STYLE,
  center: [0, 20],
  zoom: 2,
  geolocateControl: false,
  useExperimentalTilePreloading: true,
});

// Tiles along the flight path are preloaded before the animation starts. Untick "preload" to compare.
const params = { preload: true, clearCache: false, status: "Select a destination", progress: 0 };
const gui = createGui("flyTo preloading (experimental)");
gui.add(params, "preload").name("use experimental_preload");
gui.add(params, "clearCache").name("clear cache before run");
gui.add(params, "status").disable().listen();
gui.add(params, "progress", 0, 100, 1).name("progress %").disable().listen();

const destinationButtons = destinations.map(({ label, center, zoom }) => {
  const actions = {
    async go() {
      destinationButtons.forEach((button) => button.disable());
      params.progress = 0;

      if (params.clearCache) {
        params.status = "Clearing tile cache";
        await clearTileCache();
      }

      if (params.preload) {
        params.status = `Preloading tiles for ${label}`;
        map.flyTo({
          center,
          zoom,
          duration: 4000,
          experimental_preload: {
            onProgress: (done, total) => {
              params.progress = total > 0 ? Math.round((done / total) * 100) : 0;
              params.status = `Preloading, ${done} / ${total} tiles`;
            },
            onError: (err) => console.warn("Preload error:", err),
          },
        });
      } else {
        params.status = `Flying to ${label}`;
        map.flyTo({ center, zoom, duration: 4000 });
      }

      map.once("moveend", () => {
        params.status = `Arrived at ${label}`;
        destinationButtons.forEach((button) => button.enable());
      });
    },
  };
  return gui.add(actions, "go").name(label);
});
