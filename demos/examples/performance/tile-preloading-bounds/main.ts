// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";

import { LngLatBoundsLike, Map, MapStyle, config } from "@maptiler/sdk";
import { setupMapTilerApiKey } from "../../../shared/demo-utils";
import { createGui } from "../../../shared/gui";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.STREETS.DEFAULT;

setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

type DataOption = {
  label: string;
  bounds: LngLatBoundsLike;
  minZoom: number;
  maxZoom: number;
};

const data: DataOption[] = [
  {
    label: "Scotland",
    bounds: [-5.998213657132084, 56.07739533738746, -4.7864188317924174, 55.126391218029596],
    minZoom: 9,
    maxZoom: 10,
  },
  {
    label: "US Northeast",
    bounds: [-77.01937270814145, 43.71560543660081, -72.09144046264676, 38.61293092283313],
    minZoom: 7,
    maxZoom: 8,
  },
];

async function main() {
  const map = new Map({
    container: document.getElementById("map")!,
    style: MAP_STYLE,
    center: [0, 20],
    zoom: 2,
    geolocateControl: false,
    useExperimentalTilePreloading: true,
  });

  await map.onReadyAsync();

  // Preload tiles for a region, then jump there. Untick "preload" to compare with uncached navigation.
  const params = { preload: true, status: "Ready, select a region", progress: 0 };
  const gui = createGui("Tile preloading (experimental)");
  gui.add(params, "preload").name("use experimental preloading");
  gui.add(params, "status").disable().listen();
  gui.add(params, "progress", 0, 100, 1).name("progress %").disable().listen();

  const regionButtons = data.map((d) => {
    const actions = {
      async go() {
        regionButtons.forEach((button) => button.disable());
        params.progress = 0;

        if (params.preload) {
          params.status = `Preloading ${d.label} (z${d.minZoom}–${d.maxZoom})`;
          await map.experimental_preloadTilesForBounds({
            bounds: d.bounds,
            minZoom: d.minZoom,
            maxZoom: d.maxZoom,
            onProgress: (done, total) => {
              params.progress = total > 0 ? Math.round((done / total) * 100) : 0;
              params.status = `Preloading tiles, ${done} / ${total}`;
            },
            onError: (err) => console.warn("Tile preload error:", err),
          });
          params.status = `Preloaded ${d.label}, fitting bounds`;
        } else {
          params.status = `Fitting bounds for ${d.label} (no preload)`;
        }

        map.fitBounds(d.bounds, { duration: 0 });
        regionButtons.forEach((button) => button.enable());
      },
    };
    return gui.add(actions, "go").name(d.label);
  });

  map.on("click", (e) => {
    console.log("Clicked", e.lngLat.lng, e.lngLat.lat, map.getZoom());
  });
}

void main();
