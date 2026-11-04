// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, config } from "@maptiler/sdk";
import { setupMapTilerApiKey } from "../../../shared/demo-utils";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = "streets-v2";

setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

new Map({
  container: "map",
  style: MAP_STYLE,
  center: [8.54, 47.37],
  zoom: 12,
});
