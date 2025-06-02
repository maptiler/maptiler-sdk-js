import { Map, MapStyle, config } from "../../src";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const map = new Map({
  container: document.getElementById("map")!,
  style: MapStyle.SATELLITE,
  hash: false,
  geolocate: true,
  scaleControl: true,
  fullscreenControl: true,
  terrainControl: true,
  zoom: 1,
  projection: "globe",
  center: [0, -20],
  space: true, // these can also be config objects CubemapLayerConstructorOptions
  halo: true, // same here, RadialGradientLayerConstructorOptions
});

const imageOptions = [
  ["starmap_2020", "jpg"],
  ["dummy", "jpg"],
  ["transparent", "png"],
];

let currentIndex = 0;
let currentHaloIndex = 0;

const randomBgBtn = document.getElementById("random-bg") as HTMLButtonElement;
randomBgBtn.addEventListener("click", () => {
  const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  const [randomImage, suffix] = imageOptions[currentIndex] as [string, "jpg" | "png"];

  currentIndex = (currentIndex + 1) % imageOptions.length;

  map.setSpace({
    color: randomColor, // or any other color
    path: {
      baseUrl: `spacebox/${randomImage}`, // or any other spacebox path
      format: suffix, //defaults to png
    },
  });
});

const stopsSelection: { stops: [number, string][]; scale: number }[] = [
  {
    scale: 1.0,
    stops: [
      [0.0, "rgba(176, 208, 240, 1)"],
      [0.1, "rgba(98, 168, 229, 0.3)"],
      [0.2, "rgba(98, 168, 229, 0.0)"],
    ],
  },
  {
    scale: 1.0,
    stops: [
      [0.0, "rgba(135,206,250,1)"],
      [0.5, "rgba(0,0,250,0.75)"],
      [0.75, "rgba(250,0,0,0.0)"],
    ],
  },
  {
    scale: 1.0,
    stops: [
      [0.0, "rgba(255, 0, 0, 1)"],
      [0.5, "rgba(0, 255, 0, 1)"],
      [0.75, "rgba(0, 0, 255, 1)"],
      [1.0, "transparent"],
    ],
  },
  {
    scale: 1.0,
    stops: [
      [0.0, "transparent"],
      [0.1, "transparent"],
      [0.1, "rgb(96, 0, 226)"],
      [0.2, "rgb(96, 0, 226)"],
      [0.2, "transparent"],
      [0.3, "transparent"],
      [0.3, "rgb(247, 32, 23)"],
      [0.4, "rgb(247, 32, 23)"],
      [0.4, "transparent"],
      [0.5, "transparent"],
      [0.5, "rgb(254, 154, 9)"],
      [0.6, "rgb(254, 154, 9)"],
      [0.6, "transparent"],
      [0.7, "transparent"],
      [0.7, "rgb(19, 144, 183)"],
      [0.8, "rgb(19, 144, 183)"],
      [0.8, "transparent"],
      [1.0, "transparent"],
    ],
  },
];

const randomHaloBtn = document.getElementById("random-halo") as HTMLButtonElement;
randomHaloBtn.addEventListener("click", () => {
  currentHaloIndex = (currentHaloIndex + 1) % stopsSelection.length;
  const { scale, stops } = stopsSelection[currentHaloIndex];
  map.setHalo({
    scale, // Random scale between 1 and 6
    stops,
  });
});
