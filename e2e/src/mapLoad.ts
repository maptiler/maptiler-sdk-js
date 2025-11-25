import "../../dist/maptiler-sdk.css";
import { Map as MapTiler, MapStyle } from "../../src/index";

const map = new MapTiler({
  container: "map",
  apiKey: "DOESNT_MATTER",
  style: MapStyle.SATELLITE,
  projection: "globe",
  zoom: 3,
});

window.__map = map;
