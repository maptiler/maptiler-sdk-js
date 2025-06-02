import "../../src/style/style_template.css";
import { Map, MapStyle, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map")!;

const map = new Map({
  container,
  style: MapStyle.STREETS.DEFAULT,
  hash: true,
  geolocate: true,
  scaleControl: true,
  fullscreenControl: true,
  terrain: true,
  projectionControl: true,
});

document.getElementsByTagName("button")[0].addEventListener("click", () => {
  console.log(MapStyle.TONER.DEFAULT.getImageURL());
  console.log(MapStyle.TONER.DEFAULT.getExpandedStyleURL());
  map.setStyle(MapStyle.TONER.DEFAULT);
  // map.flyTo({ zoom: 12, center: [-7.39468, 39.32507] });
});
