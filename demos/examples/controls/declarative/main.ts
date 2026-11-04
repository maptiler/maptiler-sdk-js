// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import "../../../../src/style/style_template.css";
import { Map, MapStyle, config } from "@maptiler/sdk";
import { setupMapTilerApiKey } from "../../../shared/demo-utils";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.STREETS.DEFAULT;

setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

const container = document.getElementById("map") as HTMLDivElement;

const map = new Map({
  container,
  style: MAP_STYLE,
  hash: true,
  customControls: true,
  geolocateControl: false,
  navigationControl: false,
  terrainExaggeration: 4,
});

document.querySelector(".home-button")?.addEventListener("click", () => map.easeTo({ center: [15, 50], zoom: 7 }));
