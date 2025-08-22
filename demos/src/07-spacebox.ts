import { CubemapDefinition, Map, MapStyle, config } from "../../src";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

function main() {
  addPerformanceStats();
  setupMapTilerApiKey({ config });

  const map = new Map({
    container: document.getElementById("map")!,
    style: MapStyle.SATELLITE.DEFAULT,
    hash: false,
    geolocate: true,
    scaleControl: true,
    fullscreenControl: true,
    terrainControl: true,
    zoom: 1,
    projection: "globe",
    center: [0, -20],
    space: true, // these can also be config objects CubemapLayerConstructorOptions
    halo: true,// same here, RadialGradientLayerConstructorOptions
  });

  let currentHaloIndex = 0;

  // you can also disable animations by calling the following methods
  // map.disableHaloAnimations();
  // map.disableSpaceAnimations();

  const randomBgBtn = document.getElementById("bg-color") as HTMLButtonElement;
  randomBgBtn.addEventListener("input", (e: Event) => {
    const input = e.target as HTMLInputElement;
    const color = input.value;
    console.log("Setting background color to:", color);
    map.setSpace({
      ...map.getSpace()?.getConfig(),
      color, // or any other color
    });
    console.log("Config: ", map.getSpace()?.getConfig());
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

  const configs: (CubemapDefinition & { name: string })[] = [
    { preset: "stars", name: "Using Preset: `stars`" },
    { preset: "space", name: "Using Preset: `space`" },
    { preset: "milkyway", name: "Using Preset: `milkyway`" },
    { preset: "milkyway-subtle", name: "Using Preset: `milkyway-subtle`" },
    { preset: "milkyway-bright", name: "Using Preset: `milkyway-bright`" },
    { path: { baseUrl: "/spacebox/maptiler-transparent", format: "png" }, name: "Using Path: `/spacebox/maptiler-transparent`" },
    {
      faces: {
        pX: "/spacebox/scene/front.png",
        nX: "/spacebox/scene/back.png",
        pZ: "/spacebox/scene/left.png",
        nZ: "/spacebox/scene/right.png",
        nY: "/spacebox/scene/top.png",
        pY: "/spacebox/scene/bottom.png",
      },
      name: "Using Faces Object: `/spacebox/scene/*`",
    },
  ];

  const presetSelect = document.getElementById("preset-select") as HTMLSelectElement;
  configs.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.name;
    option.textContent = preset.name;
    presetSelect.appendChild(option);
  });

  presetSelect.addEventListener("change", (e: Event) => {
    const select = e.target as HTMLSelectElement;
    const { value } = select;
    const config = configs.find((c) => c.name === value);
    if (config) {
      console.log("Setting spacebox config:", config);
      const currentConfig = map.getSpace()?.getConfig();
      map.setSpace({
        ...config,
        color: currentConfig?.color,
      } as CubemapDefinition);
    }
    console.log("Current config:", map.getSpace()?.getConfig());
  });
}

main();
