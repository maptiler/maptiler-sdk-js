// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";

import { Map, config } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "../../../shared/demo-utils";
import { createGui } from "../../../shared/gui";
import { Language } from "@maptiler/sdk";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = "outdoor";

addPerformanceStats();
setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

const container = document.getElementById("map")!;

// `Language.STYLE_LOCK` isn't listed: it only applies when passed to the Map constructor
const LANGUAGES: Record<string, keyof typeof Language> = {
  Auto: "AUTO",
  Local: "LOCAL",
  Visitor: "VISITOR",
  "Visitor English": "VISITOR_ENGLISH",
  Latin: "LATIN",
  "Non-Latin": "NON_LATIN",
  German: "GERMAN",
  Russian: "RUSSIAN",
};

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

  const params = { language: "AUTO" as keyof typeof Language };
  createGui("Language")
    .add(params, "language", LANGUAGES)
    .onChange((language: keyof typeof Language) => {
      map.setLanguage(Language[language]);
    });
}

void main();
