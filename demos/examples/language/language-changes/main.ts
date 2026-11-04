// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";

import { Map, config } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "../../../shared/demo-utils";
import { Language } from "@maptiler/sdk";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = "outdoor";

addPerformanceStats();
setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

const container = document.getElementById("map")!;

async function main() {
  const map = new Map({
    container,
    style: MAP_STYLE,
    hash: true,
    // geolocate: true,
    scaleControl: true,
    fullscreenControl: true,
    terrainControl: true,
    projectionControl: true,
    projection: "globe",
    halo: true,
    space: true,
    // language: Language.RUSSIAN,
    zoom: 10,
  });

  await map.onReadyAsync();

  document.getElementById("buttons")?.addEventListener("click", function (event) {
    const language = (event.target as HTMLElement).id as keyof typeof Language;
    if (!language || language === "STYLE_LOCK") return;

    map.setLanguage(Language[language]);
  });
}

void main();
