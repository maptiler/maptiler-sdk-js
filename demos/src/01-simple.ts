import { Map, MapStyle, Marker, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map")!;

async function main() {
  const map = new Map({
    container,
    style: MapStyle.OUTDOOR.DARK,
    hash: true,
    geolocate: true,
    scaleControl: true,
    fullscreenControl: true,
    terrainControl: true,
    projectionControl: true,
    projection: "globe",
    // halo: true,
    space: true,
  });

  const styleDropDown = document.getElementById("mapstyles-picker") as HTMLOptionElement;

  styleDropDown.onchange = () => {
    map.setStyle(styleDropDown.value);
  };

  await map.onReadyAsync();

  map.setSpace({
    color: "red",
  });

  Object.keys(MapStyle).forEach((s) => {
    const styleOption = document.createElement("option");
    // @ts-expect-error we know that `id` is private.
    styleOption.value = MapStyle[s as keyof typeof MapStyle].DEFAULT.id;
    styleOption.innerHTML = s.replace("_", " ").toLowerCase();
    styleDropDown.appendChild(styleOption);
  });


  const getRandomColor = () => {
    const c = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    if (c.length < 7) {
      return getRandomColor();
    }
    return c;
  };

  window.getRandomColor = getRandomColor;

  // setInterval(() => {
  //   const styles = Object.keys(MapStyle);
  //   const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  //   const color = getRandomColor();
  //   map.setStyle(MapStyle[randomStyle as keyof typeof MapStyle].DEFAULT.id);
  //   setTimeout(() =>map.setSpace({
  //     color,
  //   }), 0)
  // }, 500);
}

main();