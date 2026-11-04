// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/non-nullable-type-assertion-style */
import "../../../../src/style/style_template.css";
import { Map, MapStyle, config, toggleProjection, toggleTerrain } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "../../../shared/demo-utils";
import { MaptilerCustomControl } from "@maptiler/sdk";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.STREETS.DEFAULT;

addPerformanceStats();
setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

const container = document.getElementById("map") as HTMLDivElement;

const map = new Map({
  container,
  style: MAP_STYLE,
  hash: true,
  geolocateControl: false,
  navigationControl: false,
  terrainExaggeration: 4,
});

const compassControlElement = document.querySelector(".compass-control") as HTMLElement;
const navigationControl = new MaptilerCustomControl(
  ".navigation-controls",
  (map, _, event) => {
    if ((event.target as HTMLElement).closest(".zoom-in-control")) {
      map.zoomIn();
    }
  },
  (map) => {
    (compassControlElement.firstElementChild as HTMLElement).style.transform = `rotateX(${String(map.getPitch())}deg) rotateZ(${String(-map.getBearing())}deg)`;
  },
);
map.addControl(navigationControl);
document.querySelector(".zoom-out-control")?.addEventListener("click", () => map.zoomOut());
compassControlElement.addEventListener("click", () => map.resetNorthPitch());

const projectionControlElement = document.querySelector(".projection-control") as HTMLElement;
const projectionControl = new MaptilerCustomControl(projectionControlElement, toggleProjection, (map, element) => {
  element.firstElementChild!.textContent = map.isGlobeProjection() ? "map" : "globe";
  element.title = map.isGlobeProjection() ? "Switch to Mercator projection" : "Switch to Globe projection";
});
map.addControl(projectionControl, "top-left");

const terrainControlElement = document.createElement("div");
terrainControlElement.className = "btn btn-success m-2 terrain-control";
const terrainControlIcon = document.createElement("span");
terrainControlIcon.textContent = "terrain";
terrainControlIcon.classList.add("material-symbols-outlined");
terrainControlElement.appendChild(terrainControlIcon);
const terrainControl = new MaptilerCustomControl(terrainControlElement, toggleTerrain, (map) => {
  terrainControlIcon.classList.toggle("icon-fill", map.hasTerrain());
  terrainControlElement.title = map.hasTerrain() ? "Turn off Terrain" : "Turn on Terrain";
});
map.addControl(terrainControl, "top-left");

const home = { lng: 15.4, lat: 49.8 };
map.addControl(
  new MaptilerCustomControl(
    ".home-button",
    (map) => {
      map.easeTo({ center: home, zoom: 7 });
    },
    (map, element) => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      (element.firstElementChild as HTMLElement).classList.toggle(
        "icon-fill",
        Math.abs(center.lng - home.lng) < Math.max(0, zoom - 6.8) * 1.5 && Math.abs(center.lat - home.lat) < Math.max(0, zoom - 6.8) / 2,
      );
    },
  ),
  "bottom-right",
);
