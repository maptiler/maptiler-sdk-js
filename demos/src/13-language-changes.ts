// This file is intended for quick testing or development. Please do not commit changes to this file.

import { Map, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";
import { Language } from "../../src/language";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map")!;

async function main() {
  const map = new Map({
    container,
    style: "outdoor",
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
