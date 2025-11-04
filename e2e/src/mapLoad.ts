import "@maptiler/sdk/dist/maptiler-sdk.css";
import { Map as MapTiler, MapStyle } from "@maptiler/sdk";

const map = new MapTiler({
  container: "map",
  apiKey: "DOESNT_MATTER",
  style: MapStyle.SATELLITE,
  projection: "globe",
  zoom: 3,
});

window.__map = map;
