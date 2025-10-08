import { Map, MapStyle, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map")!;

async function main() {
  const map = new Map({
    container,
    style: MapStyle.OUTDOOR.DARK,
    hash: true,
    geolocate: false,
    scaleControl: true,
    fullscreenControl: true,
    terrainControl: true,
    projectionControl: true,
    projection: "globe",
    space: true,
    halo: true,
    zoom: 1,
  });

  const styleDropDown = document.getElementById("mapstyles-picker") as HTMLOptionElement;

  styleDropDown.onchange = () => {
    map.setStyle(styleDropDown.value);
  };

  await map.onReadyAsync();

  Object.keys(MapStyle).forEach((s) => {
    const styleOption = document.createElement("option");
    // @ts-expect-error we know that `id` is private.
    styleOption.value = MapStyle[s as keyof typeof MapStyle].DEFAULT.id;
    styleOption.innerHTML = s.replace("_", " ").toLowerCase();
    styleDropDown.appendChild(styleOption);
  });
}

main();