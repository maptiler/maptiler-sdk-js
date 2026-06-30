import { Map, MapStyle, Marker, Popup, config } from "../../src/index";
import { setupMapTilerApiKey } from "./demo-utils";

setupMapTilerApiKey({ config });

const container = document.getElementById("map")!;

async function main() {
  const map = new Map({
    container,
    style: MapStyle.STREETS.DEFAULT,
    zoom: 3,
    center: [10, 50],
  });

  await map.onLoadAsync();

  const marker = new Marker({
    
  });
  marker.setLngLat([10, 50]);
  marker.addTo(map);
}

main();
