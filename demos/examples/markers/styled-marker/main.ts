// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, MapStyle, Marker, config } from "@maptiler/sdk";
import { setupMapTilerApiKey } from "../../../shared/demo-utils";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAP_STYLE = MapStyle.STREETS.DEFAULT;

setupMapTilerApiKey({ config });

const map = new Map({
  container: "map",
  style: MAP_STYLE,
  center: [14.42, 50.08],
  zoom: 12,
});

const marker = new Marker({
  lngLat: [14.42, 50.08],
  shape: "circle",
  size: "m",
  innerColor: "#ffffff",
  outerColor: "#ff5a1f",
  contentColor: "#ff5a1f",
  content: "A",
});

map.addMarker(marker);
