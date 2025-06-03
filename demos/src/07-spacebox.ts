import { Map, MapStyle, config } from "../../src";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

function main() {
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

  let currentHaloIndex = 0;

  const randomBgBtn = document.getElementById("bg-color") as HTMLButtonElement;
  randomBgBtn.addEventListener("input", (e: Event) => {
    const input = e.target as HTMLInputElement;
    const color = input.value;
    console.log("Setting background color to:", color);
    map.setSpace({
      color, // or any other color
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

  const presets = ["stars", "space", "milkyway", "milkyway-subtle", "milkyway-bright"];

  const presetSelect = document.getElementById("preset-select") as HTMLSelectElement;
  presets.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset;
    option.textContent = preset.charAt(0).toUpperCase() + preset.slice(1);
    presetSelect.appendChild(option);
  });
  presetSelect.addEventListener("change", (e: Event) => {
    const select = e.target as HTMLSelectElement;
    const preset = select.value;
    console.log("Setting space preset to:", preset);
    map.setSpace({
      preset, // or any other preset
    });
  });

  // const randomPresetBtn = document.getElementById("random-preset") as HTMLButtonElement;
  // randomPresetBtn.addEventListener("click", () => {
  //   currentPresetIndex = (currentPresetIndex + 1) % presets.length;
  //   const preset = presets[currentPresetIndex];
  //   map.setSpace({
  //     preset,
  //   });
  // });
}

main();
