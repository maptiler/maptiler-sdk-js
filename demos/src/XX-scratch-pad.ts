// import "../dist/assets/index-CINxMRFr.css";
import { Map, MapStyle, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map") as HTMLDivElement;

async function main() {

  // const hash = window.location.hash;
  // const [
  //   zoom,
  //   lat,
  //   lng,
  //   bearing,
  //   pitch,
  // ] = hash.replace("#", "").split("/").map(Number);

  const map = new Map({
    container,
    style: MapStyle.BASIC.DEFAULT,
    hash: true,

    // center: [lng, lat],
    // zoom,
    // bearing,
    // pitch,
    // geolocate: true,
    scaleControl: true,
    fullscreenControl: true,
    space: true,
    halo: true,
    terrain: true,
    projectionControl: true,
  });


  await map.onReadyAsync();

  // const img = new Image();
  // img.src = "/maptiler-sdk-logo.svg";

  // img.onload = () => {
  // map.once("style.load", () => {
    // map.addImage("marker", img);
  // };
  // });
  map.resize();
  document.getElementsByClassName("button")[0].addEventListener("click", () => {
    map.setStyle(MapStyle.TONER.DEFAULT);
    map.flyTo({ zoom: 12, center: [-7.39468, 39.32507] });
  });
}

main();