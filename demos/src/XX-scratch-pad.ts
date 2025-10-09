// This file is intended for quick testing or development. Please do not commit changes to this file.

import { Map, MapStyle, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map")!;

async function main() {
  const map = new Map({
    container,
    style: MapStyle.OUTDOOR.DARK,
    hash: true,
    geolocate: true,
    scaleControl: true,
    fullscreenControl: true,
    terrainControl: true,
    projectionControl: true,
    projection: "globe",
    halo: true,
    space: true,
    zoom: 10,
  });

  await map.onReadyAsync();
}

void main();
