import { Map, MapStyle, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

const container = document.getElementById("map-container") as HTMLElement;

addPerformanceStats();
setupMapTilerApiKey({ config });

const map = new Map({
  container,
  style: MapStyle.OUTDOOR.DARK,
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
