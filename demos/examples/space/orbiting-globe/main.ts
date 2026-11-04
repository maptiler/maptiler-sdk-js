// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, MapStyle, config } from "@maptiler/sdk";
import { setupMapTilerApiKey } from "../../../shared/demo-utils";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.HYBRID.DEFAULT;

setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

// How fast the globe turns, in degrees of longitude per second
const DEGREES_PER_SECOND = 6;

const map = new Map({
  container: "map",
  style: MAP_STYLE,
  projection: "globe",
  center: [0, 20],
  zoom: 1.5,
  space: { preset: "stars" },
  halo: true,
});

// Turn the globe by moving the center. The stars turn with it, as the space background follows the camera.
let previousTime = performance.now();
function orbit(time: number) {
  const seconds = (time - previousTime) / 1000;
  previousTime = time;

  // skip while the user drags or zooms the map
  if (!map.isMoving()) {
    const center = map.getCenter();
    map.setCenter([center.lng + DEGREES_PER_SECOND * seconds, center.lat]);
  }

  requestAnimationFrame(orbit);
}

requestAnimationFrame(orbit);
