import { AnimatedRouteLayer } from "../../src/custom-layers/AnimatedRouteLayer";
import { Map as MapTiler, MapStyle } from "../../src";
import fetchGeoJSON from "../tests/helpers/fetchGeojson";

async function main() {
  const map = new MapTiler({
    container: "map",
    apiKey: "DOESNT_MATTER",
    style: MapStyle.SATELLITE,
    projection: "globe",
    pitch: 30,
    bearing: 0,
    zoom: 13.5,
    center: [-5.513465218122661, 55.44452556522981],
  });

  window.__map = map;

  const geojson = await fetchGeoJSON("/animated-route.geojson");

  await map.onReadyAsync();

  map.addSource("route-source", {
    type: "geojson",
    data: geojson,
    lineMetrics: true,
  });

  map.addLayer({
    id: "route-layer",
    type: "line",
    source: "route-source",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-width": 5,
      "line-color": "#FF0000",
      "line-opacity": 0.8,
    },
  });

  const animatedRouteLayer = new AnimatedRouteLayer({
    manualUpdate: true,
    source: {
      id: "route-source",
      layerID: "route-layer",
      featureSetIndex: 0,
    },
    duration: 10000,
    iterations: 1,
    pathStrokeAnimation: {
      activeColor: [0, 255, 0, 1],
      inactiveColor: [100, 100, 100, 0.5],
    },
    cameraAnimation: {
      pathSmoothing: {
        resolution: 20,
        epsilon: 2,
      },
    },
  });

  map.addLayer(animatedRouteLayer);

  window.__pageObjects = {
    animatedRouteLayer,
  };
}

main();
