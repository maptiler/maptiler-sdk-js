import { Map, MapStyle, Marker, config, getRandomColor } from "../../src/index";
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
    halo: true,
    space: true,
    zoom: 1,
  });

  const theButton = document.getElementById("the-button") as HTMLButtonElement;
  theButton.onclick = () => {
    map.setStyle(getStyle());
  };

  await map.onReadyAsync();

  // map.setSpace({
  //   color: "red",
  // });

  // setInterval(() => {
  //   const styles = Object.keys(MapStyle);
  //   const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  //   const color = getRandomColor();
  //   map.setStyle(MapStyle[randomStyle as keyof typeof MapStyle].DEFAULT.id);
  //   setTimeout(() =>map.setSpace({
  //     color,
  //   }), 0)
  // }, 500);

  const img = new Image();
  img.src = "/maptiler-sdk-logo.svg";

  img.onload = () => {
    // map.once("style.load", () => {
    map.addImage("marker", img);
  };
  // });
}

const getRandomColor = () => {
  const c = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  if (c.length < 7) {
    return getRandomColor();
  }
  return c;
};

window.getRandomColor = getRandomColor;

function getStyle() {
  const presets = ["stars", "space", "milkyway", "milkyway-subtle", "milkyway-bright", "milkyway-colored"];

  const preset = presets[Math.floor(Math.random() * presets.length)];
  console.log("preset", preset);
  return {
    version: 8,
    name: "Simple Maptiler Vector Style",
    sources: {
      maptiler_tiles: {
        type: "vector",
        url: "https://api.maptiler.com/tiles/v3/tiles.json?key=NrHbzRcISmjG1VwSD6jh",
      },
    },
    glyphs: "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=NrHbzRcISmjG1VwSD6jh",
    metadata: {
      maptiler: {
        space: {
          color: getRandomColor(),
          preset,
        },
        halo: {
          scale: 1.5,
          stops: [
            [0.2, getRandomColor()],
            [0.5, getRandomColor()],
            [1.0, "transparent"],
          ],
        },
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": getRandomColor(),
        },
      },
      {
        id: "water",
        type: "fill",
        source: "maptiler_tiles",
        "source-layer": "water",
        paint: {
          "fill-color": getRandomColor(),
        },
      },
      {
        id: "roads",
        type: "line",
        source: "maptiler_tiles",
        "source-layer": "transportation",
        paint: {
          "line-color": getRandomColor(),
          "line-width": 1,
        },
      },
      {
        id: "place-labels",
        type: "symbol",
        source: "maptiler_tiles",
        "source-layer": "place",
        layout: {
          "text-field": ["get", "name:en"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
        },
        paint: {
          "text-color": getRandomColor(),
          "text-halo-color": getRandomColor(),
          "text-halo-width": 1,
        },
      },
    ],
  };
}

main();
