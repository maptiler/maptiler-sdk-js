import "../../dist/maptiler-sdk.css";
import { Map as MapTiler, Language } from "../../src/index";

async function main() {
  const qp = new URLSearchParams(window.location.search);

  const disableRTL = qp.get("disable-rtl") === "true" ? true : false;

  const map = new MapTiler({
    container: "map",
    apiKey: "DOESNT_MATTER",
    language: Language.ARABIC,
    rtlTextPlugin: disableRTL ? false : undefined,
    zoom: 7.5,
    center: [43.648, 33.15],
    terrain: false,
  });

  await map.onReadyAsync();

  map.addSource("places-source", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [43.648, 33.15] },
          properties: { name: "!يلا حبيبي" },
        },
      ],
    },
  });

  map.addLayer({
    id: "places-layer",
    type: "symbol",
    source: "places-source",
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 100,
    },
    paint: {
      "text-color": "red",
    }
  });

  window.__map = map;
}

main();
