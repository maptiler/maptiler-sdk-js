// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, MapStyle, config } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "../../../shared/demo-utils";
import { createGui } from "../../../shared/gui";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAP_STYLE = MapStyle.OUTDOOR.DARK;

const container = document.getElementById("map-container") as HTMLElement;

addPerformanceStats();
setupMapTilerApiKey({ config });

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

// Style name → style id, e.g. "outdoor" → "outdoor-v2", starting with the initial style
const styleIds = {
  [MAP_STYLE.getId()]: MAP_STYLE.getId(),
  ...Object.fromEntries(Object.entries(MapStyle).map(([name, style]) => [name.replace("_", " ").toLowerCase(), style.DEFAULT.getId()])),
};
const params = { style: MAP_STYLE.getId() };
createGui("Transform request")
  .add(params, "style", styleIds)
  .onChange((style: string) => map.setStyle(style));

// This will end up being used instead of the one defined in the constructor
map.setTransformRequest((url: string) => {
  const reqUrl = new URL(url);
  reqUrl.searchParams.append("some-extra-param-two", "some-extra-value-two");
  return {
    url: reqUrl.href,
  };
});
