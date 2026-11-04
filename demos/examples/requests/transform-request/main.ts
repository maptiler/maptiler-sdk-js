// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, MapStyle, config } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "../../../shared/demo-utils";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.OUTDOOR.DARK;

const container = document.getElementById("map-container") as HTMLElement;

addPerformanceStats();
setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

const map = new Map({
  container,
  style: MAP_STYLE,
  hash: true,
  transformRequest: function (url: string) {
    const reqUrl = new URL(url);
    reqUrl.searchParams.append("some-extra-param", "some-extra-value");

    return {
      url: reqUrl.href,
    };
  },
});

const styleDropDown = document.getElementById("mapstyles-picker") as HTMLSelectElement;

styleDropDown.addEventListener("change", () => {
  map.setStyle(styleDropDown.value);
});

Object.keys(MapStyle).forEach((s) => {
  const styleOption = document.createElement("option");
  // @ts-expect-error we know that `id` is private.
  styleOption.value = MapStyle[s as keyof typeof MapStyle].DEFAULT.id;
  styleOption.innerHTML = s.replace("_", " ").toLowerCase();
  styleDropDown.appendChild(styleOption);
});

// This will end up being used instead of the one defined in the constructor
map.setTransformRequest((url: string) => {
  const reqUrl = new URL(url);
  reqUrl.searchParams.append("some-extra-param-two", "some-extra-value-two");
  return {
    url: reqUrl.href,
  };
});
