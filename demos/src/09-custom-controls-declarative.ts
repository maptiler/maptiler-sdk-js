import "../../src/style/style_template.css";
import { Map, MapStyle, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map") as HTMLDivElement;

const map = new Map({
  container,
  style: MapStyle.STREETS.DEFAULT,
  hash: true,
  customControls: true,
  geolocateControl: false,
  navigationControl: false,
  terrainExaggeration: 4,
});

document.querySelector(".home-button")?.addEventListener("click", () => map.easeTo({ center: [15, 50], zoom: 7 }));
